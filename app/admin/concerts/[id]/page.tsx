import { notFound } from "next/navigation";
import type { BudgetEntry, Concert, TicketCategory } from "@/lib/budget";
import { requireAdmin } from "@/lib/supabase/server";
import { ConcertView } from "../../_components/ConcertView";

export default async function ConcertPage({ params }: PageProps<"/admin/concerts/[id]">) {
  const { id } = await params;
  const supabase = await requireAdmin();

  const [concertRes, entriesRes, tiersRes] = await Promise.all([
    supabase.from("concerts").select("id, name, event_date, venue, city, budget, notes").eq("id", id).maybeSingle<Concert>(),
    supabase
      .from("budget_entries")
      .select("id, concert_id, kind, category, label, amount, settled, notes")
      .eq("concert_id", id)
      .order("created_at")
      .returns<BudgetEntry[]>(),
    supabase
      .from("ticket_categories")
      .select("id, concert_id, name, price, seats, sold")
      .eq("concert_id", id)
      .order("price", { ascending: false })
      .returns<TicketCategory[]>(),
  ]);

  if (!concertRes.data) notFound();

  return <ConcertView concert={concertRes.data} entries={entriesRes.data ?? []} tiers={tiersRes.data ?? []} />;
}
