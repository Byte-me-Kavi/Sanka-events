import Link from "next/link";
import { CalendarBlank, MapPin, MusicNotes, Plus } from "@phosphor-icons/react/ssr";
import { concertStatus, formatDate, money, summarize, type BudgetEntry, type Concert, type Summary, type TicketCategory } from "@/lib/budget";
import { IncomeSpendChart } from "./Charts";
import { ConcertButton } from "./ConcertSheet";
import { ReportButton } from "./ReportSheet";
import { StatTiles } from "./Stats";

export type ConcertRow = Concert & {
  budget_entries: Pick<BudgetEntry, "kind" | "amount" | "settled">[];
  ticket_categories: Pick<TicketCategory, "price" | "sold" | "seats">[];
};

type Card = Concert & { status: ReturnType<typeof concertStatus>; summary: Summary };

export function ConcertsView({ rows, today }: { rows: ConcertRow[]; today: string }) {
  const concerts: Card[] = rows.map((c) => ({
    ...c,
    status: concertStatus(c.event_date, today),
    summary: summarize(c.budget_entries, c.ticket_categories),
  }));

  if (concerts.length === 0) {
    return (
      <div className="adm-empty">
        <span className="adm-empty-icon">
          <MusicNotes size={36} weight="duotone" aria-hidden />
        </span>
        <h1>Plan your first concert</h1>
        <p>Add a concert, then record what you spend and what comes in. You&apos;ll see the profit straight away.</p>
        <ConcertButton className="adm-btn adm-btn--primary adm-btn--lg">
          <Plus size={18} weight="bold" aria-hidden />
          Add a concert
        </ConcertButton>
      </div>
    );
  }

  const upcoming = concerts.filter((c) => c.status.kind !== "past");
  const past = concerts.filter((c) => c.status.kind === "past").reverse();
  const total = summarize(
    rows.flatMap((c) => c.budget_entries),
    rows.flatMap((c) => c.ticket_categories),
  );
  // Chart: up to the 8 most recent concerts that have any money recorded, oldest at the top.
  const chartData = concerts
    .filter((c) => c.summary.income > 0 || c.summary.spending > 0)
    .slice(-8)
    .map((c) => ({ name: c.name, income: c.summary.income, spending: c.summary.spending }));

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Concerts</h1>
          <p className="adm-lede">Totals for all {concerts.length} concerts</p>
        </div>
        <div className="adm-head-actions">
          <ReportButton />
          <ConcertButton>
            <Plus size={18} weight="bold" aria-hidden />
            Add concert
          </ConcertButton>
        </div>
      </div>

      <StatTiles s={total} />

      {chartData.length > 0 && (
        <section className="adm-card" aria-labelledby="chart-title">
          <h2 id="chart-title" className="adm-card-title">
            Money in vs money out
          </h2>
          <IncomeSpendChart data={chartData} />
        </section>
      )}

      <ConcertList title="Upcoming" concerts={upcoming} empty="No upcoming concerts. Add one to start planning." />
      <ConcertList title="Past" concerts={past} empty="Finished concerts will show here." />
    </>
  );
}

function ConcertList({ title, concerts, empty }: { title: string; concerts: Card[]; empty: string }) {
  return (
    <section className="adm-section">
      <h2 className="adm-section-title">
        {title} <span className="adm-count">{concerts.length}</span>
      </h2>
      {concerts.length === 0 ? (
        <p className="adm-empty-line">{empty}</p>
      ) : (
        <ul className="adm-concerts">
          {concerts.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/concerts/${c.id}`} className="adm-concert">
                <span className="adm-concert-top">
                  <span className={`adm-badge adm-badge--${c.status.kind}`}>{c.status.label}</span>
                </span>
                <span className="adm-concert-name">{c.name}</span>
                <span className="adm-concert-meta">
                  <span>
                    <CalendarBlank size={16} aria-hidden />
                    {formatDate(c.event_date)}
                  </span>
                  {(c.venue || c.city) && (
                    <span>
                      <MapPin size={16} aria-hidden />
                      {[c.venue, c.city].filter(Boolean).join(", ")}
                    </span>
                  )}
                </span>
                <span className="adm-concert-money">
                  <span>
                    <span className="adm-mini-label">Money in</span>
                    <span className="adm-mini-value">{money(c.summary.income)}</span>
                  </span>
                  <span>
                    <span className="adm-mini-label">Money out</span>
                    <span className="adm-mini-value">{money(c.summary.spending)}</span>
                  </span>
                  <span>
                    <span className="adm-mini-label">{c.summary.profit < 0 ? "Loss" : "Profit"}</span>
                    <span className={`adm-mini-value ${c.summary.profit < 0 ? "is-loss" : c.summary.profit > 0 ? "is-profit" : ""}`}>
                      {money(Math.abs(c.summary.profit))}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
