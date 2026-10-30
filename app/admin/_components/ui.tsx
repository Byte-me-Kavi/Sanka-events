"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Warning, X } from "@phosphor-icons/react";
import type { FormState } from "../actions";

// Native <dialog>: focus trap, Esc to close and a backdrop for free. Slides up as a sheet on phones.
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Focus the panel rather than the close button, and don't pop the phone keyboard up straight away.
      dialog.querySelector<HTMLElement>(".adm-sheet-body")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="adm-sheet"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="adm-sheet-body" tabIndex={-1}>
        <header className="adm-sheet-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>
        {/* Mounted only while open so every opening starts with a fresh form */}
        {open && children}
      </div>
    </dialog>
  );
}

// Runs a server action and calls onDone once it reports success, so the sheet can close itself.
export function useSheetAction(
  action: (prev: FormState, fd: FormData) => Promise<FormState>,
  onDone: () => void,
) {
  return useActionState(async (prev: FormState, fd: FormData) => {
    const result = await action(prev, fd);
    if (result.ok) onDone();
    return result;
  }, {});
}

export function FormError({ state }: { state: FormState }) {
  if (!state.error) return null;
  return (
    <p className="adm-form-error" role="alert">
      <Warning size={18} weight="fill" aria-hidden />
      {state.error}
    </p>
  );
}

export function SubmitButton({ children, pendingText = "Saving…" }: { children: React.ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="adm-btn adm-btn--primary adm-btn--block" disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="adm-field">
      <span className="adm-field-label">{label}</span>
      {children}
      {hint && <span className="adm-field-hint">{hint}</span>}
    </label>
  );
}

export function MoneyInput({ name, defaultValue, required }: { name: string; defaultValue?: number | null; required?: boolean }) {
  return (
    <span className="adm-money-input">
      <span aria-hidden>Rs.</span>
      <input
        name={name}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0"
        required={required}
        defaultValue={defaultValue == null ? "" : defaultValue.toLocaleString("en-US")}
      />
    </span>
  );
}

// A plain form button that asks before deleting.
export function DeleteButton({
  action,
  fields,
  confirmText,
  children,
}: {
  action: (fd: FormData) => Promise<void>;
  fields: Record<string, string>;
  confirmText: string;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <DeleteSubmit confirmText={confirmText}>{children}</DeleteSubmit>
    </form>
  );
}

function DeleteSubmit({ confirmText, children }: { confirmText: string; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="adm-btn adm-btn--danger adm-btn--block"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {pending ? "Deleting…" : children}
    </button>
  );
}
