// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  accessTokenExpiresSoon,
  decryptSession,
  encryptSession,
  newSessionExp,
  refreshSession,
  type Session,
} from "./session";

const KEY_A = Buffer.alloc(32, 1).toString("base64url");
const KEY_B = Buffer.alloc(32, 2).toString("base64url");

// 只有 payload 的假 JWT，accessTokenExpiresSoon 只看 exp 不驗簽章
function fakeJwt(exp: number) {
  const part = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${part({ alg: "HS256" })}.${part({ sub: "1", exp })}.sig`;
}

const now = () => Math.floor(Date.now() / 1000);

function session(overrides: Partial<Session> = {}): Session {
  return {
    user: { id: 1, username: "ash" },
    apiToken: fakeJwt(now() + 900),
    refreshToken: "rt-1",
    exp: newSessionExp(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", KEY_A);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("encryptSession / decryptSession", () => {
  test("加密後解得回來", async () => {
    const s = session();
    expect(await decryptSession(await encryptSession(s))).toEqual(s);
  });

  test("cookie 裡看不到 refresh token", async () => {
    const value = await encryptSession(session({ refreshToken: "secret-refresh-token" }));
    const decoded = value
      .split(".")
      .map((p) => Buffer.from(p, "base64url").toString("latin1"))
      .join("");
    expect(decoded).not.toContain("secret-refresh-token");
  });

  test("改過一個字、鑰匙不對、過期、沒有 cookie 都當作沒登入", async () => {
    const value = await encryptSession(session());
    // 改密文那段的第一個字：base64url 最後一個字只有部分 bit 是資料，改了可能解回一樣的 bytes
    const parts = value.split(".");
    parts[3] = (parts[3][0] === "A" ? "B" : "A") + parts[3].slice(1);
    expect(await decryptSession(parts.join("."))).toBeNull();

    vi.stubEnv("SESSION_SECRET", KEY_B);
    expect(await decryptSession(value)).toBeNull();

    vi.stubEnv("SESSION_SECRET", KEY_A);
    expect(await decryptSession(await encryptSession(session({ exp: now() - 1 })))).toBeNull();

    expect(await decryptSession(undefined)).toBeNull();
  });

  test("SESSION_SECRET 不是 32 bytes 就丟錯", async () => {
    vi.stubEnv("SESSION_SECRET", "too-short");
    await expect(encryptSession(session())).rejects.toThrow("SESSION_SECRET");
  });
});

describe("accessTokenExpiresSoon", () => {
  test("剩不到 30 秒或已過期才要換", () => {
    expect(accessTokenExpiresSoon(fakeJwt(now() + 900))).toBe(false);
    expect(accessTokenExpiresSoon(fakeJwt(now() + 10))).toBe(true);
    expect(accessTokenExpiresSoon(fakeJwt(now() - 10))).toBe(true);
    expect(accessTokenExpiresSoon("not-a-jwt")).toBe(true);
  });
});

describe("refreshSession", () => {
  const okResponse = () =>
    new Response(
      JSON.stringify({ token: "new-access", refreshToken: "rt-2", user: { id: 1, username: "ash" } }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );

  test("換成功：新的一對 token，session 期限不延長", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => okResponse()));
    const s = session({ refreshToken: "rt-ok" });
    expect(await refreshSession(s)).toEqual({ ...s, apiToken: "new-access", refreshToken: "rt-2" });
  });

  test("401 回 null（要重新登入），連不上回 unavailable（cookie 先不動）", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })));
    expect(await refreshSession(session({ refreshToken: "rt-401" }))).toBeNull();

    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("fetch failed"); }));
    expect(await refreshSession(session({ refreshToken: "rt-down" }))).toBe("unavailable");
  });

  test("同一張 refresh token 同時換三次，只打一次 Express", async () => {
    const fetchMock = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);
    const s = session({ refreshToken: "rt-shared" });
    const results = await Promise.all([refreshSession(s), refreshSession(s), refreshSession(s)]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(new Set(results.map((r) => (r && r !== "unavailable" ? r.refreshToken : r)))).toEqual(
      new Set(["rt-2"]),
    );
  });
});
