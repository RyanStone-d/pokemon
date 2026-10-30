// 前後端都能 import 的部分。伺服器端拿語系和字典從 "./server" import，
// 放在這裡的話 Client Component 一 import 就會把 next/headers 帶進瀏覽器
export * from "./locales";
export * from "./format";
export { DictionaryProvider, useDictionary } from "./dictionary-provider";
export type { Dictionary } from "./dictionaries/zh-Hant";
