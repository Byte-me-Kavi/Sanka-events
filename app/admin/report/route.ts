import { readFile } from "node:fs/promises";
import path from "node:path";
import { createElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import { formatDate, summarize, type BudgetEntry, type Concert, type TicketCategory } from "@/lib/budget";
import { requireAdmin } from "@/lib/supabase/server";
import { StatementPdf, type ConcertReport } from "./StatementPdf";

type Row = Concert & { budget_entries: BudgetEntry[]; ticket_categories: TicketCategory[] };

const isDate = (v: string | null): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

// GET /admin/report?concert=<id>                    one concert
// GET /admin/report?from=YYYY-MM-DD&to=YYYY-MM-DD   every dated concert in the range (either end optional)
//     &details=1                                    plus a detail page per concert
export async function GET(request: NextRequest) {
  const supabase = await requireAdmin();
  const params = request.nextUrl.searchParams;
  const concertId = params.get("concert");
  const from = params.get("from");
  const to = params.get("to");

  if ((from && !isDate(from)) || (to && !isDate(to))) return new Response("Dates must look like 2026-01-31.", { status: 400 });

  let query = supabase
    .from("concerts")
    .select(
      "id, name, event_date, venue, city, budget, notes, budget_entries(id, concert_id, kind, category, label, amount, settled, notes, created_at), ticket_categories(id, concert_id, name, price, seats, sold)",
    )
    .order("event_date", { ascending: true })
    .order("created_at", { referencedTable: "budget_entries" })
    .order("price", { referencedTable: "ticket_categories", ascending: false });

  if (concertId) query = query.eq("id", concertId);
  else {
    // A date range only makes sense for concerts that have a date.
    query = query.not("event_date", "is", null);
    if (isDate(from)) query = query.gte("event_date", from);
    if (isDate(to)) query = query.lte("event_date", to);
  }

  const { data, error } = await query.returns<Row[]>();
  if (error) return new Response("Couldn't load the concerts. Please try again.", { status: 502 });
  if (concertId && data.length === 0) return new Response("Concert not found.", { status: 404 });

  const concerts: ConcertReport[] = data.map(({ budget_entries, ticket_categories, ...concert }) => ({
    concert,
    entries: budget_entries,
    tiers: ticket_categories,
    summary: summarize(budget_entries, ticket_categories),
  }));
  const total = summarize(
    data.flatMap((c) => c.budget_entries),
    data.flatMap((c) => c.ticket_categories),
  );

  const single = concertId ? concerts[0].concert : null;
  const period = single
    ? formatDate(single.event_date)
    : from && to
      ? `${formatDate(from)} to ${formatDate(to)}`
      : from
        ? `From ${formatDate(from)}`
        : to
          ? `Up to ${formatDate(to)}`
          : "All concerts";

  const generated = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Colombo" });
  const logo = await readFile(path.join(process.cwd(), "public/images/sanka-logo.jpg"));

  const doc = createElement(StatementPdf, {
    logo,
    heading: single ? single.name : "Concert statement",
    period,
    generated,
    total,
    concerts,
    mode: single ? "single" : "range",
    details: params.get("details") === "1",
  }) as React.ReactElement<DocumentProps>;
  const pdf = await renderToBuffer(doc);

  const slug = (single ? single.name : from || to ? `statement ${from || "start"} to ${to || "latest"}` : "statement all concerts")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="sanka-${slug || "concert"}.pdf"`,
      // Financial data: never store in shared caches.
      "Cache-Control": "private, no-store",
    },
  });
}
