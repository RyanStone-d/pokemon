// 支援的語系和 cookie 名稱。純資料和純函式，前後端都能 import
export const LOCALES = ["zh-Hant", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh-Hant";
export const LOCALE_COOKIE = "pokenexus-locale";

// 選單上顯示的名字，每個語系都用自己的寫法，不管現在是哪個語系都認得出來
export const LOCALE_LABEL: Record<Locale, string> = {
  "zh-Hant": "繁體中文",
  en: "English",
  ja: "日本語",
};

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

// 還沒選過語系時，照瀏覽器的 Accept-Language 挑一個（例如 "ja,en-US;q=0.9"）。
// 只比主要語言：zh 開頭都給繁中、en-US 給英文；一個都對不上就用預設
export function matchAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;

  const preferred = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.trim().slice(2)) : 1 };
    })
    .filter(({ tag, q }) => tag && q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferred) {
    const language = tag.split("-")[0];
    if (language === "zh") return "zh-Hant";
    if (isLocale(language)) return language;
  }
  return DEFAULT_LOCALE;
}
