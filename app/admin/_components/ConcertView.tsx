import Link from "next/link";
import { ArrowLeft, CalendarBlank, DownloadSimple, MapPin, PencilSimple, Plus, Ticket, Warning } from "@phosphor-icons/react/ssr";
import {
  byCategory,
  concertStatus,
  formatDate,
  money,
  summarize,
  TICKET_SALES,
  type BudgetEntry,
  type Concert,
  type TicketCategory,
} from "@/lib/budget";
import { CategoryBars, INCOME_COLOR, SPENDING_COLOR } from "./Charts";
import { ConcertButton } from "./ConcertSheet";
import { EntryButton, EntryRow } from "./EntrySheet";
import { StatTiles } from "./Stats";
import { TierButton, TierRow } from "./TierSheet";

export function ConcertView({ concert, entries, tiers }: { concert: Concert; entries: BudgetEntry[]; tiers: TicketCategory[] }) {
  const expenses = entries.filter((e) => e.kind === "expense");
  const incomes = entries.filter((e) => e.kind === "income");
  const s = summarize(entries, tiers);
  const status = concertStatus(concert.event_date);

  const spendByCategory = byCategory(expenses);
  const incomeBySource = byCategory([...incomes, { category: TICKET_SALES, amount: s.ticketIncome }]).filter((r) => r.amount > 0);

  // Expenses grouped under their category, biggest category first.
  const expenseGroups = spendByCategory.map((g) => ({ ...g, items: expenses.filter((e) => e.category === g.category) }));

  const budget = concert.budget == null ? null : Number(concert.budget);
  const budgetPct = budget ? Math.round((s.spending / budget) * 100) : null;

  return (
    <>
      <Link href="/admin/concerts" className="adm-back">
        <ArrowLeft size={16} aria-hidden />
        All concerts
      </Link>

      <div className="adm-page-head">
        <div>
          <span className={`adm-badge adm-badge--${status.kind}`}>{status.label}</span>
          <h1>{concert.name}</h1>
          <p className="adm-concert-meta">
            <span>
              <CalendarBlank size={16} aria-hidden />
              {formatDate(concert.event_date)}
            </span>
            {(concert.venue || concert.city) && (
              <span>
                <MapPin size={16} aria-hidden />
                {[concert.venue, concert.city].filter(Boolean).join(", ")}
              </span>
            )}
          </p>
        </div>
        <div className="adm-head-actions">
          <a href={`/admin/report?concert=${concert.id}`} className="adm-btn adm-btn--ghost" download>
            <DownloadSimple size={18} aria-hidden />
            PDF
          </a>
          <ConcertButton concert={concert} className="adm-btn adm-btn--ghost">
            <PencilSimple size={18} aria-hidden />
            Edit
          </ConcertButton>
        </div>
      </div>

      {concert.notes && <p className="adm-notes">{concert.notes}</p>}

      <StatTiles s={s} />

      {budget !== null && budgetPct !== null && (
        <section className={`adm-card adm-budget ${budgetPct > 100 ? "is-over" : budgetPct >= 85 ? "is-close" : ""}`}>
          <div className="adm-budget-head">
            <h2 className="adm-card-title">Spending limit</h2>
            <span>
              <strong>{money(s.spending)}</strong> of {money(budget)}
            </span>
          </div>
          <span className="adm-meter adm-meter--lg" role="img" aria-label={`${budgetPct}% of the spending limit used`}>
            <span style={{ width: `${Math.min(budgetPct, 100)}%` }} />
          </span>
          <p className="adm-budget-note">
            {budgetPct > 100 ? (
              <>
                <Warning size={16} weight="fill" aria-hidden /> Over the limit by {money(s.spending - budget)}
              </>
            ) : budgetPct >= 85 ? (
              <>
                <Warning size={16} weight="fill" aria-hidden /> Nearly at the limit, {money(budget - s.spending)} left
              </>
            ) : (
              <>{money(budget - s.spending)} left to spend</>
            )}
          </p>
        </section>
      )}

      {(spendByCategory.length > 0 || incomeBySource.length > 0) && (
        <div className="adm-chart-grid">
          {spendByCategory.length > 0 && (
            <section className="adm-card">
              <h2 className="adm-card-title">Where the money goes</h2>
              <CategoryBars data={spendByCategory} color={SPENDING_COLOR} label="Spent" />
            </section>
          )}
          {incomeBySource.length > 0 && (
            <section className="adm-card">
              <h2 className="adm-card-title">Where the money comes from</h2>
              <CategoryBars data={incomeBySource} color={INCOME_COLOR} label="Income" />
            </section>
          )}
        </div>
      )}

      <div className="adm-ledger">
        <section className="adm-section" aria-labelledby="tickets-title">
          <div className="adm-section-head">
            <h2 id="tickets-title" className="adm-section-title">
              Ticket sales <span className="adm-section-total">{money(s.ticketIncome)}</span>
            </h2>
            <TierButton concertId={concert.id}>
              <Plus size={16} weight="bold" aria-hidden />
              Ticket type
            </TierButton>
          </div>
          {tiers.length === 0 ? (
            <p className="adm-empty-line">Add each ticket type (VIP, Gold, General…) with its price and how many you&apos;ve sold.</p>
          ) : (
            <>
              <ul className="adm-list">
                {tiers.map((t) => (
                  <TierRow key={t.id} tier={t} />
                ))}
              </ul>
              <p className="adm-foot">
                <Ticket size={16} aria-hidden />
                {s.ticketsSold.toLocaleString("en-US")} tickets sold
                {s.seats > 0 && ` of ${s.seats.toLocaleString("en-US")}`}
                {s.soldOutIncome > s.ticketIncome && ` · ${money(s.soldOutIncome)} if every seat sells`}
              </p>
            </>
          )}
        </section>

        <section className="adm-section" aria-labelledby="income-title">
          <div className="adm-section-head">
            <h2 id="income-title" className="adm-section-title">
              Other income <span className="adm-section-total">{money(s.otherIncome)}</span>
            </h2>
            <EntryButton concertId={concert.id} kind="income">
              <Plus size={16} weight="bold" aria-hidden />
              Income
            </EntryButton>
          </div>
          {incomes.length === 0 ? (
            <p className="adm-empty-line">Sponsors, food stalls and anything else that brings money in.</p>
          ) : (
            <ul className="adm-list">
              {incomes.map((e) => (
                <EntryRow key={e.id} entry={e} showCategory />
              ))}
            </ul>
          )}
        </section>

        <section className="adm-section adm-section--wide" aria-labelledby="expenses-title">
          <div className="adm-section-head">
            <h2 id="expenses-title" className="adm-section-title">
              Expenses <span className="adm-section-total">{money(s.spending)}</span>
            </h2>
            <EntryButton concertId={concert.id} kind="expense">
              <Plus size={16} weight="bold" aria-hidden />
              Expense
            </EntryButton>
          </div>
          {expenseGroups.length === 0 ? (
            <p className="adm-empty-line">Artists, band, sound, lights, the hall: add every cost here.</p>
          ) : (
            <div className="adm-groups">
              {expenseGroups.map((g) => (
                <div key={g.category} className="adm-group">
                  <h3 className="adm-group-title">
                    {g.category}
                    <span>{money(g.amount)}</span>
                  </h3>
                  <ul className="adm-list">
                    {g.items.map((e) => (
                      <EntryRow key={e.id} entry={e} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Phones: the add buttons stay within thumb reach */}
      <nav className="adm-quick" aria-label="Quick add">
        <EntryButton concertId={concert.id} kind="expense" className="adm-quick-btn">
          <Plus size={18} weight="bold" aria-hidden />
          Expense
        </EntryButton>
        <EntryButton concertId={concert.id} kind="income" className="adm-quick-btn">
          <Plus size={18} weight="bold" aria-hidden />
          Income
        </EntryButton>
        <TierButton concertId={concert.id} className="adm-quick-btn">
          <Plus size={18} weight="bold" aria-hidden />
          Tickets
        </TierButton>
      </nav>
    </>
  );
}
