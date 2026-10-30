// 伺服器端拿目前的語系和字典，Server Component 和 Server Action 都能用。
// 只能在伺服器端 import（用到 next/headers）；Client Component 用 useDictionary()
import { cache } from "react";
import { cookies, headers } from "next/headers";

import en from "./dictionaries/en";
import ja from "./dictionaries/ja";
import zhHant, { type Dictionary } from "./dictionaries/zh-Hant";
import { isLocale, LOCALE_COOKIE, matchAcceptLanguage, type Locale } from "./locales";

const DICTIONARIES: Record<Locale, Dictionary> = { "zh-Hant": zhHant, en, ja };

// 有選過就用 cookie 裡的，沒選過照瀏覽器語系挑。
// 用 cache() 包起來，同一次請求裡不管幾個元件呼叫，只會讀一次
export const getLocale = cache(async (): Promise<Locale> => {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return matchAcceptLanguage((await headers()).get("accept-language"));
});

export async function getDictionary() {
  return DICTIONARIES[await getLocale()];
}
