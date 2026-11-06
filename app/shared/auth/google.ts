// Google 登入的出發和回程（app/login/google）共用。
// 前端只負責把人送去 Google、收回 code；拿 code 換身分要 client secret，那是 Express 的事
import { createHash, randomBytes } from "node:crypto";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";

export const GOOGLE_STATE_COOKIE = "google-oauth-state";
export const GOOGLE_VERIFIER_COOKIE = "google-oauth-verifier";
// 登入和綁定共用同一個 redirect URI，回程靠這個 cookie 分辨這次要做哪一個
export const GOOGLE_LINK_COOKIE = "google-oauth-link";

// 出發到回來之間要在 Google 那邊登入、按同意，給 10 分鐘
const GOOGLE_COOKIE_SECONDS = 10 * 60;

export function googleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("要設定 GOOGLE_CLIENT_ID 和 GOOGLE_REDIRECT_URI");
  }
  return { clientId, redirectUri };
}

// 32 bytes 轉 base64url 是 43 個字，剛好是 PKCE code_verifier 允許的最短長度（RFC 7636 §4.1：43～128）
export function randomToken() {
  return randomBytes(32).toString("base64url");
}

// S256：code_challenge = BASE64URL(SHA256(code_verifier))（RFC 7636 §4.2）
export function codeChallenge(codeVerifier: string) {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export function googleAuthUrl({ state, codeVerifier }: { state: string; codeVerifier: string }) {
  const { clientId, redirectUri } = googleConfig();
  const url = new URL(AUTH_ENDPOINT);
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email",
    state,
    code_challenge: codeChallenge(codeVerifier),
    code_challenge_method: "S256",
  }).toString();
  return url.toString();
}

// 回程是從 accounts.google.com 導回來的一般 GET，lax 的 cookie 會帶上；只有 /login/google 底下用得到
export function googleCookieOptions(maxAge = GOOGLE_COOKIE_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/login/google",
    maxAge,
  };
}
