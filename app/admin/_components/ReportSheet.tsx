"use client";

import { useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { todayInColombo } from "@/lib/budget";
import { Field, Sheet } from "./ui";

function presets() {
  const year = Number(todayInColombo().slice(0, 4));
  return [
    { label: "This year", from: `${year}-01-01`, to: `${year}-12-31` },
    { label: "Last year", from: `${year - 1}-01-01`, to: `${year - 1}-12-31` },
    { label: "All time", from: "", to: "" },
  ];
}

export function ReportButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setOpen(true)}>
        <DownloadSimple size={18} aria-hidden />
        PDF
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Download a statement">
        <ReportForm onDone={() => setOpen(false)} />
      </Sheet>
    </>
  );
}

function ReportForm({ onDone }: { onDone: () => void }) {
  const options = presets();
  const [from, setFrom] = useState(options[0].from);
  const [to, setTo] = useState(options[0].to);

  return (
    // A plain GET form: the PDF arrives as a download and this page stays put.
    <form action="/admin/report" method="get" className="adm-form" onSubmit={() => setTimeout(onDone, 300)}>
      <fieldset className="adm-field">
        <legend className="adm-field-label">Quick pick</legend>
        <div className="adm-chips">
          {options.map((p) => (
            <label key={p.label} className="adm-chip">
              <input
                type="radio"
                name="preset"
                checked={from === p.from && to === p.to}
                onChange={() => {
                  setFrom(p.from);
                  setTo(p.to);
                }}
              />
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="adm-form-row">
        <Field label="From">
          <input type="date" name="from" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To">
          <input type="date" name="to" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </div>
      <p className="adm-field-hint">Concerts dated between these days are included. Leave both empty for every concert.</p>
      <label className="adm-switch">
        <input type="checkbox" name="details" value="1" defaultChecked />
        <span className="adm-switch-track" aria-hidden />
        <span>Add a full page for each concert</span>
      </label>
      <button type="submit" className="adm-btn adm-btn--primary adm-btn--block">
        <DownloadSimple size={18} weight="bold" aria-hidden />
        Download PDF
      </button>
    </form>
  );
}
