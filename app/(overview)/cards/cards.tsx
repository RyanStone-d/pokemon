import Link from "next/link";
import { ViewTransition } from "react";

import { fetchPokemonList } from "@/app/shared/pokemon";
import { PokemonCard } from "@/app/shared/pokemon-card";

function getPokemonUrl({
  pathname,
  searchParams,
}: {
  pathname: string;
  searchParams: {
    query?: string;
    page?: number;
    type?: string;
    generation?: string;
  };
}) {
  const { query, page, type, generation } = searchParams;
  const search = new URLSearchParams();
  if (query) search.set("query", query);
  if (page) search.set("page", String(page));
  if (type) search.set("type", type);
  if (generation) search.set("generation", generation);
  return `${pathname}?${search.toString()}`;
}

// 圖鑑首頁的卡片列表：每張卡連到詳細頁，並把目前的篩選條件帶過去，返回時才回得來
export default async function Cards({
  currentPage,
  type,
  generation,
  query,
}: {
  currentPage: number;
  type: string;
  generation: string;
  query: string;
}) {
  const pokemonList = await fetchPokemonList(
    currentPage,
    type,
    generation,
    query,
  );

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {pokemonList.map((pokemon, index) => (
        <ViewTransition key={pokemon.id} name={`pokemon-card-${pokemon.id}`}>
          <Link
            href={getPokemonUrl({
              pathname: `/pokemon/${pokemon.id}`,
              searchParams: {
                query,
                page: currentPage,
                type,
                generation,
              },
            })}
          >
            <PokemonCard
              name={pokemon.name}
              types={pokemon.types}
              image={pokemon.image}
              priority={index === 0}
            />
          </Link>
        </ViewTransition>
      ))}
    </div>
  );
}
