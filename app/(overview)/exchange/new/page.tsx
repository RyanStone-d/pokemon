import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { z } from "zod";

import { getCurrentUser } from "@/app/shared/auth";
import { Filter } from "@/app/shared/filter";
import { PokemonCardsSkeleton } from "@/app/shared/pokemon-card";
import { fetchPokemonDetail } from "@/app/shared/pokemon";
import PickerSlot from "./picker-slot";
import PickerCards, { type PickedPokemon } from "./picker-cards";
import NewTradeForm from "./new-trade-form";
import { newTradeUrl, type NewTradeParams } from "./url";

// PRD 4.C：兩個寶可夢選擇器，重用圖鑑的篩選面板（Type、Generation、名字搜尋）＋卡片格，
// 點卡片選起來；再填 8 碼連線密語送出，成功回 /exchange。
// 上面的面板是「要送出的東西」（兩格＋密語＋發文），下面是「拿來選的東西」（篩選＋卡片）
const searchParamsSchema = z.object({
  step: z.enum(["offered", "wanted"]).optional().default("offered").catch("offered"),
  offered: z.coerce.number().int().positive().optional().catch(undefined),
  wanted: z.coerce.number().int().positive().optional().catch(undefined),
  query: z.string().optional().default(""),
  page: z.coerce.number().optional().default(1).catch(1),
  type: z.string().optional().default("").catch(""),
  generation: z.string().optional().default("").catch(""),
});

export default async function NewTradePage(props: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/profile");

  const params: NewTradeParams = searchParamsSchema.parse(
    (await props.searchParams) ?? {},
  );
  const { step, offered, wanted, query, page, type, generation } = params;

  const [offeredMon, wantedMon] = await Promise.all([
    loadPokemon(offered),
    loadPokemon(wanted),
  ]);

  return (
    <main>
      <div className="flex justify-between items-center bg-overlay/80 py-6 px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/exchange"
            title="回交換列表"
            className="rounded-md p-2 hover:bg-surface-hover"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-xl md:text-2xl">發交換單</h1>
        </div>
        <span className="text-sm text-muted">@{user.username}</span>
      </div>

      <div className="flex flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-4 bg-overlay/80 rounded p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PickerSlot
              label="我拿出"
              active={step === "offered"}
              pokemon={offeredMon}
              href={newTradeUrl(params, { step: "offered" })}
            />
            <PickerSlot
              label="我想要"
              active={step === "wanted"}
              pokemon={wantedMon}
              href={newTradeUrl(params, { step: "wanted" })}
            />
          </div>
          <NewTradeForm offeredId={offeredMon?.id} wantedId={wantedMon?.id} />
        </section>

        <p className="text-sm text-muted">
          正在選「{step === "offered" ? "我拿出" : "我想要"}」的寶可夢：用篩選找到後，點卡片就選好了
        </p>

        <Filter />

        <Suspense
          key={`${step}-${query}-${type}-${generation}-${page}`}
          fallback={<PokemonCardsSkeleton />}
        >
          <PickerCards params={params} />
        </Suspense>
      </div>
    </main>
  );
}

// 網址上的 id 換成名字和圖。id 不存在就當沒選
async function loadPokemon(id?: number): Promise<PickedPokemon | null> {
  if (!id) return null;
  try {
    const p = await fetchPokemonDetail(String(id));
    return { id: p.id, name: p.name, image: p.image, types: p.types };
  } catch {
    return null;
  }
}
