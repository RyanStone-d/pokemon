// 骨架屏的最小單位：資料還沒回來時先畫出同樣形狀的灰色方塊。
// 每個頁面自己的骨架（卡片、列表）跟該頁的元件放一起，這裡只放通用的
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/10 ${className}`} />;
}
