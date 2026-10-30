"use client";

import { useActionState, useState } from "react";
import { Input } from "@/design-system/input";
import { Field, FieldLabel } from "@/design-system/field";
import { SubmitButton } from "@/app/shared/submit-button";
import { useDictionary } from "@/app/shared/i18n";
import { createTrade } from "../actions";
import { formatLinkCode, LINK_CODE_LENGTH } from "../trade-utils";

// 密語加送出鈕，放在兩個選擇格的正下方。選了誰由網址決定，這裡用 hidden input 帶給 Server Action
export default function NewTradeForm({
  offeredId,
  wantedId,
}: {
  offeredId?: number;
  wantedId?: number;
}) {
  const t = useDictionary();
  const [state, formAction] = useActionState(createTrade, null);
  const [linkCode, setLinkCode] = useState("");
  const ready = !!offeredId && !!wantedId;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="offered" value={offeredId ?? ""} />
      <input type="hidden" name="wanted" value={wantedId ?? ""} />

      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <Field className="sm:max-w-xs">
          <FieldLabel htmlFor="linkCode">{t.newTrade.linkCodeLabel}</FieldLabel>
          <Input
            id="linkCode"
            name="linkCode"
            inputMode="numeric"
            autoComplete="off"
            value={linkCode}
            onChange={(e) => setLinkCode(formatLinkCode(e.target.value))}
            placeholder="1234-5678"
            maxLength={LINK_CODE_LENGTH + 1} // 含中間的 dash
            aria-invalid={!!state?.error}
            className="h-12 rounded-sm px-5 border-none bg-[#6B7280] font-mono"
          />
        </Field>
        <SubmitButton
          disabled={!ready}
          title={ready ? undefined : t.newTrade.pickFirst}
          // 跟左邊的密語框一樣高，底部對齊
          className="h-12 px-6 rounded bg-red-500 hover:bg-red-400"
        >
          {t.newTrade.submit}
        </SubmitButton>
      </div>

      {state?.error ? (
        <p role="alert" className="text-red-400 text-sm">
          {state.error}
        </p>
      ) : (
        !ready && (
          <p className="text-sm text-muted">{t.newTrade.hint}</p>
        )
      )}
    </form>
  );
}
