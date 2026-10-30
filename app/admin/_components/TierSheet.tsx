"use client";

import { useState } from "react";
import { CaretRight } from "@phosphor-icons/react";
import { TICKET_PRESETS, money, type TicketCategory } from "@/lib/budget";
import { deleteTier, saveTier } from "../actions";
import { DeleteButton, Field, FormError, MoneyInput, Sheet, SubmitButton, useSheetAction } from "./ui";

export function TierButton({
  concertId,
  className = "adm-btn adm-btn--ghost",
  children,
}: {
  concertId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Add a ticket type">
        <TierForm concertId={concertId} onDone={() => setOpen(false)} />
      </Sheet>
    </>
  );
}

export function TierRow({ tier }: { tier: TicketCategory }) {
  const [open, setOpen] = useState(false);
  const price = Number(tier.price);
  const sold = tier.sold;
  const seats = tier.seats;
  const pct = seats ? Math.min(100, Math.round((sold / seats) * 100)) : null;

  return (
    <li className="adm-tier">
      <button type="button" className="adm-tier-main" onClick={() => setOpen(true)}>
        <span className="adm-tier-top">
          <span className="adm-row-title">{tier.name}</span>
          <span className="adm-row-amount">{money(price * sold)}</span>
          <CaretRight size={16} className="adm-row-caret" aria-hidden />
        </span>
        <span className="adm-row-sub">
          {money(price)} each · {sold.toLocaleString("en-US")} sold
          {seats ? ` of ${seats.toLocaleString("en-US")}` : ""}
        </span>
        {pct !== null && (
          <span className="adm-meter" role="img" aria-label={`${pct}% sold`}>
            <span style={{ width: `${pct}%` }} />
          </span>
        )}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={`Edit ${tier.name} tickets`}>
        <TierForm concertId={tier.concert_id} tier={tier} onDone={() => setOpen(false)} />
      </Sheet>
    </li>
  );
}

function TierForm({ concertId, tier, onDone }: { concertId: string; tier?: TicketCategory; onDone: () => void }) {
  const [state, formAction] = useSheetAction(saveTier, onDone);

  return (
    <>
      <form action={formAction} className="adm-form">
        {tier && <input type="hidden" name="id" value={tier.id} />}
        <input type="hidden" name="concert_id" value={concertId} />
        <Field label="Ticket type" hint="Pick from the list or type your own.">
          <input name="name" required maxLength={100} list="ticket-presets" defaultValue={tier?.name} placeholder="VIP" />
          <datalist id="ticket-presets">
            {TICKET_PRESETS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </Field>
        <Field label="Price of one ticket">
          <MoneyInput name="price" defaultValue={tier?.price} required />
        </Field>
        <div className="adm-form-row">
          <Field label="Seats available">
            <input name="seats" type="text" inputMode="numeric" defaultValue={tier?.seats ?? ""} placeholder="500" />
          </Field>
          <Field label="Tickets sold">
            <input name="sold" type="text" inputMode="numeric" defaultValue={tier?.sold ?? ""} placeholder="0" />
          </Field>
        </div>
        <FormError state={state} />
        <SubmitButton>{tier ? "Save changes" : "Add ticket type"}</SubmitButton>
      </form>
      {tier && (
        <DeleteButton action={deleteTier} fields={{ id: tier.id, concert_id: tier.concert_id }} confirmText={`Delete the ${tier.name} tickets?`}>
          Delete
        </DeleteButton>
      )}
    </>
  );
}
