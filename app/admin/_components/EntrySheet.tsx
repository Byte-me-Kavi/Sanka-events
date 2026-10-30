"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { CaretRight, CheckCircle, Circle } from "@phosphor-icons/react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, money, type BudgetEntry, type EntryKind } from "@/lib/budget";
import { deleteEntry, saveEntry, setSettled } from "../actions";
import { DeleteButton, Field, FormError, MoneyInput, Sheet, SubmitButton, useSheetAction } from "./ui";

const words = {
  expense: { add: "Add an expense", edit: "Edit expense", settled: "Paid", unsettled: "Not paid yet", toggle: "Already paid" },
  income: { add: "Add income", edit: "Edit income", settled: "Received", unsettled: "Not received yet", toggle: "Already received" },
};

export function EntryButton({
  concertId,
  kind,
  className = "adm-btn adm-btn--ghost",
  children,
}: {
  concertId: string;
  kind: EntryKind;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={words[kind].add}>
        <EntryForm concertId={concertId} kind={kind} onDone={() => setOpen(false)} />
      </Sheet>
    </>
  );
}

export function EntryRow({ entry, showCategory = false }: { entry: BudgetEntry; showCategory?: boolean }) {
  const [open, setOpen] = useState(false);
  const w = words[entry.kind];
  const sub = [showCategory && entry.label ? entry.category : null, entry.notes].filter(Boolean).join(" · ");
  return (
    <li className="adm-row">
      <button type="button" className="adm-row-main" onClick={() => setOpen(true)}>
        <span className="adm-row-text">
          <span className="adm-row-title">{entry.label || entry.category}</span>
          {sub && <span className="adm-row-sub">{sub}</span>}
        </span>
        <span className="adm-row-amount">{money(Number(entry.amount))}</span>
        <CaretRight size={16} className="adm-row-caret" aria-hidden />
      </button>
      <form action={setSettled} className="adm-row-status">
        <input type="hidden" name="id" value={entry.id} />
        <input type="hidden" name="concert_id" value={entry.concert_id} />
        <input type="hidden" name="settled" value={String(!entry.settled)} />
        <SettledToggle settled={entry.settled} on={w.settled} off={w.unsettled} />
      </form>
      <Sheet open={open} onClose={() => setOpen(false)} title={w.edit}>
        <EntryForm concertId={entry.concert_id} kind={entry.kind} entry={entry} onDone={() => setOpen(false)} />
      </Sheet>
    </li>
  );
}

function SettledToggle({ settled, on, off }: { settled: boolean; on: string; off: string }) {
  const { pending } = useFormStatus();
  // While saving, show the state it is switching to.
  const shown = pending ? !settled : settled;
  return (
    <button
      type="submit"
      className={`adm-pill ${shown ? "adm-pill--done" : "adm-pill--pending"}`}
      aria-pressed={settled}
      title={`Tap to mark as ${settled ? off.toLowerCase() : on.toLowerCase()}`}
      disabled={pending}
    >
      {shown ? <CheckCircle size={16} weight="fill" aria-hidden /> : <Circle size={16} aria-hidden />}
      {shown ? on : off}
    </button>
  );
}

function EntryForm({
  concertId,
  kind,
  entry,
  onDone,
}: {
  concertId: string;
  kind: EntryKind;
  entry?: BudgetEntry;
  onDone: () => void;
}) {
  const [state, formAction] = useSheetAction(saveEntry, onDone);
  const categories = kind === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const w = words[kind];

  return (
    <>
      <form action={formAction} className="adm-form">
        {entry && <input type="hidden" name="id" value={entry.id} />}
        <input type="hidden" name="concert_id" value={concertId} />
        <input type="hidden" name="kind" value={kind} />

        <fieldset className="adm-field">
          <legend className="adm-field-label">{kind === "expense" ? "What is it for?" : "Where is it from?"}</legend>
          <div className="adm-chips">
            {categories.map((c) => (
              <label key={c} className="adm-chip">
                <input type="radio" name="category" value={c} defaultChecked={entry?.category === c} required />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Amount">
          <MoneyInput name="amount" defaultValue={entry?.amount} required />
        </Field>

        <Field
          label="Description (optional)"
          hint={kind === "expense" ? "For example: Sound system rental, Kasun's fee" : "For example: Dialog sponsorship, food stall rent"}
        >
          <input name="label" maxLength={200} defaultValue={entry?.label ?? ""} />
        </Field>

        <label className="adm-switch">
          <input type="checkbox" name="settled" defaultChecked={entry?.settled ?? false} />
          <span className="adm-switch-track" aria-hidden />
          <span>{w.toggle}</span>
        </label>

        <Field label="Notes (optional)">
          <textarea name="notes" rows={2} maxLength={2000} defaultValue={entry?.notes ?? ""} />
        </Field>

        <FormError state={state} />
        <SubmitButton>{entry ? "Save changes" : kind === "expense" ? "Add expense" : "Add income"}</SubmitButton>
      </form>
      {entry && (
        <DeleteButton
          action={deleteEntry}
          fields={{ id: entry.id, concert_id: entry.concert_id }}
          confirmText={`Delete "${entry.label || entry.category}" (${money(Number(entry.amount))})?`}
        >
          Delete
        </DeleteButton>
      )}
    </>
  );
}
