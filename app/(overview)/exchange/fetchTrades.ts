// 交換單的讀取，只在伺服器端用。格式用 zod 驗，API 改了會立刻知道
import { z } from "zod";
import { apiFetch, type ApiResult } from "@/app/shared/api";
import { getToken } from "@/app/shared/auth";
import { getTradeSide, type TradeSide } from "./trade-side";

export const tradePokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string().url().nullable(),
  types: z.array(z.string()), // 卡片背景要用屬性色
});

export const tradeSchema = z.object({
  id: z.number(),
  status: z.enum(["open", "claimed", "completed", "cancelled"]),
  createdAt: z.string(),
  creator: z.string(),
  claimer: z.string().nullable().optional(),
  offered: tradePokemonSchema,
  wanted: tradePokemonSchema,
  linkCode: z.string().optional(), // API 只回給發文者和認領者
});

const tradeListSchema = z.object({
  items: z.array(tradeSchema),
  page: z.number(),
  perPage: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export type TradePokemon = z.infer<typeof tradePokemonSchema>;
export type Trade = z.infer<typeof tradeSchema>;
export type TradeList = z.infer<typeof tradeListSchema>;

export const TRADE_STATUS_TEXT: Record<Trade["status"], string> = {
  open: "等待交換",
  claimed: "已配對",
  completed: "已完成",
  cancelled: "已下架",
};

// 公開列表：只有 open 的單。名字、屬性、世代的參數名跟 /pokemon 一樣，
// side 決定它們套在 offered 還是 wanted（見 trade-side.ts）。
// 有登入會帶 token，API 才會在自己發的單上附 linkCode
export async function fetchTrades({
  side,
  page,
  query,
  type,
  generation,
}: {
  side: TradeSide;
  page: number;
  query: string;
  type?: string;
  generation?: string;
}): Promise<ApiResult<TradeList>> {
  const search = new URLSearchParams({
    page: String(Math.max(1, page)),
    side: getTradeSide(side).matches,
  });
  if (query) search.set("search", query.toLowerCase());
  if (type) search.set("type", type);
  if (generation) search.set("generation", generation);
  return apiFetch(`/trades?${search}`, {
    token: await getToken(),
    schema: tradeListSchema,
  });
}

// 我發的和我認領的，不分狀態，都附 linkCode
export async function fetchMyTrades(): Promise<ApiResult<Trade[]>> {
  return apiFetch("/trades/mine", {
    token: await getToken(),
    schema: z.array(tradeSchema),
  });
}
