"use client";

import { useId } from "react";
import { Input } from "@/design-system/input";
import { Label } from "@/design-system/label";
import { SubmitButton } from "@/app/shared/submit-button";
import { useDictionary } from "@/app/shared/i18n";

// 純畫面：帳號、密碼、錯誤訊息、送出鈕。不管 state、不打 API，
// 登入和註冊都用這個，送到哪個 Server Action 由外面決定
export default function AuthForm({
  action,
  error,
  username,
  pending,
  submitLabel,
  passwordAutoComplete,
}: {
  action: (formData: FormData) => void;
  error: string;
  // 上一次送出失敗時填的帳號，重畫時填回去
  username: string;
  pending: boolean;
  submitLabel: string;
  // 登入填 current-password、註冊填 new-password，瀏覽器的密碼管理才分得出來
  passwordAutoComplete: "current-password" | "new-password";
}) {
  const t = useDictionary();
  const id = useId();
  const usernameId = `${id}-username`;
  const passwordId = `${id}-password`;
  const errorId = `${id}-error`;

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor={usernameId} className="sr-only">
          {t.auth.username}
        </Label>
        <Input
          id={usernameId}
          name="username"
          autoComplete="username"
          defaultValue={username}
          placeholder={t.auth.usernamePlaceholder}
          disabled={pending}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="rounded-sm p-5 border-none bg-[#6B7280]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={passwordId} className="sr-only">
          {t.auth.password}
        </Label>
        <Input
          id={passwordId}
          name="password"
          type="password"
          autoComplete={passwordAutoComplete}
          placeholder={t.auth.passwordPlaceholder}
          disabled={pending}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="rounded-sm p-5 border-none bg-[#6B7280]"
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-red-400 text-sm">
          {error}
        </p>
      )}
      <SubmitButton className="px-4 py-3 rounded bg-red-500 hover:bg-red-400">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
