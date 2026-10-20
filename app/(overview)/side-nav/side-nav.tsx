import {
  ArrowRightStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import { getCurrentUser } from "@/app/shared/auth";
import { SubmitButton } from "@/app/shared/submit-button";
import { logout } from "../profile/actions";
import Logo from "./logo";
import NavLinks from "./nav-links";

// 側欄：登入狀態從 cookie 來（同一次請求裡 getCurrentUser 只會打一次 API）。
// 登入後顯示名字和 Sign Out，沒登入顯示 Sign In 連到 /profile
export default async function SideNav() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-wrap items-center md:flex-col md:items-stretch px-4 p-6 h-full bg-overlay/80">
      {/* 桌機版 logo 跟下面的選單一樣靠左，對齊 icon 那條線 */}
      <Link href="/" className="md:mb-10 md:px-3" title="Pokemon Home">
        <Logo />
      </Link>

      <div className="md:w-full grow md:grow-0 flex gap-2 justify-end md:justify-start items-center md:p-3 rounded mb-2">
        <UserCircleIcon className="w-12 h-12 text-white/80" />
        <div className={user ? "" : "text-muted"}>{user?.username ?? "未登入"}</div>
      </div>

      <div className="grow mt-5 justify-between w-full flex md:flex-col">
        <NavLinks />
        {user ? (
          <form action={logout} className="mt-auto">
            <SubmitButton
              pendingText="登出中…"
              className="w-full flex items-center gap-5 p-4 hover:bg-red-300 rounded cursor-pointer"
            >
              <ArrowRightStartOnRectangleIcon className="w-6 h-6" />
              <span className="hidden md:block">Sign Out</span>
            </SubmitButton>
          </form>
        ) : (
          <Link
            href="/profile"
            className="mt-auto flex items-center gap-5 p-4 hover:bg-red-300 rounded"
          >
            <ArrowRightEndOnRectangleIcon className="w-6 h-6" />
            <span className="hidden md:block">Sign In</span>
          </Link>
        )}
      </div>
    </div>
  );
}
