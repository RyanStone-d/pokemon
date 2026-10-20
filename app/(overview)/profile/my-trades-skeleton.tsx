import { Skeleton } from "@/app/shared/skeleton";
import TradeCardsSkeleton from "../exchange/trade-cards-skeleton";

// 我發的單、我認領的單兩個區塊，卡片骨架跟 Exchange 同一套
export default function MyTradesSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {Array.from({ length: 2 }).map((_, section) => (
        <div key={section} className="flex flex-col gap-4">
          <Skeleton className="h-7 w-32" />
          <TradeCardsSkeleton count={4} />
        </div>
      ))}
    </div>
  );
}
