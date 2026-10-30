"use client";

import { useActionState, useState } from "react";
import { CheckCircle, Key } from "@phosphor-icons/react";
import { ADMIN_EMAIL, MIN_PASSWORD } from "@/lib/admin";
import { changePassword } from "../actions";
import { Field, FormError, Sheet, SubmitButton } from "./ui";

export function PasswordButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="adm-top-btn" onClick={() => setOpen(true)}>
        <Key size={18} aria-hidden />
        <span>Password</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Change password">
        <PasswordForm onDone={() => setOpen(false)} />
      </Sheet>
    </>
  );
}

function PasswordForm({ onDone }: { onDone: () => void }) {
  const [state, formAction] = useActionState(changePassword, {});
  const [show, setShow] = useState(false);
  const type = show ? "text" : "password";

  if (state.ok) {
    return (
      <div className="adm-done" role="status">
        <CheckCircle size={44} weight="fill" aria-hidden />
        <p className="adm-done-title">Password changed</p>
        <p>Use the new password next time you sign in. Any other phone or computer that was signed in has been signed out.</p>
        <button type="button" className="adm-btn adm-btn--primary adm-btn--block" onClick={onDone}>
          Done
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="adm-form">
      {/* Lets password managers file the new password under the right account */}
      <input type="email" name="username" autoComplete="username" value={ADMIN_EMAIL} readOnly hidden />
      <Field label="Current password">
        <input name="current" type={type} autoComplete="current-password" required />
      </Field>
      <Field label="New password" hint={`At least ${MIN_PASSWORD} characters. A short sentence is easy to remember and hard to guess.`}>
        <input name="next" type={type} autoComplete="new-password" minLength={MIN_PASSWORD} required />
      </Field>
      <Field label="Type the new password again">
        <input name="confirm" type={type} autoComplete="new-password" minLength={MIN_PASSWORD} required />
      </Field>
      <label className="adm-switch">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
        <span className="adm-switch-track" aria-hidden />
        <span>Show passwords</span>
      </label>
      <FormError state={state} />
      <SubmitButton pendingText="Changing…">Change password</SubmitButton>
    </form>
  );
}
