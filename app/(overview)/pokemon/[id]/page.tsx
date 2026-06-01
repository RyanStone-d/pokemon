import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  QuestionMarkCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import {
  getPokemonBackground,
  TYPE_COLOR_MAP,
  type PokemonType,
} from "@/app/(overview)/pokemon-config";
import { fetchPokemonDetail } from "@/app/(overview)/fetchPokemon";

export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    query?: string;
    page?: string;
    type?: string;
    generation?: string;
  }>;
}) {
  const { id } = await props.params;
  const pokemon = await fetchPokemonDetail(id);
  const { name, types, image, shape, stats } = pokemon;

  const editType = types.map((t) => ({
    bg: TYPE_COLOR_MAP[t as PokemonType],
    text: t as PokemonType,
  }));

  const background = getPokemonBackground(types);

  const searchParams = await props.searchParams;
  const backUrl = `/?${new URLSearchParams(
    Object.fromEntries(
      Object.entries(searchParams ?? {}).filter(([, v]) => v !== undefined),
    ) as Record<string, string>,
  )}`;

  const STAT_COLOR: Record<string, string> = {
    HP: "bg-type-fighting", // #c03028 紅
    Atk: "bg-type-fire", // #f08030 橘
    Def: "bg-type-flying", // #e0c068 黃
    SpA: "bg-type-water", // #6890f0 藍
    SpD: "bg-type-grass", // #78c850 綠
    Spe: "bg-type-psychic", // #f85888 粉
  };

  const editStats = stats.map(({ name, val }) => ({
    name,
    val,
    color: STAT_COLOR[name],
  }));

  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      default="none"
    >
      <main
        style={{ "--bg": background } as React.CSSProperties}
        className="relative isolate before:absolute before:top-0 before:-z-[1] before:block before:w-full before:h-[309px] md:before:h-[400px] before:rounded-b-3xl before:content-[''] before:[background:var(--bg)]"
      >
        <div className="p-6 flex justify-between">
          <Link
            href={backUrl}
            transitionTypes={["nav-back"]}
            className="rounded-md p-2 bg-white/20 backdrop-blur-md border border-[#002f35]/30 cursor-pointer"
          >
            <ArrowLeftIcon className="w-6 h-6 text-[#002f35]" />
          </Link>
          <span className="text-2xl font-bold text-[#002f35]"># {id}</span>
        </div>

        <div className="flex flex-col items-center">
          <ViewTransition name={`pokemon-card-${id}`}>
            <div className="mt-[5%] mb-6 bg-white rounded">
              {image ? (
                <Image
                  src={image}
                  alt={name}
                  width={320}
                  height={320}
                  loading="eager"
                />
              ) : (
                <QuestionMarkCircleIcon className="w-full h-full text-white/50 p-6" />
              )}
            </div>
          </ViewTransition>
          <span className="text-4xl font-bold mb-4 capitalize">{name}</span>
          <div className="flex gap-6 capitalize">
            {editType.map((t) => (
              <span
                key={t.text}
                style={{ background: t.bg }}
                className="rounded-md px-3 py-1"
              >
                {t.text}
              </span>
            ))}
          </div>
          <div className="mt-8 flex gap-12">
            <span className="rounded px-8 py-4 bg-overlay/80 text-2xl">
              {shape.height} m
            </span>
            <span className="rounded px-8 py-4 bg-overlay/80 text-2xl">
              {shape.weight} kg
            </span>
          </div>

          <div className="my-12 bg-overlay/80 rounded p-6 flex flex-col items-center w-full max-w-lg">
            <span className="mb-6">Base Stats</span>
            {editStats.map(({ name, val, color }) => (
              <div key={name} className="w-full flex  gap-4 space-y-5">
                <span className="w-10 shrink-0 text-sm">{name}</span>
                <div className="relative rounded bg-black h-[24px] w-full">
                  <div
                    style={{ width: `${(val / 255) * 100}%` }}
                    className={`absolute left-0 h-full rounded ${color} flex items-center justify-end`}
                  >
                    <div className="text-sm pr-2">{val} </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </ViewTransition>
  );
}
