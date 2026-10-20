import Link from "next/link";

import { cn } from "@/lib/utils";
import { PokemonCard } from "@/app/shared/pokemon-card";
import { Pagination } from "@/app/shared/pagination";
import { fetchPokemonList, fetchTotalPages } from "@/app/shared/pokemon";
import { newTradeUrl, type NewTradeParams } from "./url";

export type PickedPokemon = {
  id: number;
  name: string;
  image: string | null;
  types: string[];
};

// 跟圖鑑同一套卡片和分頁，差別只在點卡片是「選起來」而不是進詳細頁
export default async function PickerCards({
  params,
}: {
  params: NewTradeParams;
}) {
  const { step, offered, wanted, page, type, generation, query } = params;

  // 兩個函式打同一個網址，Next 會合併成一次請求
  const [list, totalPages] = await Promise.all([
    fetchPokemonList(page, type, generation, query),
    fetchTotalPages(type, generation, query),
  ]);

  if (list.length === 0) {
    return <p className="text-sm text-red-300">找不到符合的寶可夢</p>;
  }

  // 選完這格、另一格還是空的，就自動跳去選另一格
  const nextStep: NewTradeParams["step"] =
    step === "offered" && !wanted
      ? "wanted"
      : step === "wanted" && !offered
        ? "offered"
        : step;
  const selectedId = step === "offered" ? offered : wanted;

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {list.map((pokemon, index) => {
          const selected = pokemon.id === selectedId;
          const href = newTradeUrl(
            params,
            step === "offered"
              ? { offered: pokemon.id, step: nextStep }
              : { wanted: pokemon.id, step: nextStep },
          );
          return (
            <Link
              key={pokemon.id}
              href={href}
              scroll={false}
              aria-pressed={selected}
              className={cn("rounded-3xl", selected && "ring-4 ring-foreground")}
            >
              <PokemonCard
                name={pokemon.name}
                types={pokemon.types}
                image={pokemon.image}
                priority={index === 0} // 第一張在首屏，跟圖鑑一樣先載
              />
            </Link>
          );
        })}
      </div>
      <div className="my-6 flex justify-center">
        <Pagination totalPages={Promise.resolve(totalPages)} currentPage={page} />
      </div>
    </>
  );
}
