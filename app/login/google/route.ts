// 出發：產生 state 和 code_verifier 存進 cookie，再把瀏覽器送去 Google。
// 回來時 callback 拿 cookie 裡的值比對，確認是同一台瀏覽器、同一次登入
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import {
  GOOGLE_LINK_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  googleAuthUrl,
  googleCookieOptions,
  randomToken,
} from "@/app/shared/auth/google";

export async function GET(request: NextRequest) {
  const state = randomToken();
  const codeVerifier = randomToken();

  const store = await cookies();
  store.set(GOOGLE_STATE_COOKIE, state, googleCookieOptions());
  store.set(GOOGLE_VERIFIER_COOKIE, codeVerifier, googleCookieOptions());
  // 登入時也要清：上一次綁定如果在 Google 那邊放棄，cookie 還留著，會把這次登入當成綁定
  if (request.nextUrl.searchParams.has("link")) {
    store.set(GOOGLE_LINK_COOKIE, "1", googleCookieOptions());
  } else {
    store.set(GOOGLE_LINK_COOKIE, "", googleCookieOptions(0));
  }

  redirect(googleAuthUrl({ state, codeVerifier }));
}
