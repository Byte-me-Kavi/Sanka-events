// Shared budget types, categories and maths. Used by server pages and client components alike.

export type Concert = {
  id: string;
  name: string;
  event_date: string | null;
  venue: string | null;
  city: string | null;
  budget: number | null;
  notes: string | null;
};

export type TicketCategory = {
  id: string;
  concert_id: string;
  name: string;
  price: number;
  seats: number | null;
  sold: number;
};

export type EntryKind = "expense" | "income";

export type BudgetEntry = {
  id: string;
  concert_id: string;
  kind: EntryKind;
  category: string;
  label: string | null;
  amount: number;
  settled: boolean;
  notes: string | null;
};

export const EXPENSE_CATEGORIES = [
  "Artists",
  "Band & musicians",
  "Sound",
  "Lighting",
  "Stage & LED walls",
  "Hall / venue",
  "Advertising",
  "Printing & tickets",
  "Transport",
  "Food & hospitality",
  "Hotels",
  "Security",
  "Crew & staff",
  "Permits & tax",
  "Other",
] as const;

export const INCOME_CATEGORIES = ["Sponsors", "Food & stalls", "Merchandise", "Donations", "Other"] as const;

// Income from ticket categories is shown under this name next to manual income entries.
export const TICKET_SALES = "Ticket sales";

export const TICKET_PRESETS = ["VVIP", "VIP", "Gold", "Silver", "Balcony", "General"];

export function summarize(entries: Pick<BudgetEntry, "kind" | "amount" | "settled">[], tiers: Pick<TicketCategory, "price" | "sold" | "seats">[]) {
  let otherIncome = 0;
  let spending = 0;
  let toPay = 0;
  let toCollect = 0;
  for (const e of entries) {
    const amount = Number(e.amount);
    if (e.kind === "income") {
      otherIncome += amount;
      if (!e.settled) toCollect += amount;
    } else {
      spending += amount;
      if (!e.settled) toPay += amount;
    }
  }

  let ticketIncome = 0;
  let ticketsSold = 0;
  let seats = 0;
  let soldOutIncome = 0;
  for (const t of tiers) {
    const price = Number(t.price);
    ticketIncome += price * t.sold;
    ticketsSold += t.sold;
    seats += t.seats ?? 0;
    soldOutIncome += price * Math.max(t.seats ?? 0, t.sold);
  }

  const income = ticketIncome + otherIncome;
  return {
    income,
    ticketIncome,
    otherIncome,
    spending,
    profit: income - spending,
    toPay,
    toCollect,
    ticketsSold,
    seats,
    soldOutIncome,
  };
}

export type Summary = ReturnType<typeof summarize>;

// Sum amounts per category, biggest first.
export function byCategory(entries: Pick<BudgetEntry, "category" | "amount">[]) {
  const totals = new Map<string, number>();
  for (const e of entries) totals.set(e.category, (totals.get(e.category) ?? 0) + Number(e.amount));
  return [...totals].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}

// Fixed en-US grouping so server and browser render identical text.
export function money(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}Rs. ${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function moneyShort(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${+(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${+(abs / 1_000).toFixed(0)}K`;
  return `${sign}${abs}`;
}

// Accepts what people actually type: "150,000", "Rs 2500", " 1200.50 ".
export function parseAmount(value: FormDataEntryValue | null) {
  const cleaned = String(value ?? "").replace(/rs\.?|,|\s/gi, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
}

// Concerts are in Sri Lanka, so "today" is Colombo's date regardless of where the server runs.
export function todayInColombo() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
}

export type ConcertStatus = { kind: "tbd" | "upcoming" | "today" | "past"; label: string };

export function concertStatus(date: string | null, today = todayInColombo()): ConcertStatus {
  if (!date) return { kind: "tbd", label: "Date not set" };
  if (date === today) return { kind: "today", label: "Today" };
  const days = Math.round((Date.parse(date) - Date.parse(today)) / 86_400_000);
  if (days > 0) return { kind: "upcoming", label: days === 1 ? "Tomorrow" : `In ${days} days` };
  return { kind: "past", label: "Finished" };
}

export function formatDate(date: string | null) {
  if (!date) return "Date not set";
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
