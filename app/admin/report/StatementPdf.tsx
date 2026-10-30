import { Document, Image, Page, StyleSheet, Text, View, type Styles } from "@react-pdf/renderer";
import { contact } from "@/app/content";
import {
  byCategory,
  formatDate,
  money,
  type BudgetEntry,
  type Concert,
  type Summary,
  type TicketCategory,
} from "@/lib/budget";

export type ConcertReport = { concert: Concert; tiers: TicketCategory[]; entries: BudgetEntry[]; summary: Summary };

export type StatementProps = {
  logo: Buffer;
  heading: string;
  period: string;
  generated: string;
  total: Summary;
  concerts: ConcertReport[];
  // Range statements list every concert in one table, then optionally give each its own detail pages.
  mode: "single" | "range";
  details: boolean;
};

const c = {
  ink: "#141014",
  ink2: "#4d4650",
  ink3: "#857d88",
  line: "#e3dde3",
  soft: "#f7f4f1",
  gold: "#a77e33",
  good: "#167a4a",
  bad: "#b42828",
};

const s = StyleSheet.create({
  page: { paddingTop: 97, paddingBottom: 56, paddingHorizontal: 0, fontFamily: "Helvetica", fontSize: 9.5, color: c.ink },
  band: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: "#000", paddingVertical: 18, paddingHorizontal: 36, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { width: 110, height: 39 },
  bandRight: { alignItems: "flex-end" },
  bandTitle: { color: "#fff1cf", fontFamily: "Helvetica-Bold", fontSize: 13, letterSpacing: 2 },
  bandSub: { color: "#c9a25a", fontSize: 9, marginTop: 3 },
  body: { paddingHorizontal: 36 },
  h1: { fontFamily: "Helvetica-Bold", fontSize: 18, marginTop: 22, marginBottom: 4 },
  meta: { color: c.ink2, fontSize: 9.5, marginBottom: 2 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 11, marginTop: 18, marginBottom: 6 },
  boxes: { flexDirection: "row", gap: 8, marginTop: 14 },
  box: { flex: 1, borderWidth: 1, borderColor: c.line, borderRadius: 4, padding: 9 },
  boxLabel: { fontSize: 8, color: c.ink3, textTransform: "uppercase", letterSpacing: 0.6 },
  boxValue: { fontFamily: "Helvetica-Bold", fontSize: 13, marginTop: 4 },
  boxNote: { fontSize: 8, color: c.ink2, marginTop: 3 },
  table: { borderTopWidth: 1, borderTopColor: c.ink },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: c.line, paddingVertical: 5 },
  th: { fontFamily: "Helvetica-Bold", fontSize: 8, color: c.ink2, textTransform: "uppercase", letterSpacing: 0.4 },
  groupRow: { flexDirection: "row", backgroundColor: c.soft, paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: c.line },
  totalRow: { flexDirection: "row", paddingVertical: 6, borderTopWidth: 1, borderTopColor: c.ink },
  bold: { fontFamily: "Helvetica-Bold" },
  cell: { paddingHorizontal: 4 },
  right: { textAlign: "right" },
  muted: { color: c.ink3 },
  result: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, padding: 10, borderRadius: 4 },
  notes: { marginTop: 14, padding: 9, backgroundColor: c.soft, color: c.ink2 },
  footer: { position: "absolute", bottom: 22, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: c.ink3, borderTopWidth: 0.5, borderTopColor: c.line, paddingTop: 8 },
  empty: { marginTop: 30, color: c.ink2, fontSize: 11 },
});

export function StatementPdf(props: StatementProps) {
  const { concerts, mode, details } = props;
  return (
    <Document title={`SANKA ${props.heading}`} author="SANKA" creator="SANKA Backstage">
      {mode === "range" ? (
        <Sheet {...props}>
          <Text style={s.h1}>{props.heading}</Text>
          <Text style={s.meta}>{props.period}</Text>
          <Text style={s.meta}>
            {concerts.length} concert{concerts.length === 1 ? "" : "s"}
          </Text>
          {concerts.length === 0 ? (
            <Text style={s.empty}>No concerts are dated in this period.</Text>
          ) : (
            <>
              <SummaryBoxes sum={props.total} />
              <Text style={s.h2}>Concerts</Text>
              <RangeTable concerts={concerts} total={props.total} />
              <Result profit={props.total.profit} />
            </>
          )}
        </Sheet>
      ) : null}
      {(mode === "single" || details) &&
        concerts.map((r) => (
          <Sheet key={r.concert.id} {...props}>
            <ConcertDetail report={r} />
          </Sheet>
        ))}
    </Document>
  );
}

function Sheet({ logo, heading, period, generated, children }: StatementProps & { children: React.ReactNode }) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.band} fixed>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
        <Image src={logo} style={s.logo} />
        <View style={s.bandRight}>
          <Text style={s.bandTitle}>STATEMENT</Text>
          <Text style={s.bandSub}>{period || heading}</Text>
        </View>
      </View>
      <View style={s.body}>{children}</View>
      <View style={s.footer} fixed>
        <Text>
          SANKA · {contact.phone} · {contact.email}
        </Text>
        <Text render={({ pageNumber, totalPages }) => `Generated ${generated} · Page ${pageNumber} of ${totalPages}`} />
      </View>
    </Page>
  );
}

function SummaryBoxes({ sum }: { sum: Summary }) {
  return (
    <View style={s.boxes} wrap={false}>
      <View style={s.box}>
        <Text style={s.boxLabel}>Money in</Text>
        <Text style={s.boxValue}>{money(sum.income)}</Text>
        {sum.toCollect > 0 && <Text style={s.boxNote}>{money(sum.toCollect)} still to collect</Text>}
      </View>
      <View style={s.box}>
        <Text style={s.boxLabel}>Money out</Text>
        <Text style={s.boxValue}>{money(sum.spending)}</Text>
        {sum.toPay > 0 && <Text style={s.boxNote}>{money(sum.toPay)} still to pay</Text>}
      </View>
      <View style={[s.box, { borderColor: sum.profit < 0 ? c.bad : c.good }]}>
        <Text style={s.boxLabel}>{sum.profit < 0 ? "Loss" : "Profit"}</Text>
        <Text style={[s.boxValue, { color: sum.profit < 0 ? c.bad : c.good }]}>{money(Math.abs(sum.profit))}</Text>
      </View>
    </View>
  );
}

function Result({ profit }: { profit: number }) {
  const loss = profit < 0;
  return (
    <View style={[s.result, { backgroundColor: loss ? "#fbeaea" : "#e8f5ee" }]} wrap={false}>
      <Text style={[s.bold, { color: loss ? c.bad : c.good }]}>{loss ? "LOSS" : profit === 0 ? "BREAK EVEN" : "PROFIT"}</Text>
      <Text style={[s.bold, { color: loss ? c.bad : c.good }]}>{money(Math.abs(profit))}</Text>
    </View>
  );
}

// Column widths as flex weights; the last `numeric` columns hold numbers and are right-aligned.
function Row({ cols, widths, numeric = 1, style }: { cols: React.ReactNode[]; widths: number[]; numeric?: number; style?: Styles[string] }) {
  return (
    <View style={[s.tr, style ?? {}]} wrap={false}>
      {cols.map((col, i) => (
        <Text key={i} style={[s.cell, { flex: widths[i] }, i >= cols.length - numeric ? s.right : {}]}>
          {col}
        </Text>
      ))}
    </View>
  );
}

function RangeTable({ concerts, total }: { concerts: ConcertReport[]; total: Summary }) {
  const w = [1.2, 2.8, 1.35, 1.35, 1.4];
  return (
    <View style={s.table}>
      <Row widths={w} numeric={3} style={s.th} cols={["Date", "Concert", "Money in", "Money out", "Profit / loss"]} />
      {concerts.map((r) => (
        <View key={r.concert.id} style={s.tr} wrap={false}>
          <Text style={[s.cell, { flex: w[0] }]}>{formatDate(r.concert.event_date)}</Text>
          <View style={[s.cell, { flex: w[1] }]}>
            <Text style={s.bold}>{r.concert.name}</Text>
            {(r.concert.venue || r.concert.city) && (
              <Text style={s.muted}>{[r.concert.venue, r.concert.city].filter(Boolean).join(", ")}</Text>
            )}
          </View>
          <Text style={[s.cell, s.right, { flex: w[2] }]}>{money(r.summary.income)}</Text>
          <Text style={[s.cell, s.right, { flex: w[3] }]}>{money(r.summary.spending)}</Text>
          <Text style={[s.cell, s.right, s.bold, { flex: w[4], color: r.summary.profit < 0 ? c.bad : c.ink }]}>
            {money(r.summary.profit)}
          </Text>
        </View>
      ))}
      <View style={s.totalRow} wrap={false}>
        <Text style={[s.cell, s.bold, { flex: w[0] + w[1] }]}>Total</Text>
        <Text style={[s.cell, s.right, s.bold, { flex: w[2] }]}>{money(total.income)}</Text>
        <Text style={[s.cell, s.right, s.bold, { flex: w[3] }]}>{money(total.spending)}</Text>
        <Text style={[s.cell, s.right, s.bold, { flex: w[4], color: total.profit < 0 ? c.bad : c.ink }]}>{money(total.profit)}</Text>
      </View>
    </View>
  );
}

function ConcertDetail({ report }: { report: ConcertReport }) {
  const { concert, tiers, entries, summary } = report;
  const incomes = entries.filter((e) => e.kind === "income");
  const expenses = entries.filter((e) => e.kind === "expense");
  const groups = byCategory(expenses).map((g) => ({ ...g, items: expenses.filter((e) => e.category === g.category) }));
  const status = (e: BudgetEntry) => (e.settled ? (e.kind === "expense" ? "Paid" : "Received") : e.kind === "expense" ? "Not paid" : "Pending");
  const budget = concert.budget == null ? null : Number(concert.budget);

  return (
    <>
      <Text style={s.h1}>{concert.name}</Text>
      <Text style={s.meta}>
        {formatDate(concert.event_date)}
        {concert.venue || concert.city ? `  ·  ${[concert.venue, concert.city].filter(Boolean).join(", ")}` : ""}
      </Text>
      {budget !== null && (
        <Text style={s.meta}>
          Spending limit {money(budget)} · {budget > 0 ? Math.round((summary.spending / budget) * 100) : 0}% used
        </Text>
      )}

      <SummaryBoxes sum={summary} />

      <Text style={s.h2} minPresenceAhead={60}>
        Ticket sales
      </Text>
      {tiers.length === 0 ? (
        <Text style={s.muted}>No ticket types recorded.</Text>
      ) : (
        <View style={s.table}>
          <Row widths={[2.2, 1.3, 1, 1, 1.5]} numeric={4} style={s.th} cols={["Ticket type", "Price", "Sold", "Seats", "Amount"]} />
          {tiers.map((t) => (
            <Row
              key={t.id}
              widths={[2.2, 1.3, 1, 1, 1.5]}
              numeric={4}
              cols={[
                t.name,
                money(Number(t.price)),
                t.sold.toLocaleString("en-US"),
                t.seats == null ? "-" : t.seats.toLocaleString("en-US"),
                money(Number(t.price) * t.sold),
              ]}
            />
          ))}
          <View style={s.totalRow} wrap={false}>
            <Text style={[s.cell, s.bold, { flex: 3.5 }]}>Total tickets</Text>
            <Text style={[s.cell, s.bold, s.right, { flex: 2 }]}>
              {summary.ticketsSold.toLocaleString("en-US")}
              {summary.seats > 0 ? ` of ${summary.seats.toLocaleString("en-US")}` : ""}
            </Text>
            <Text style={[s.cell, s.bold, s.right, { flex: 1.5 }]}>{money(summary.ticketIncome)}</Text>
          </View>
        </View>
      )}

      <Text style={s.h2} minPresenceAhead={60}>
        Other income
      </Text>
      {incomes.length === 0 ? (
        <Text style={s.muted}>No other income recorded.</Text>
      ) : (
        <View style={s.table}>
          <Row widths={[1.5, 2.6, 1, 1.5]} style={s.th} cols={["Source", "Description", "Status", "Amount"]} />
          {incomes.map((e) => (
            <Row key={e.id} widths={[1.5, 2.6, 1, 1.5]} cols={[e.category, e.label ?? "", status(e), money(Number(e.amount))]} />
          ))}
          <View style={s.totalRow} wrap={false}>
            <Text style={[s.cell, s.bold, { flex: 5.1 }]}>Total other income</Text>
            <Text style={[s.cell, s.bold, s.right, { flex: 1.5 }]}>{money(summary.otherIncome)}</Text>
          </View>
        </View>
      )}

      <Text style={s.h2} minPresenceAhead={60}>
        Expenses
      </Text>
      {groups.length === 0 ? (
        <Text style={s.muted}>No expenses recorded.</Text>
      ) : (
        <View style={s.table}>
          <Row widths={[3.6, 1.2, 1.5]} style={s.th} cols={["Description", "Status", "Amount"]} />
          {groups.map((g) => (
            <View key={g.category}>
              <View style={s.groupRow} wrap={false} minPresenceAhead={24}>
                <Text style={[s.cell, s.bold, { flex: 4.8 }]}>{g.category}</Text>
                <Text style={[s.cell, s.bold, s.right, { flex: 1.5 }]}>{money(g.amount)}</Text>
              </View>
              {g.items.map((e) => (
                <Row key={e.id} widths={[3.6, 1.2, 1.5]} cols={[e.label || g.category, status(e), money(Number(e.amount))]} />
              ))}
            </View>
          ))}
          <View style={s.totalRow} wrap={false}>
            <Text style={[s.cell, s.bold, { flex: 4.8 }]}>Total expenses</Text>
            <Text style={[s.cell, s.bold, s.right, { flex: 1.5 }]}>{money(summary.spending)}</Text>
          </View>
        </View>
      )}

      <Result profit={summary.profit} />

      {concert.notes && <Text style={s.notes}>Notes: {concert.notes}</Text>}
    </>
  );
}
