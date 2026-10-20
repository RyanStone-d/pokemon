"use client";

import { useActionState } from "react";
import AuthForm from "./auth-form";
import { login } from "./actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <AuthForm
      action={formAction}
      error={state?.error ?? ""}
      username={state?.username ?? ""}
      pending={pending}
      submitLabel="登入"
      passwordAutoComplete="current-password"
    />
  );
}
