// 打 pokemon-api 的共用函式，只在伺服器端用（Server Component、Server Action）。
// 瀏覽器不直接打 API，所以沒有 CORS 問題，token 也不會出現在前端程式碼裡。
// 圖鑑那邊的 fetchPokemon.ts 有自己的 getJson（要走 Next 的快取），這支給交換單和登入用
import { z } from "zod";
import { isMockApi, mockApi } from "./mock-api";

export const API_URL =
  process.env.POKEMON_API_URL ?? "https://pokemon-api-3igu.onrender.com";

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string };

// 回 ok / error 而不是直接 throw，讓畫面可以在原地顯示錯誤，不用整頁炸掉
export async function apiFetch<T>(
  path: string,
  {
    method = "GET",
    body,
    token,
    schema,
  }: {
    method?: "GET" | "POST";
    body?: unknown;
    token?: string | null;
    // 有給就用 zod 驗回傳格式，API 改了格式會立刻知道
    schema?: z.ZodType<T>;
  } = {},
): Promise<ApiResult<T>> {
  // MOCK_API=true：API 還沒做好前，用記憶體裡的假資料走完整個流程
  if (isMockApi()) {
    const reply = await mockApi({ method, path, body, token });
    return toResult(path, reply.status, reply.json, schema);
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store", // 交換單、登入狀態都是即時資料，不快取
    });
  } catch {
    return { ok: false, status: 0, error: "連不上伺服器，請稍後再試" };
  }

  // 204 沒有 body；非 JSON 的回應也不要讓 .json() 炸掉
  const json: unknown =
    res.status === 204 ? null : await res.json().catch(() => null);
  return toResult(path, res.status, json, schema);
}

function toResult<T>(
  path: string,
  status: number,
  json: unknown,
  schema?: z.ZodType<T>,
): ApiResult<T> {
  if (status < 200 || status >= 300) {
    const message =
      typeof json === "object" &&
      json !== null &&
      "error" in json &&
      typeof json.error === "string"
        ? json.error
        : `HTTP ${status}`;
    return { ok: false, status, error: message };
  }

  if (schema) {
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.error(`Invalid API response for ${path}:`, parsed.error.message);
      return { ok: false, status, error: "伺服器回傳的格式不對" };
    }
    return { ok: true, status, data: parsed.data };
  }

  return { ok: true, status, data: json as T };
}
