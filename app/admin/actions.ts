"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_EMAIL } from "@/lib/admin";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, parseAmount } from "@/lib/budget";
import { createClient, requireAdmin } from "@/lib/supabase/server";

export type FormState = { error?: string; ok?: boolean };

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const optional = (fd: FormData, key: string) => text(fd, key) || null;

function refresh(concertId?: string) {
  revalidatePath("/admin/concerts");
  if (concertId) revalidatePath(`/admin/concerts/${concertId}`);
}

// ---------- Session ----------

export async function signIn(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = text(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const wrong = { error: "That email and password don't match. Please try again." };

  if (!email || !password) return { error: "Enter your email and password." };
  // Other emails are rejected before Supabase is even asked.
  if (email !== ADMIN_EMAIL) return wrong;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return wrong;

  redirect("/admin/concerts");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin");
}

// ---------- Concerts ----------

export async function saveConcert(_prev: FormState, fd: FormData): Promise<FormState> {
  const supabase = await requireAdmin();
  const id = optional(fd, "id");
  const name = text(fd, "name");
  const budget = parseAmount(fd.get("budget"));

  if (!name) return { error: "Give the concert a name." };
  if (Number.isNaN(budget)) return { error: "The budget limit should be a number, like 1,500,000." };

  const row = {
    name,
    event_date: optional(fd, "event_date"),
    venue: optional(fd, "venue"),
    city: optional(fd, "city"),
    budget,
    notes: optional(fd, "notes"),
  };

  if (id) {
    const { error } = await supabase.from("concerts").update(row).eq("id", id);
    if (error) return { error: "Couldn't save the changes. Check your connection and try again." };
    refresh(id);
    return { ok: true };
  }

  const { data, error } = await supabase.from("concerts").insert(row).select("id").single();
  if (error || !data) return { error: "Couldn't add the concert. Check your connection and try again." };
  refresh();
  redirect(`/admin/concerts/${data.id}`);
}

export async function deleteConcert(fd: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("concerts").delete().eq("id", text(fd, "id"));
  refresh();
  redirect("/admin/concerts");
}

// ---------- Income and expenses ----------

export async function saveEntry(_prev: FormState, fd: FormData): Promise<FormState> {
  const supabase = await requireAdmin();
  const id = optional(fd, "id");
  const concertId = text(fd, "concert_id");
  const kind = text(fd, "kind");
  const category = text(fd, "category");
  const amount = parseAmount(fd.get("amount"));

  if (kind !== "expense" && kind !== "income") return { error: "Something went wrong. Reload the page and try again." };
  const categories: readonly string[] = kind === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  if (!categories.includes(category)) return { error: "Pick a category." };
  if (amount === null) return { error: "Enter the amount." };
  if (Number.isNaN(amount)) return { error: "The amount should be a number, like 250,000." };

  const row = {
    concert_id: concertId,
    kind,
    category,
    label: optional(fd, "label"),
    amount,
    settled: fd.get("settled") === "on",
    notes: optional(fd, "notes"),
  };

  const { error } = id
    ? await supabase.from("budget_entries").update(row).eq("id", id)
    : await supabase.from("budget_entries").insert(row);
  if (error) return { error: "Couldn't save. Check your connection and try again." };

  refresh(concertId);
  return { ok: true };
}

export async function deleteEntry(fd: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("budget_entries").delete().eq("id", text(fd, "id"));
  refresh(text(fd, "concert_id"));
}

export async function setSettled(fd: FormData) {
  const supabase = await requireAdmin();
  await supabase
    .from("budget_entries")
    .update({ settled: fd.get("settled") === "true" })
    .eq("id", text(fd, "id"));
  refresh(text(fd, "concert_id"));
}

// ---------- Ticket categories ----------

export async function saveTier(_prev: FormState, fd: FormData): Promise<FormState> {
  const supabase = await requireAdmin();
  const id = optional(fd, "id");
  const concertId = text(fd, "concert_id");
  const name = text(fd, "name");
  const price = parseAmount(fd.get("price"));
  const seats = parseAmount(fd.get("seats"));
  const sold = parseAmount(fd.get("sold"));

  if (!name) return { error: "Name the ticket type, for example VIP." };
  if (price === null || Number.isNaN(price)) return { error: "Enter the ticket price." };
  if (Number.isNaN(seats) || Number.isNaN(sold)) return { error: "Seats and tickets sold should be whole numbers." };

  const row = {
    concert_id: concertId,
    name,
    price,
    seats: seats === null ? null : Math.floor(seats),
    sold: sold === null ? 0 : Math.floor(sold),
  };

  const { error } = id
    ? await supabase.from("ticket_categories").update(row).eq("id", id)
    : await supabase.from("ticket_categories").insert(row);
  if (error) return { error: "Couldn't save. Check your connection and try again." };

  refresh(concertId);
  return { ok: true };
}

export async function deleteTier(fd: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("ticket_categories").delete().eq("id", text(fd, "id"));
  refresh(text(fd, "concert_id"));
}
