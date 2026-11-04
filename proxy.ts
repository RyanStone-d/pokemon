// 每個頁面請求進來前先看 access token：快過期就拿 refresh token 去 Express 換一對新的，寫回 cookie。
// 要在這裡換，因為新的 token 要寫回 cookie，Server Component 不能寫 cookie
import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  accessTokenExpiresSoon,
  decryptSession,
  encryptSession,
  refreshSession,
  sessionCookieOptions,
} from "@/app/shared/auth/session";

export async function proxy(request: NextRequest) {
  const session = await decryptSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session || !accessTokenExpiresSoon(session.apiToken)) return NextResponse.next();

  const refreshed = await refreshSession(session);
  if (refreshed === "unavailable") return NextResponse.next();

  // request 那邊也要改：這次請求後面的 Server Component 用 cookies() 讀的是 request 的 cookie
  if (refreshed === null) {
    request.cookies.delete(SESSION_COOKIE);
    const response = NextResponse.next({ request: { headers: request.headers } });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const value = await encryptSession(refreshed);
  request.cookies.set(SESSION_COOKIE, value);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(SESSION_COOKIE, value, sessionCookieOptions(refreshed.exp));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico|webp)$).*)"],
};
