import type { User } from "@/app/shared/auth";
import { Pagination } from "@/app/shared/pagination";
import { fetchTrades } from "./fetchTrades";
import type { TradeSide } from "./trade-side";
import TradeCard from "./trade-card";

// 列表本體：在伺服器端抓一次，卡片、顯示範圍、分頁都從同一份資料來
export default async function TradeCards({
  side,
  page,
  query,
  type,
  generation,
  user,
}: {
  side: TradeSide;
  page: number;
  query: string;
  type: string;
  generation: string;
  user: User | null;
}) {
  const res = await fetchTrades({ side, page, query, type, generation });

  if (!res.ok) {
    return (
      <p role="alert" className="text-sm text-red-400">
        {res.error}
      </p>
    );
  }

  const { items, total, perPage, totalPages } = res.data;
  const currentPage = res.data.page;

  if (items.length === 0) {
    return (
      <p className="text-sm text-red-300">
        {query || type || generation
          ? "沒有符合條件的交換單"
          : "目前沒有開放中的交換單"}
      </p>
    );
  }

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((trade) => (
          <TradeCard key={trade.id} trade={trade} user={user} />
        ))}
      </div>
      <div className="my-6 flex gap-3 items-center flex-col md:flex-row md:justify-between">
        <span className="text-sm text-red-300">
          顯示第 <strong className="text-white">{from}</strong> 到{" "}
          <strong className="text-white">{to}</strong> 張，共{" "}
          <strong className="text-white">{total}</strong> 張開放中
        </span>
        <Pagination
          totalPages={Promise.resolve(totalPages)}
          currentPage={currentPage}
        />
      </div>
    </>
  );
}
