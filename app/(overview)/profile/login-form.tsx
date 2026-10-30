"use client";

import { useActionState } from "react";
import { useDictionary } from "@/app/shared/i18n";
import AuthForm from "./auth-form";
import { login } from "./actions";

export default function LoginForm() {
  const t = useDictionary();
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <AuthForm
      action={formAction}
      error={state?.error ?? ""}
      username={state?.username ?? ""}
      pending={pending}
      submitLabel={t.auth.login}
      passwordAutoComplete="current-password"
    />
  );
}
