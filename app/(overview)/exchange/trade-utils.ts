// 純函式，前後端都能用，有對應的測試

export const LINK_CODE_LENGTH = 8;

// 只留數字、最多 8 碼。使用者貼 "1234-5678" 或 "1234 5678" 都吃得下
export function normalizeLinkCode(input: string) {
  return input.replace(/\D/g, "").slice(0, LINK_CODE_LENGTH);
}

export function isValidLinkCode(code: string) {
  return /^\d{8}$/.test(code);
}

// 12345678 → 1234-5678，跟遊戲裡看到的一樣。打到一半（例如 123）就原樣顯示
export function formatLinkCode(input: string) {
  const digits = normalizeLinkCode(input);
  return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
}

// 「2 小時前」這種相對時間，用 Intl 依語系排字。超過一個月就顯示日期。
// 一分鐘內的「剛剛」Intl 沒有合適的說法，由外面從字典傳進來
export function relativeTime(
  iso: string,
  { locale, justNow }: { locale: string; justNow: string },
  now: Date = new Date(),
) {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";

  // numeric: "always" 才會是「2 天前」，不然會變成「前天」
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "always" });

  const minutes = Math.floor((now.getTime() - time) / 60_000);
  if (minutes < 1) return justNow;
  if (minutes < 60) return format.format(-minutes, "minute");

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return format.format(-hours, "hour");

  const days = Math.floor(hours / 24);
  if (days < 30) return format.format(-days, "day");

  return new Date(iso).toLocaleDateString(locale);
}
