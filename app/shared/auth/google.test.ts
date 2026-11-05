// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { codeChallenge, googleAuthUrl, randomToken } from "./google";

beforeEach(() => {
  vi.stubEnv("GOOGLE_CLIENT_ID", "test-client.apps.googleusercontent.com");
  vi.stubEnv("GOOGLE_REDIRECT_URI", "http://localhost:3100/login/google/callback");
});
afterEach(() => vi.unstubAllEnvs());

describe("PKCE", () => {
  // RFC 7636 Appendix B 的範例值
  test("code_challenge 是 code_verifier 的 SHA-256 再轉 base64url", () => {
    expect(codeChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });

  test("randomToken：43 個 base64url 字元，每次都不一樣", () => {
    const a = randomToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(randomToken()).not.toBe(a);
  });
});

describe("googleAuthUrl", () => {
  test("帶 client_id、redirect_uri、state、S256 的 code_challenge，不帶 code_verifier", () => {
    const url = new URL(googleAuthUrl({ state: "the-state", codeVerifier: "the-verifier" }));

    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: "test-client.apps.googleusercontent.com",
      redirect_uri: "http://localhost:3100/login/google/callback",
      response_type: "code",
      scope: "openid email",
      state: "the-state",
      code_challenge: codeChallenge("the-verifier"),
      code_challenge_method: "S256",
    });
  });

  test("沒設環境變數就丟錯，不會組出壞掉的網址", () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    expect(() => googleAuthUrl({ state: "s", codeVerifier: "v" })).toThrow("GOOGLE_CLIENT_ID");
  });
});
