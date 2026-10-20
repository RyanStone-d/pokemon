import { describe, it, expect } from "vitest";
import { validateLogin, validateRegister } from "./validate";

describe("validateLogin", () => {
  it("帳號或密碼空白就擋", () => {
    expect(validateLogin({ username: "", password: "x" })).toBe("請輸入帳號和密碼");
    expect(validateLogin({ username: "   ", password: "x" })).toBe("請輸入帳號和密碼");
    expect(validateLogin({ username: "ryan", password: "" })).toBe("請輸入帳號和密碼");
  });

  it("有填就放行，對不對交給 API", () => {
    expect(validateLogin({ username: "ryan", password: "x" })).toBeNull();
  });
});

describe("validateRegister", () => {
  const ok = { username: "ryan_01", password: "password123" };

  it("合規的通過", () => {
    expect(validateRegister(ok)).toBeNull();
  });

  it("帳號太短、太長、有特殊字元都擋", () => {
    expect(validateRegister({ ...ok, username: "ab" })).toMatch(/帳號/);
    expect(validateRegister({ ...ok, username: "a".repeat(21) })).toMatch(/帳號/);
    expect(validateRegister({ ...ok, username: "ryan-01" })).toMatch(/帳號/);
    expect(validateRegister({ ...ok, username: "小智" })).toMatch(/帳號/);
  });

  it("密碼不到 8 個字擋", () => {
    expect(validateRegister({ ...ok, password: "1234567" })).toBe("密碼至少 8 個字");
    expect(validateRegister({ ...ok, password: "12345678" })).toBeNull();
  });

  it("先檢查帳號再檢查密碼", () => {
    expect(validateRegister({ username: "ab", password: "1" })).toMatch(/帳號/);
  });
});
