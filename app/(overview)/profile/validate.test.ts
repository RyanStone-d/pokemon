import { describe, it, expect } from "vitest";
import { validateLogin, validateRegister, validateUsername } from "./validate";

describe("validateLogin", () => {
  it("帳號或密碼空白就擋", () => {
    expect(validateLogin({ username: "", password: "x" })).toBe("missingCredentials");
    expect(validateLogin({ username: "   ", password: "x" })).toBe("missingCredentials");
    expect(validateLogin({ username: "ryan", password: "" })).toBe("missingCredentials");
  });

  it("有填就放行，對不對交給 API", () => {
    expect(validateLogin({ username: "ryan", password: "x" })).toBeNull();
  });
});

describe("validateUsername", () => {
  it("跟註冊同一套規則", () => {
    expect(validateUsername("ryan_01")).toBeNull();
    expect(validateUsername("ab")).toBe("invalidUsername");
    expect(validateUsername("a".repeat(21))).toBe("invalidUsername");
    expect(validateUsername("小智")).toBe("invalidUsername");
  });
});

describe("validateRegister", () => {
  const ok = { username: "ryan_01", password: "password123" };

  it("合規的通過", () => {
    expect(validateRegister(ok)).toBeNull();
  });

  it("帳號太短、太長、有特殊字元都擋", () => {
    expect(validateRegister({ ...ok, username: "ab" })).toBe("invalidUsername");
    expect(validateRegister({ ...ok, username: "a".repeat(21) })).toBe("invalidUsername");
    expect(validateRegister({ ...ok, username: "ryan-01" })).toBe("invalidUsername");
    expect(validateRegister({ ...ok, username: "小智" })).toBe("invalidUsername");
  });

  it("密碼不到 8 個字擋", () => {
    expect(validateRegister({ ...ok, password: "1234567" })).toBe("passwordTooShort");
    expect(validateRegister({ ...ok, password: "12345678" })).toBeNull();
  });

  it("先檢查帳號再檢查密碼", () => {
    expect(validateRegister({ username: "ab", password: "1" })).toBe("invalidUsername");
  });
});
