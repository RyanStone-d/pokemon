// session cookie：把 { user, apiToken, refreshToken } 用 SESSION_SECRET 加密（JWE dir + A256GCM）。
// 瀏覽器拿到的是看不懂的字串，改過一個字就解不開；解得開就代表是我們自己發的。
// proxy.ts 和 auth.ts 都會用，所以這裡不能 import next/headers
import { EncryptJWT, decodeJwt, jwtDecrypt } from "jose";
import { z } from "zod";
import { API_URL } from "../api/api";

export const SESSION_COOKIE = "pokenexus-session";

// 跟 Express 的 refresh token 一樣 7 天。換新 token 時不延長，Express 那邊也不延長
const SESSION_DAYS = 7;

// access token 剩不到這麼多秒就先換，免得送到 Express 的途中剛好過期
const REFRESH_LEEWAY_SECONDS = 30;

export const userSchema = z.object({ id: z.number(), username: z.string() });
export type User = z.infer<typeof userSchema>;

const sessionSchema = z.object({
  user: userSchema,
  apiToken: z.string(),
  refreshToken: z.string(),
  exp: z.number(),
});
// exp 是整個 session 的到期時間（Unix 秒），也是 cookie 的期限
export type Session = z.infer<typeof sessionSchema>;

function sessionKey() {
  const key = Buffer.from(process.env.SESSION_SECRET ?? "", "base64url");
  if (key.length !== 32) {
    throw new Error("SESSION_SECRET 要是 32 bytes 的 base64url（openssl rand -base64 32）");
  }
  return key;
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

export function newSessionExp() {
  return nowSeconds() + SESSION_DAYS * 24 * 60 * 60;
}

export async function encryptSession(session: Session) {
  const { user, apiToken, refreshToken, exp } = session;
  return new EncryptJWT({ user, apiToken, refreshToken })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setExpirationTime(exp)
    .encrypt(sessionKey());
}

// 沒有 cookie、被改過、鑰匙換了、過期，都當作沒登入
export async function decryptSession(value: string | undefined): Promise<Session | null> {
  if (!value) return null;
  try {
    const { payload } = await jwtDecrypt(value, sessionKey());
    const parsed = sessionSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(exp: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.max(exp - nowSeconds(), 0),
  };
}

// 只看 exp 決定要不要換，不驗簽章：apiToken 是從我們自己加密的 session 裡拿出來的，驗簽章是 Express 的事
export function accessTokenExpiresSoon(apiToken: string) {
  try {
    const { exp } = decodeJwt(apiToken);
    return exp === undefined || exp - nowSeconds() < REFRESH_LEEWAY_SECONDS;
  } catch {
    return true;
  }
}

const refreshResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  user: userSchema,
});

type RefreshResult = Session | null | "unavailable";

// 同一張 refresh token 同時被好幾個請求拿來換（例如一次開好幾個分頁）時，只送一次給 Express，大家共用結果。
// 不然第二個送到 Express 會被當成「用過的又拿來換」，整串作廢，使用者被登出。
// 換完再留 10 秒：瀏覽器還沒收到新 cookie 前送出的請求，帶的還是舊的那張
const REFRESH_SHARE_MS = 10_000;
const pendingRefreshes = new Map<string, Promise<RefreshResult>>();

// null：Express 說換不了（過期、登出過、被偷偵測），要重新登入。
// "unavailable"：連不上或回了別的錯，這次先不動 cookie，下次請求再試
export function refreshSession(session: Session): Promise<RefreshResult> {
  const key = session.refreshToken;
  const pending = pendingRefreshes.get(key);
  if (pending) return pending;

  const result = requestRefresh(session);
  pendingRefreshes.set(key, result);
  result.finally(() => setTimeout(() => pendingRefreshes.delete(key), REFRESH_SHARE_MS));
  return result;
}

async function requestRefresh(session: Session): Promise<RefreshResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
      cache: "no-store",
    });
  } catch {
    return "unavailable";
  }
  if (res.status === 401) return null;
  if (!res.ok) return "unavailable";

  const parsed = refreshResponseSchema.safeParse(await res.json().catch(() => null));
  if (!parsed.success) return "unavailable";
  return {
    user: parsed.data.user,
    apiToken: parsed.data.token,
    refreshToken: parsed.data.refreshToken,
    exp: session.exp,
  };
}
