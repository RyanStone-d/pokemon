import Image from "next/image";
import Link from "next/link";
import { ArrowsRightLeftIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

import { cn } from "@/lib/utils";
import type { User } from "@/app/shared/auth";
import { getPokemonBackground } from "@/app/shared/pokemon";
import { formatNodes, type Dictionary } from "@/app/shared/i18n";
import { getDictionary, getLocale } from "@/app/shared/i18n/server";
import type { Trade, TradePokemon } from "./fetchTrades";
import { formatLinkCode, relativeTime } from "./trade-utils";
import { cancelTrade, claimTrade, completeTrade } from "./actions";
import TradeActionForm from "./trade-action-form";

// 一張交換單（PRD 4.C 的 TradePostCard），Exchange 列表和 Profile 的我的交換單都用這張。
// 最上面是多久前發的、狀態；中間兩隻要交換的寶可夢，跟圖鑑卡片一樣用屬性色當背景；
// 認領者、密語、按鈕放下面。
// 按鈕看是誰在看：沒登入→去登入、別人的→我要交換、自己的→換完了／下架
export default async function TradeCard({
  trade,
  user,
  highlighted = false,
}: {
  trade: Trade;
  user: User | null;
  // 剛認領的那張用紅框標出來
  highlighted?: boolean;
}) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const isOwner = user?.username === trade.creator;
  const isClaimer = !!user && trade.claimer === user.username;
  // 自己認領的單寫「你」
  const claimerName = isClaimer ? t.exchange.you : trade.claimer;

  return (
    <article
      id={`trade-${trade.id}`}
      className={cn(
        "flex flex-col gap-3 bg-surface rounded-3xl p-3 scroll-mt-6",
        highlighted && "ring-2 ring-border-warm",
      )}
    >
      {/* 多久前發的、狀態 */}
      <header className="flex items-center justify-between gap-2 px-1 text-sm">
        <span className="text-muted">
          {relativeTime(trade.createdAt, { locale, justNow: t.exchange.justNow })}
        </span>
        <span className="shrink-0 rounded-full px-2 py-0.5 bg-surface-2 text-muted text-xs">
          {t.exchange.status[trade.status]}
        </span>
      </header>

      {/* 左邊是拿出的、右邊是想要的；箭頭自己佔中間一欄，不會蓋到圖 */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
        <Mon pokemon={trade.offered} />
        <ArrowsRightLeftIcon aria-label={t.exchange.swap} className="w-5 h-5 text-muted" />
        <Mon pokemon={trade.wanted} />
      </div>

      {claimerName && (
        <p className="px-1 text-sm text-muted">
          {formatNodes(t.exchange.claimedBy, {
            name: <span className="text-foreground">{claimerName}</span>,
          })}
        </p>
      )}

      {/* 密語只有發文者和認領者看得到，API 不會回給別人 */}
      {trade.linkCode && (isOwner || isClaimer) && (
        <p className="px-1 text-sm">
          {t.exchange.linkCode}{" "}
          <strong className="font-mono">{formatLinkCode(trade.linkCode)}</strong>
        </p>
      )}

      <CardAction trade={trade} user={user} isOwner={isOwner} t={t} />
    </article>
  );
}

function Mon({ pokemon }: { pokemon: TradePokemon }) {
  // 跟圖鑑卡片一樣用屬性色當背景；API 沒給屬性就用素色
  const background = pokemon.types.length
    ? getPokemonBackground(pokemon.types)
    : "var(--pn-surface-2)";

  return (
    // 圖撐滿整格、在整格裡置中；名字用 absolute 疊在底部，不佔圖的空間
    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden" style={{ background }}>
      {pokemon.image ? (
        <Image
          src={pokemon.image}
          alt={pokemon.name}
          fill
          sizes="(min-width: 1280px) 10vw, (min-width: 768px) 20vw, 40vw"
          className="object-contain p-3"
        />
      ) : (
        <QuestionMarkCircleIcon className="absolute inset-0 m-auto w-1/2 h-1/2 text-white/50" />
      )}
      <span className="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-black/30 text-center text-sm font-medium capitalize truncate">
        {pokemon.name}
      </span>
    </div>
  );
}

function CardAction({
  trade,
  user,
  isOwner,
  t,
}: {
  trade: Trade;
  user: User | null;
  isOwner: boolean;
  t: Dictionary;
}) {
  if (!user) {
    return (
      <Link
        href="/profile"
        className="text-center px-4 py-2 rounded text-sm bg-surface-hover hover:bg-surface-2"
      >
        {t.exchange.signInToTrade}
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
            label={t.exchange.complete}
          />
        )}
        <TradeActionForm
          action={cancelTrade.bind(null, trade.id)}
          label={t.exchange.cancel}
          variant="secondary"
        />
      </div>
    );
  }

  if (trade.status === "open") {
    return (
      <TradeActionForm action={claimTrade.bind(null, trade.id)} label={t.exchange.claim} />
    );
  }

  return null;
}
