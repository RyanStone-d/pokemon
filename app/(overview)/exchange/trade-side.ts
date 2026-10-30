// 交換列表有兩種看法，差別在篩選條件套在單子的哪一邊：
// - 我想要 X：找「有人拿出 X」的單 → 比對 offered
// - 我拿出 X：找「有人想要 X」的單 → 比對 wanted
// 前後端都用這份，Server Component、client 切換鈕、假資料都 import 它。
// 畫面上的文字在字典的 exchange.sides

export type TradeSide = "want" | "offer";

export const TRADE_SIDES: {
  side: TradeSide;
  // API 要比對的欄位
  matches: "offered" | "wanted";
}[] = [
  { side: "want", matches: "offered" },
  { side: "offer", matches: "wanted" },
];

export const DEFAULT_SIDE: TradeSide = "want";

export function getTradeSide(side: TradeSide) {
  return TRADE_SIDES.find((option) => option.side === side) ?? TRADE_SIDES[0];
}
