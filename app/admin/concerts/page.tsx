import { todayInColombo } from "@/lib/budget";
import { requireAdmin } from "@/lib/supabase/server";
import { ConcertsView, type ConcertRow } from "../_components/ConcertsView";

export default async function ConcertsPage() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("concerts")
    .select("id, name, event_date, venue, city, budget, notes, budget_entries(kind, amount, settled), ticket_categories(price, sold, seats)")
    .order("event_date", { ascending: true, nullsFirst: true })
    .returns<ConcertRow[]>();

  if (error) {
    return (
      <div className="adm-empty">
        <h1>Couldn&apos;t load your concerts</h1>
        <p>Check your internet connection and refresh the page.</p>
      </div>
    );
  }

  return <ConcertsView rows={data} today={todayInColombo()} />;
}
