"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils";
import { TRADE_SIDES, type TradeSide } from "./trade-side";

// 列表的視角切換：我想要 X（找誰拿出 X）／ 我拿出 X（找誰想要 X）。
// 跟 RouteSelect 一樣寫進網址，換視角就回第一頁
export default function SideToggle({ side }: { side: TradeSide }) {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  function select(next: TradeSide) {
    if (next === side) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("side", next);
    params.set("page", "1");
    startTransition(() => {
      replace(`${pathName}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="tablist"
        aria-label="交換視角"
        className={cn("inline-flex gap-1 rounded-lg bg-surface p-1 self-start", {
          "opacity-50": isPending,
        })}
      >
        {TRADE_SIDES.map((option) => (
          <button
            key={option.side}
            type="button"
            role="tab"
            aria-selected={side === option.side}
            onClick={() => select(option.side)}
            className={cn(
              "px-5 py-2 rounded-md text-sm transition-colors",
              side === option.side
                ? "bg-red-500 text-white"
                : "hover:bg-surface-hover text-muted",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-red-300">
        {TRADE_SIDES.find((option) => option.side === side)?.hint}
      </p>
    </div>
  );
}
