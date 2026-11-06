"use client";

import { useActionState, useId } from "react";
import { Input } from "@/design-system/input";
import { Label } from "@/design-system/label";
import { useDictionary } from "@/app/shared/i18n";
import { SubmitButton } from "@/app/shared/submit-button";
import { rename } from "./actions";

export type LinkResult = "google_linked" | "google_taken" | "google_failed";

// 登入後的帳號設定：改帳號名字、綁定 Google。
// 綁定用一般連結：/login/google 回的是 redirect，要整個頁面跟著跳去 Google；結果由回程帶在網址上
export default function AccountSettings({
  username,
  linkResult,
}: {
  username: string;
  linkResult?: LinkResult;
}) {
  const t = useDictionary();
  const [state, formAction] = useActionState(rename, null);
  const id = useId();
  const usernameId = `${id}-username`;
  const errorId = `${id}-error`;
  const error = state?.error ?? "";

  return (
    <section className="flex flex-col gap-4 bg-overlay/80 rounded-lg p-6 shadow-card">
      <h2 className="text-lg">{t.profile.account}</h2>

      <form action={formAction} noValidate className="flex flex-col gap-2">
        <Label htmlFor={usernameId}>{t.auth.username}</Label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            id={usernameId}
            name="username"
            autoComplete="username"
            defaultValue={state?.username ?? username}
            placeholder={t.auth.usernamePlaceholder}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className="rounded-sm p-5 border-none bg-[#6B7280] sm:max-w-xs"
          />
          <SubmitButton className="px-4 py-2 rounded bg-red-500 hover:bg-red-400">
            {t.profile.saveUsername}
          </SubmitButton>
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-red-400 text-sm">
            {error}
          </p>
        )}
        {state && !error && (
          <p role="status" className="text-green-400 text-sm">
            {t.profile.usernameSaved}
          </p>
        )}
      </form>

      <div className="flex flex-col gap-2">
        <a
          href="/login/google?link=1"
          className="self-start px-4 py-2 rounded bg-surface border border-border hover:bg-surface-hover"
        >
          {t.profile.linkGoogle}
        </a>
        <p className="text-sm text-muted">{t.profile.linkGoogleHint}</p>
        {linkResult === "google_linked" && (
          <p role="status" className="text-green-400 text-sm">
            {t.profile.linkResults.google_linked}
          </p>
        )}
        {linkResult && linkResult !== "google_linked" && (
          <p role="alert" className="text-red-400 text-sm">
            {t.profile.linkResults[linkResult]}
          </p>
        )}
      </div>
    </section>
  );
}
