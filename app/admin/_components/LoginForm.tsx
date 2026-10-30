"use client";

import { useActionState, useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { signIn } from "../actions";
import { Field, FormError, SubmitButton } from "./ui";

export default function LoginForm() {
  const [state, formAction] = useActionState(signIn, {});
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="adm-form">
      <Field label="Email">
        <input name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field label="Password">
        <span className="adm-password">
          <input name="password" type={show ? "text" : "password"} autoComplete="current-password" required />
          <button
            type="button"
            className="adm-icon-btn"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeSlash size={20} /> : <Eye size={20} />}
          </button>
        </span>
      </Field>
      <FormError state={state} />
      <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
