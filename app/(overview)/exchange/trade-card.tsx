import Image from "next/image";
import Link from "next/link";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

import { cn } from "@/lib/utils";
import type { User } from "@/app/shared/auth";
import { getPokemonBackground } from "@/app/shared/pokemon";
import { TRADE_STATUS_TEXT, type Trade, type TradePokemon } from "./fetchTrades";
import { formatLinkCode, relativeTime } from "./trade-utils";
import { cancelTrade, claimTrade, completeTrade } from "./actions";
import TradeActionForm from "./trade-action-form";

// 一張交換單（PRD 4.C 的 TradePostCard），Exchange 列表和 Profile 的我的交換單都用這張。
// 重點是兩隻要交換的寶可夢，各佔半張卡、跟圖鑑卡片一樣用屬性色當背景；
// 發文者、認領者、時間、狀態、密語、按鈕都放下面。
// 按鈕看是誰在看：沒登入→去登入、別人的→我要交換、自己的→換完了／下架
export default function TradeCard({
  trade,
  user,
  highlighted = false,
}: {
  trade: Trade;
  user: User | null;
  // 剛認領的那張用紅框標出來
  highlighted?: boolean;
}) {
  const isOwner = user?.username === trade.creator;
  const isClaimer = !!user && trade.claimer === user.username;

  return (
    <article
      id={`trade-${trade.id}`}
      className={cn(
        "flex flex-col gap-3 bg-surface rounded-3xl p-3 scroll-mt-6",
        highlighted && "ring-2 ring-border-warm",
      )}
    >
      <div className="relative grid grid-cols-2 gap-2">
        <Mon pokemon={trade.offered} label="拿出" />
        <Mon pokemon={trade.wanted} label="想要" />
        <span
          aria-label="交換"
          className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-background/90 text-xl shadow-lg"
        >
          ⇄
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 px-1 text-sm">
        <span className="text-muted truncate">
          @{trade.creator}
          {trade.claimer && ` ⇄ @${trade.claimer}`} · {relativeTime(trade.createdAt)}
        </span>
        <span className="shrink-0 rounded-full px-2 py-0.5 bg-accent-muted text-red-300 text-xs">
          {TRADE_STATUS_TEXT[trade.status]}
        </span>
      </div>

      {/* 密語只有發文者和認領者看得到，API 不會回給別人 */}
      {trade.linkCode && (isOwner || isClaimer) && (
        <p className="px-1 text-sm">
          連線密語{" "}
          <strong className="font-mono">{formatLinkCode(trade.linkCode)}</strong>
        </p>
      )}

      <CardAction trade={trade} user={user} isOwner={isOwner} />
    </article>
  );
}

function Mon({ pokemon, label }: { pokemon: TradePokemon; label: string }) {
  // 跟圖鑑卡片一樣用屬性色當背景；API 沒給屬性就用素色
  const background = pokemon.types.length
    ? getPokemonBackground(pokemon.types)
    : "var(--pn-surface-2)";

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background }}>
      <div className="relative aspect-square">
        {pokemon.image ? (
          <Image
            src={pokemon.image}
            alt={pokemon.name}
            fill
            sizes="(min-width: 1280px) 12vw, (min-width: 768px) 22vw, 45vw"
            className="object-contain p-2"
          />
        ) : (
          <QuestionMarkCircleIcon className="w-full h-full text-white/50 p-6" />
        )}
      </div>
      <div className="flex flex-col items-center py-2 bg-black/25">
        <span className="text-[11px] uppercase tracking-wide text-white/70">
          {label}
        </span>
        <span className="text-sm font-medium capitalize line-clamp-1">
          {pokemon.name}
        </span>
      </div>
    </div>
  );
}

function CardAction({
  trade,
  user,
  isOwner,
}: {
  trade: Trade;
  user: User | null;
  isOwner: boolean;
}) {
  if (!user) {
    return (
      <Link
        href="/profile"
        className="text-center px-4 py-2 rounded text-sm bg-surface-hover hover:bg-surface-2"
      >
        登入後交換
      </Link>
    );
  }

  if (isOwner) {
    if (trade.status !== "open" && trade.status !== "claimed") return null;
    return (
      <div className="flex gap-2">
        {trade.status === "claimed" && (
          <TradeActionForm
            action={completeTrade.bind(null, trade.id)}
            label="換完了"
          />
        )}
        <TradeActionForm
          action={cancelTrade.bind(null, trade.id)}
          label="下架"
          variant="secondary"
        />
      </div>
    );
  }

  if (trade.status === "open") {
    return (
      <TradeActionForm action={claimTrade.bind(null, trade.id)} label="我要交換" />
    );
  }

  return null;
}
