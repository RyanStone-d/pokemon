// 交換列表有兩種看法，差別在篩選條件套在單子的哪一邊：
// - 我想要 X：找「有人拿出 X」的單 → 比對 offered
// - 我拿出 X：找「有人想要 X」的單 → 比對 wanted
// 前後端都用這份，Server Component、client 切換鈕、假資料都 import 它

export type TradeSide = "want" | "offer";

export const TRADE_SIDES: {
  side: TradeSide;
  label: string;
  hint: string;
  searchLabel: string;
  searchPlaceholder: string;
  // API 要比對的欄位
  matches: "offered" | "wanted";
}[] = [
  {
    side: "want",
    label: "我想要",
    hint: "找誰拿得出我想要的寶可夢，再看對方想換什麼",
    searchLabel: "我想要的寶可夢",
    searchPlaceholder: "輸入英文名字，例如 pikachu",
    matches: "offered",
  },
  {
    side: "offer",
    label: "我拿出",
    hint: "找誰想要我手上這隻，再看對方願意拿什麼來換",
    searchLabel: "我拿出的寶可夢",
    searchPlaceholder: "輸入英文名字，例如 pikachu",
    matches: "wanted",
  },
];

export const DEFAULT_SIDE: TradeSide = "want";

export function getTradeSide(side: TradeSide) {
  return TRADE_SIDES.find((option) => option.side === side) ?? TRADE_SIDES[0];
}
