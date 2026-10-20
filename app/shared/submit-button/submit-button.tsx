"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

// 放在 <form action={serverAction}> 裡面用：送出中自動 disabled、換字，不用每個表單自己管 pending
export default function SubmitButton({
  children,
  pendingText = "處理中…",
  className,
  disabled,
  ...props
}: React.ComponentProps<"button"> & { pendingText?: string }) {
  const { pending } = useFormStatus();
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
      {pending ? pendingText : children}
    </button>
  );
}
