// 出發：產生 state 和 code_verifier 存進 cookie，再把瀏覽器送去 Google。
// 回來時 callback 拿 cookie 裡的值比對，確認是同一台瀏覽器、同一次登入
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  googleAuthUrl,
  googleCookieOptions,
  randomToken,
} from "@/app/shared/auth/google";

export async function GET() {
  const state = randomToken();
  const codeVerifier = randomToken();

  const store = await cookies();
  store.set(GOOGLE_STATE_COOKIE, state, googleCookieOptions());
  store.set(GOOGLE_VERIFIER_COOKIE, codeVerifier, googleCookieOptions());

  redirect(googleAuthUrl({ state, codeVerifier }));
}
