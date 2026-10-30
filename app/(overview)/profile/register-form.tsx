"use client";

import { useActionState } from "react";
import { useDictionary } from "@/app/shared/i18n";
import AuthForm from "./auth-form";
import { register } from "./actions";

export default function RegisterForm() {
  const t = useDictionary();
  const [state, formAction, pending] = useActionState(register, null);

  return (
    <AuthForm
      action={formAction}
      error={state?.error ?? ""}
      username={state?.username ?? ""}
      pending={pending}
      submitLabel={t.auth.registerSubmit}
      passwordAutoComplete="new-password"
    />
  );
}
