// 登入狀態：token 存在 httpOnly cookie，JS 讀不到，Server Component 和 Server Action 用 cookies() 拿。
// 只能在伺服器端 import（用到 next/headers）
import { cache } from "react";
import { cookies } from "next/headers";
import { z } from "zod";
import { apiFetch } from "../api";

export const TOKEN_COOKIE = "pokenexus-token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 天

export const userSchema = z.object({ id: z.number(), username: z.string() });
export type User = z.infer<typeof userSchema>;

export async function getToken() {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

// 下面兩個只能在 Server Action 裡呼叫，Next 不允許在 Server Component 改 cookie
export async function setToken(token: string) {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  });
}

export async function clearToken() {
  (await cookies()).delete(TOKEN_COOKIE);
}

// 目前登入的是誰。沒 cookie、token 過期或被竄改（/auth/me 回 401）都回 null。
// 用 cache() 包起來，同一次請求裡不管幾個元件呼叫，只會打一次 /auth/me
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) return null;
  const res = await apiFetch("/auth/me", { token, schema: userSchema });
  return res.ok ? res.data : null;
});
