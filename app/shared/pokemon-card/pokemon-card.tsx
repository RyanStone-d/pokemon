import Image from "next/image";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

import { getPokemonBackground } from "../pokemon";

// 單張寶可夢卡片：屬性色背景、官方圖、名字。
// 圖鑑列表（連到詳細頁）和發交換單的選擇器（點了選起來）都用這張，外面決定包什麼連結
export function PokemonCard({
  name,
  types,
  image,
  priority,
}: {
  name: string;
  types: string[];
  image: string | null;
  priority?: boolean;
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
            priority={priority}
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

export function PokemonCardSkeleton() {
  return (
    <div className="bg-white/10 flex flex-col lg:p-4 gap-3 w-full aspect-[228/280] rounded-3xl overflow-hidden">
      <div className="flex flex-col items-center">
        <span className="mt-6" />
      </div>
    </div>
  );
}

// 跟卡片格一樣的排法，資料回來時版面不會跳
export function PokemonCardsSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {Array.from({ length: count }).map((_, id) => (
        <PokemonCardSkeleton key={id} />
      ))}
    </div>
  );
}
