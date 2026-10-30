"use client";

import { useState } from "react";
import type { Concert } from "@/lib/budget";
import { deleteConcert, saveConcert } from "../actions";
import { DeleteButton, Field, FormError, MoneyInput, Sheet, SubmitButton, useSheetAction } from "./ui";

export function ConcertButton({
  concert,
  className = "adm-btn adm-btn--primary",
  children,
}: {
  concert?: Concert;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={concert ? "Edit concert details" : "Add a concert"}>
        <ConcertForm concert={concert} onDone={() => setOpen(false)} />
      </Sheet>
    </>
  );
}

function ConcertForm({ concert, onDone }: { concert?: Concert; onDone: () => void }) {
  const [state, formAction] = useSheetAction(saveConcert, onDone);

  return (
    <>
      <form action={formAction} className="adm-form">
        {concert && <input type="hidden" name="id" value={concert.id} />}
        <Field label="Concert name">
          <input name="name" required maxLength={200} defaultValue={concert?.name} placeholder="Snehaye Nagaraya 5.0" />
        </Field>
        <Field label="Date" hint="Leave empty if the date isn't fixed yet.">
          <input name="event_date" type="date" defaultValue={concert?.event_date ?? ""} />
        </Field>
        <div className="adm-form-row">
          <Field label="Venue">
            <input name="venue" maxLength={200} defaultValue={concert?.venue ?? ""} placeholder="Nelum Pokuna" />
          </Field>
          <Field label="City">
            <input name="city" maxLength={100} defaultValue={concert?.city ?? ""} placeholder="Colombo" />
          </Field>
        </div>
        <Field label="Spending limit (optional)" hint="The most you plan to spend. You'll see how close you are.">
          <MoneyInput name="budget" defaultValue={concert?.budget} />
        </Field>
        <Field label="Notes (optional)">
          <textarea name="notes" rows={3} maxLength={4000} defaultValue={concert?.notes ?? ""} />
        </Field>
        <FormError state={state} />
        <SubmitButton>{concert ? "Save changes" : "Add concert"}</SubmitButton>
      </form>
      {concert && (
        <DeleteButton
          action={deleteConcert}
          fields={{ id: concert.id }}
          confirmText={`Delete "${concert.name}" and all its tickets, income and expenses? This can't be undone.`}
        >
          Delete this concert
        </DeleteButton>
      )}
    </>
  );
}
