// 登入狀態：加密的 session 存在 httpOnly cookie，JS 讀不到，Server Component 和 Server Action 用 cookies() 拿。
// access token 快過期時 proxy.ts 會先換好，這裡讀到的都是換過的。
// 只能在伺服器端 import（用到 next/headers）
import { cache } from "react";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  decryptSession,
  encryptSession,
  newSessionExp,
  sessionCookieOptions,
  type User,
} from "./session";

export { authResponseSchema, userSchema, type User } from "./session";

// 同一次請求裡不管幾個元件呼叫，只解密一次
export const getSession = cache(async () =>
  decryptSession((await cookies()).get(SESSION_COOKIE)?.value),
);

export async function getToken() {
  return (await getSession())?.apiToken ?? null;
}

// 使用者資料登入時就放進 session，不用每次再問 Express
export async function getCurrentUser(): Promise<User | null> {
  return (await getSession())?.user ?? null;
}

// 下面三個只能在 Server Action 裡呼叫，Next 不允許在 Server Component 改 cookie
export async function setSession(user: User, apiToken: string, refreshToken: string) {
  const exp = newSessionExp();
  const value = await encryptSession({ user, apiToken, refreshToken, exp });
  (await cookies()).set(SESSION_COOKIE, value, sessionCookieOptions(exp));
}

// 改名字只換 user 和 access token：refresh token 沒變，到期時間也要跟著它，不能延長
export async function updateSessionUser(user: User, apiToken: string) {
  const session = await getSession();
  if (!session) return;
  const value = await encryptSession({ ...session, user, apiToken });
  (await cookies()).set(SESSION_COOKIE, value, sessionCookieOptions(session.exp));
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
