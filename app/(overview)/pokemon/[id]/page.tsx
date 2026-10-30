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
} from "@/app/shared/pokemon";
import { fetchPokemonDetail } from "@/app/shared/pokemon";
import { getDictionary } from "@/app/shared/i18n/server";

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
  const [pokemon, t] = await Promise.all([fetchPokemonDetail(id), getDictionary()]);
  const { name, types, image, shape, stats } = pokemon;

  // 顏色看代碼，顯示的名字由 API 依語系回傳
  const editType = types.map((type) => ({
    bg: TYPE_COLOR_MAP[type.code as PokemonType],
    text: type.name,
  }));

  const background = getPokemonBackground(types.map((type) => type.code));

  const searchParams = await props.searchParams;
  const backUrl = `/?${new URLSearchParams(
    Object.fromEntries(
      Object.entries(searchParams ?? {}).filter(([, v]) => v !== undefined),
    ) as Record<string, string>,
  )}`;

  const STAT_COLOR: Record<(typeof stats)[number]["key"], string> = {
    hp: "bg-type-fighting", // #c03028 紅
    attack: "bg-type-fire", // #f08030 橘
    defense: "bg-type-flying", // #e0c068 黃
    spAtk: "bg-type-water", // #6890f0 藍
    spDef: "bg-type-grass", // #78c850 綠
    speed: "bg-type-psychic", // #f85888 粉
  };

  const editStats = stats.map(({ key, val }) => ({
    name: t.pokemon.stats[key],
    val,
    color: STAT_COLOR[key],
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
            title={t.pokemon.back}
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
            <span className="mb-6">{t.pokemon.baseStats}</span>
            {editStats.map(({ name, val, color }) => (
              <div
                key={name}
                className="w-full grid grid-cols-[2fr_8fr] gap-4 space-y-5"
              >
                <div className="text-sm flex justify-between">
                  <div className="self-center">{name}：</div>
                  <div className="self-center">{val}</div>
                </div>
                <div className="relative rounded bg-black h-[24px] w-full">
                  <div
                    style={{ width: `${(val / 255) * 100}%` }}
                    className={`absolute left-0 h-full rounded ${color} flex items-center justify-end`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </ViewTransition>
  );
}
