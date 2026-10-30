"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/app/shared/i18n";

// 放在 <form action={serverAction}> 裡面用：送出中自動 disabled、換字，不用每個表單自己管 pending
export default function SubmitButton({
  children,
  pendingText,
  className,
  disabled,
  ...props
}: React.ComponentProps<"button"> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  const t = useDictionary();
  return (
    <button
      type="submit"
      {...props}
      disabled={pending || disabled}
      aria-busy={pending}
      className={cn(
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      )}
    >
      {pending ? (pendingText ?? t.common.processing) : children}
    </button>
  );
}
