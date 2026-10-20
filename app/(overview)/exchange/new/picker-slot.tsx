import Image from "next/image";
import Link from "next/link";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

import { cn } from "@/lib/utils";
import { getPokemonBackground } from "@/app/shared/pokemon";
import type { PickedPokemon } from "./picker-cards";

// 上方的兩格：我拿出 / 我想要。點了會切換現在在選哪一格
export default function PickerSlot({
  label,
  active,
  pokemon,
  href,
}: {
  label: string;
  active: boolean;
  pokemon: PickedPokemon | null;
  href: string;
}) {
  const background = pokemon?.types.length
    ? getPokemonBackground(pokemon.types)
    : "var(--pn-surface-2)";

  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "step" : undefined}
      className={cn(
        "flex items-center gap-4 rounded-2xl p-4 bg-surface border-2 transition-colors",
        // 選中的格子用設計系統的暖色邊框，跟 RouteSelect 的下拉框一致
        active ? "border-border-warm" : "border-border hover:bg-surface-hover",
      )}
    >
      <div
        className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0"
        style={{ background }}
      >
        {pokemon?.image ? (
          <Image
            src={pokemon.image}
            alt={pokemon.name}
            fill
            sizes="64px"
            className="object-contain p-1"
          />
        ) : (
          <QuestionMarkCircleIcon className="w-full h-full text-white/40 p-3" />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-muted">{label}</span>
        <span className="capitalize">{pokemon?.name ?? "點這裡選"}</span>
      </div>
    </Link>
  );
}
