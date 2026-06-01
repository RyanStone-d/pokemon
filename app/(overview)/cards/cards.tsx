import Image from "next/image";
import Link from "next/link";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { ViewTransition } from "react";

import { fetchPokemonList } from "../fetchPokemon";
import { getPokemonBackground } from "../pokemon-config";

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
  if (page) search.set("page", page);
  if (type) search.set("type", type);
  if (generation) search.set("generation", generation);
  return `${pathname}?${search.toString()}`;
}

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
      {pokemonList.map((pokemon) => (
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
            <Card
              name={pokemon.name}
              types={pokemon.types}
              image={pokemon.image}
            />
          </Link>
        </ViewTransition>
      ))}
    </div>
  );
}

function Card({
  name,
  types,
  image,
}: {
  name: string;
  types: string[];
  image: string | null;
}) {
  const background = getPokemonBackground(types);

  return (
    <div
      className="flex flex-col lg:p-4 gap-3 w-full aspect-[228/280] rounded-3xl overflow-hidden"
      style={{ background }}
    >
      <div className="relative flex-1 lg:rounded-2xl overflow-hidden bg-white/10 hover:scale-105 transition-transform">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="20vw"
            loading="eager"
            className="object-contain md:p-1 lg:p-3 transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <QuestionMarkCircleIcon className="w-full h-full text-white/50 p-6" />
        )}
      </div>
      <div className="flex flex-col items-center justify-center min-h-[40px]">
        <span className="text-sm font-medium  w-full text-center capitalize line-clamp-2">
          {name}
        </span>
      </div>
    </div>
  );
}
