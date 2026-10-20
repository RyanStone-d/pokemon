"use client";

import { useActionState } from "react";
import AuthForm from "./auth-form";
import { register } from "./actions";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, null);

  return (
    <AuthForm
      action={formAction}
      error={state?.error ?? ""}
      username={state?.username ?? ""}
      pending={pending}
      submitLabel="註冊並登入"
      passwordAutoComplete="new-password"
    />
  );
}
