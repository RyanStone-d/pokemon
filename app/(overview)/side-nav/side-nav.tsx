import {
  ArrowRightStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import { getCurrentUser } from "@/app/shared/auth";
import { getDictionary, getLocale } from "@/app/shared/i18n/server";
import { SubmitButton } from "@/app/shared/submit-button";
import { logout } from "../profile/actions";
import LanguageSelect from "./language-select";
import Logo from "./logo";
import NavLinks from "./nav-links";

// 側欄：登入狀態從 cookie 來（同一次請求裡 getCurrentUser 只會打一次 API）。
// 登入後顯示名字和登出，沒登入顯示登入連到 /profile；語系選單放在登入／登出上面
export default async function SideNav() {
  const [user, t, locale] = await Promise.all([
    getCurrentUser(),
    getDictionary(),
    getLocale(),
  ]);

  return (
    <div className="flex flex-wrap items-center md:flex-col md:items-stretch px-4 p-6 h-full bg-overlay/80">
      {/* 桌機版 logo 跟下面的選單一樣靠左，對齊 icon 那條線 */}
      <Link href="/" className="md:mb-10 md:px-3" title={t.nav.home}>
        <Logo />
      </Link>

      <div className="md:w-full grow md:grow-0 flex gap-2 justify-end md:justify-start items-center md:p-3 rounded mb-2">
        <UserCircleIcon className="w-12 h-12 text-white/80" />
        <div className={user ? "" : "text-muted"}>{user?.username ?? t.nav.guest}</div>
      </div>

      <div className="grow mt-5 justify-between w-full flex md:flex-col">
        <NavLinks />
        <div className="mt-auto flex md:flex-col">
          <LanguageSelect locale={locale} />
          {user ? (
            <form action={logout}>
              <SubmitButton
                pendingText={t.nav.signingOut}
                className="w-full flex items-center gap-5 p-4 hover:bg-red-300 rounded cursor-pointer"
              >
                <ArrowRightStartOnRectangleIcon className="w-6 h-6" />
                <span className="hidden md:block">{t.nav.signOut}</span>
              </SubmitButton>
            </form>
          ) : (
            <Link
              href="/profile"
              className="flex items-center gap-5 p-4 hover:bg-red-300 rounded"
            >
              <ArrowRightEndOnRectangleIcon className="w-6 h-6" />
              <span className="hidden md:block">{t.nav.signIn}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
