"use client";

import { createContext, use } from "react";
import zhHant, { type Dictionary } from "./dictionaries/zh-Hant";

// Client Component 讀不到 cookie，字典由根 layout 在伺服器端挑好後放進來。
// 沒包 Provider（例如單元測試）就用繁中
const DictionaryContext = createContext<Dictionary>(zhHant);

export function DictionaryProvider({
  dictionary,
  children,
}: {
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  return <DictionaryContext value={dictionary}>{children}</DictionaryContext>;
}

export function useDictionary() {
  return use(DictionaryContext);
}
