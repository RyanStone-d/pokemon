"use client";

import { useActionState } from "react";
import { cn } from "@/lib/utils";
import { SubmitButton } from "@/app/shared/submit-button";
import type { ActionState } from "./actions";

// 一顆按鈕就是一個表單：我要交換、換完了、下架都用這個。
// action 是在 Server Component 裡 .bind(null, id) 綁好的 Server Action
export default function TradeActionForm({
  action,
  label,
  variant = "primary",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  label: string;
  variant?: "primary" | "secondary";
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <SubmitButton
        className={cn(
          "px-4 py-2 rounded text-sm",
          variant === "primary"
            ? "bg-red-500 hover:bg-red-400"
            : "bg-surface-hover hover:bg-surface-2",
        )}
      >
        {label}
      </SubmitButton>
      {state?.error && (
        <p role="alert" className="text-red-400 text-xs">
          {state.error}
        </p>
      )}
    </form>
  );
}
