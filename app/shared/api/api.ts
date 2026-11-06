// 打 pokemon-api 的共用函式，只在伺服器端用（Server Component、Server Action）。
// 瀏覽器不直接打 API，所以沒有 CORS 問題，token 也不會出現在前端程式碼裡。
// 圖鑑那邊的 fetchPokemon.ts 有自己的 getJson（要走 Next 的快取），這支給交換單和登入用
import { z } from "zod";
import { getDictionary, getLocale } from "../i18n/server";
import { isMockApi, mockApi } from "./mock-api";
import { API_URL } from "./url";

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string };

// API 的錯誤是 { error: 代碼, message: 訊息 }，代碼給程式判斷，畫面顯示 message。
// message 的語言由網址的 ?lang= 決定，翻譯都在 Express
const errorBodySchema = z.object({
  error: z.string(),
  message: z.string(),
});

// 回 ok / error 而不是直接 throw，讓畫面可以在原地顯示錯誤，不用整頁炸掉
export async function apiFetch<T>(
  path: string,
  {
    method = "GET",
    body,
    token,
    schema,
  }: {
    method?: "GET" | "POST" | "PATCH";
    body?: unknown;
    token?: string | null;
    // 有給就用 zod 驗回傳格式，API 改了格式會立刻知道
    schema?: z.ZodType<T>;
  } = {},
): Promise<ApiResult<T>> {
  // MOCK_API=true：還沒做好的 /trades 用記憶體裡的假資料
  if (isMockApi(path)) {
    const reply = await mockApi({ method, path, body, token });
    return toResult(path, reply.status, reply.json, schema);
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = new URL(path, API_URL);
  url.searchParams.set("lang", await getLocale());

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store", // 交換單、登入狀態都是即時資料，不快取
    });
  } catch {
    const t = await getDictionary();
    return { ok: false, status: 0, error: t.common.cannotReachServer };
  }

  // 204 沒有 body；非 JSON 的回應也不要讓 .json() 炸掉
  const json: unknown =
    res.status === 204 ? null : await res.json().catch(() => null);
  return toResult(path, res.status, json, schema);
}

async function toResult<T>(
  path: string,
  status: number,
  json: unknown,
  schema?: z.ZodType<T>,
): Promise<ApiResult<T>> {
  if (status < 200 || status >= 300) {
    const parsed = errorBodySchema.safeParse(json);
    if (!parsed.success) return { ok: false, status, error: `HTTP ${status}` };
    return { ok: false, status, error: parsed.data.message };
  }

  if (schema) {
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.error(`Invalid API response for ${path}:`, parsed.error.message);
      const t = await getDictionary();
      return { ok: false, status, error: t.common.badResponse };
    }
    return { ok: true, status, data: parsed.data };
  }

  return { ok: true, status, data: json as T };
}
