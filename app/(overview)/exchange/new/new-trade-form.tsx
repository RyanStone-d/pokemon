"use client";

import { useActionState, useState } from "react";
import { Input } from "@/design-system/input";
import { Field, FieldLabel } from "@/design-system/field";
import { SubmitButton } from "@/app/shared/submit-button";
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
  const [state, formAction] = useActionState(createTrade, null);
  const [linkCode, setLinkCode] = useState("");
  const ready = !!offeredId && !!wantedId;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="offered" value={offeredId ?? ""} />
      <input type="hidden" name="wanted" value={wantedId ?? ""} />

      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <Field className="sm:max-w-xs">
          <FieldLabel htmlFor="linkCode">連線密語（8 碼）</FieldLabel>
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
            className="rounded-sm p-5 border-none bg-[#6B7280] font-mono"
          />
        </Field>
        <SubmitButton
          disabled={!ready}
          title={ready ? undefined : "先選好兩隻寶可夢"}
          className="px-6 py-3 rounded bg-red-500 hover:bg-red-400"
        >
          發文
        </SubmitButton>
      </div>

      {state?.error ? (
        <p role="alert" className="text-red-400 text-sm">
          {state.error}
        </p>
      ) : (
        !ready && (
          <p className="text-sm text-muted">選好兩隻寶可夢、填好密語就能發文</p>
        )
      )}
    </form>
  );
}
