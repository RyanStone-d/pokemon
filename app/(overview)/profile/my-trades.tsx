import type { User } from "@/app/shared/auth";
import { formatNodes, type Dictionary } from "@/app/shared/i18n";
import { getDictionary } from "@/app/shared/i18n/server";
import { fetchMyTrades, type Trade } from "../exchange/fetchTrades";
import { formatLinkCode } from "../exchange/trade-utils";
import TradeCard from "../exchange/trade-card";

// PRD 4.C：/profile 顯示「我發的單」（可結案、下架，看得到密語）和「我認領的單」（看得到密語）。
// 卡片跟 Exchange 列表同一張，按鈕和密語由 TradeCard 依身分決定
export default async function MyTrades({
  user,
  claimedId,
}: {
  user: User;
  // 從 /exchange 認領成功跳過來時帶的單號，要在上面提示、並把那張卡標出來
  claimedId?: number;
}) {
  const [res, t] = await Promise.all([fetchMyTrades(), getDictionary()]);

  if (!res.ok) {
    return (
      <p role="alert" className="text-sm text-red-400">
        {res.error}
      </p>
    );
  }

  const posts = res.data.filter((t) => t.creator === user.username);
  const claims = res.data
    .filter((t) => t.claimer === user.username)
    // 剛認領的排第一張
    .sort((a, b) => Number(b.id === claimedId) - Number(a.id === claimedId));
  const justClaimed = claims.find((t) => t.id === claimedId);

  return (
    <div className="flex flex-col gap-8">
      {justClaimed && <ClaimedNotice trade={justClaimed} t={t} />}

      <TradeSection
        title={t.profile.myPosts}
        empty={t.profile.noPosts}
        trades={posts}
        user={user}
      />
      <TradeSection
        title={t.profile.myClaims}
        empty={t.profile.noClaims}
        trades={claims}
        user={user}
        highlightId={claimedId}
      />
    </div>
  );
}

function ClaimedNotice({ trade, t }: { trade: Trade; t: Dictionary }) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-warm bg-surface-2 p-4"
    >
      <p className="text-sm">
        {formatNodes(t.profile.claimedNotice, {
          id: <strong>#{trade.id}</strong>,
          pair: (
            <span className="capitalize">
              {trade.offered.name} ⇄ {trade.wanted.name}
            </span>
          ),
          linkCode:
            trade.linkCode &&
            formatNodes(t.profile.claimedLinkCode, {
              code: (
                <strong className="font-mono">{formatLinkCode(trade.linkCode)}</strong>
              ),
            }),
          creator: trade.creator,
        })}
      </p>
      <a href={`#trade-${trade.id}`} className="text-sm underline">
        {t.profile.viewTrade}
      </a>
    </div>
  );
}

function TradeSection({
  title,
  empty,
  trades,
  user,
  highlightId,
}: {
  title: string;
  empty: string;
  trades: Trade[];
  user: User;
  highlightId?: number;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg">
        {title}
        <span className="ml-2 text-sm text-muted">{trades.length}</span>
      </h2>
      {trades.length === 0 ? (
        <p className="text-sm text-red-300">{empty}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {trades.map((trade) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              user={user}
              highlighted={trade.id === highlightId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
