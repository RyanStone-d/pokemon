import { Suspense } from "react";
import { z } from "zod";

import { getCurrentUser } from "@/app/shared/auth";
import AuthPanel from "./auth-panel";
import MyTrades from "./my-trades";
import MyTradesSkeleton from "./my-trades-skeleton";

// 認領成功後 /exchange 會導到 /profile?claimed=<單號>
const searchParamsSchema = z.object({
  claimed: z.coerce.number().int().positive().optional().catch(undefined),
});

// 跟首頁一樣是 Server Component：登入狀態從 cookie 來，沒有前端的 loading 狀態。
// 使用者名字和登出都在側欄，這頁只放登入面板或我的交換單
export default async function ProfilePage(props: {
  searchParams?: Promise<{ claimed?: string }>;
}) {
  const user = await getCurrentUser();
  const { claimed } = searchParamsSchema.parse((await props.searchParams) ?? {});

  return (
    <main className="flex flex-col min-h-full">
      <div className="flex justify-between items-center bg-overlay/80 py-6 px-4">
        <h1 className="text-xl md:text-2xl">Profile</h1>
      </div>

      {user ? (
        <div className="flex flex-col gap-6 p-4 md:p-6">
          <Suspense fallback={<MyTradesSkeleton />}>
            <MyTrades user={user} claimedId={claimed} />
          </Suspense>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <AuthPanel />
        </div>
      )}
    </main>
  );
}
