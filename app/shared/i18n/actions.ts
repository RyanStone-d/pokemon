"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { isLocale, LOCALE_COOKIE } from "./locales";

const LOCALE_MAX_AGE = 60 * 60 * 24 * 365; // 一年

// 語系選單用：寫進 cookie 後 refresh()，整個畫面用新語系重畫，網址不變。
// 只換畫面文字，不用 revalidatePath，寶可夢 API 的快取照留
export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: LOCALE_MAX_AGE,
  });
  refresh();
}
