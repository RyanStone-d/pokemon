import { Skeleton } from "@/app/shared/skeleton";

// 跟 TradeCard 的格子一樣大，資料回來時版面不會跳。Exchange 列表和 Profile 都用
export default function TradeCardsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />
      ))}
    </div>
  );
}
