import { Suspense } from "react";
import Link from "next/link";
import { z } from "zod";

import { getCurrentUser } from "@/app/shared/auth";
import { Filter } from "@/app/shared/filter";
import SideToggle from "./side-toggle";
import TradeCards from "./trade-cards";
import TradeCardsSkeleton from "./trade-cards-skeleton";
import { DEFAULT_SIDE, getTradeSide } from "./trade-side";

// 跟首頁一樣：篩選條件放在網址上，Server Component 讀 searchParams 抓資料。
// side 決定 Type、Generation、名字是套在單子的哪一邊（我想要→offered、我拿出→wanted）
const searchParamsSchema = z.object({
  side: z.enum(["want", "offer"]).optional().default(DEFAULT_SIDE).catch(DEFAULT_SIDE),
  query: z.string().optional().default(""),
  page: z.coerce.number().optional().default(1).catch(1),
  type: z.string().optional().default("").catch(""),
  generation: z.string().optional().default("").catch(""),
});

export default async function ExchangePage(props: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const { side, query, page, type, generation } = searchParamsSchema.parse(
    (await props.searchParams) ?? {},
  );
  const user = await getCurrentUser();
  const view = getTradeSide(side);

  return (
    <main>
      {/* 發交換單的入口在側欄的 New Trade */}
      <div className="flex justify-between items-center bg-overlay/80 py-6 px-4">
        <h1 className="text-xl md:text-2xl">Exchange</h1>
      </div>

      <div className="flex flex-col gap-6 p-4 md:p-6">
        {!user && (
          <p className="text-sm text-red-300">
            要進行交換，請先到{" "}
            <Link href="/profile" className="underline">
              Profile
            </Link>{" "}
            登入
          </p>
        )}

        <Filter
          header={<SideToggle side={side} />}
          searchLabel={view.searchLabel}
          searchPlaceholder={view.searchPlaceholder}
        />

        <Suspense
          key={`${side}-${query}-${type}-${generation}-${page}`}
          fallback={<TradeCardsSkeleton />}
        >
          <TradeCards
            side={side}
            page={page}
            query={query}
            type={type}
            generation={generation}
            user={user}
          />
        </Suspense>
      </div>
    </main>
  );
}
