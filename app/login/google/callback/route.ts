// 回程：Google 把瀏覽器導回這裡，網址帶 code 和 state。
// state 對得上才把 code 和 code_verifier 交給 Express 換身分，換到就跟帳密登入一樣存 session
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { apiFetch } from "@/app/shared/api";
import { authResponseSchema, setSession } from "@/app/shared/auth";
import {
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  googleCookieOptions,
} from "@/app/shared/auth/google";

const FAILED_URL = "/profile?login=google_failed";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const store = await cookies();
  const savedState = store.get(GOOGLE_STATE_COOKIE)?.value;
  const codeVerifier = store.get(GOOGLE_VERIFIER_COOKIE)?.value;

  // 一次性的，不管成功失敗都清掉；path 要跟設定時一樣才刪得到
  store.set(GOOGLE_STATE_COOKIE, "", googleCookieOptions(0));
  store.set(GOOGLE_VERIFIER_COOKIE, "", googleCookieOptions(0));

  // Google 那邊失敗（例如使用者按取消）時網址只有 error、沒有 code（RFC 6749 §4.1.2.1）
  const code = params.get("code");
  if (!code || !savedState || !codeVerifier || params.get("state") !== savedState) {
    redirect(FAILED_URL);
  }

  const res = await apiFetch("/auth/oauth/google", {
    method: "POST",
    body: { code, codeVerifier },
    schema: authResponseSchema,
  });
  if (!res.ok) redirect(FAILED_URL);

  await setSession(res.data.user, res.data.token, res.data.refreshToken);
  redirect("/profile");
}
