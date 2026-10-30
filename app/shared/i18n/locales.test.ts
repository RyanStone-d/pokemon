import { describe, it, expect } from "vitest";
import { isLocale, matchAcceptLanguage } from "./locales";

describe("isLocale", () => {
  it("只認得支援的三個語系", () => {
    expect(isLocale("zh-Hant")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ja")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    // 舊版存在 cookie 的值，現在不認得，會改用瀏覽器語系
    expect(isLocale("zh-TW")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("matchAcceptLanguage", () => {
  it("沒有 header 用預設的繁中", () => {
    expect(matchAcceptLanguage(null)).toBe("zh-Hant");
    expect(matchAcceptLanguage("")).toBe("zh-Hant");
  });

  it("挑第一個支援的語系", () => {
    expect(matchAcceptLanguage("ja,en-US;q=0.9")).toBe("ja");
    expect(matchAcceptLanguage("fr-FR,en;q=0.8")).toBe("en");
  });

  it("照 q 值排，不照寫的順序", () => {
    expect(matchAcceptLanguage("en;q=0.5,ja;q=0.9")).toBe("ja");
  });

  it("zh 開頭的都給繁中", () => {
    expect(matchAcceptLanguage("zh-CN")).toBe("zh-Hant");
    expect(matchAcceptLanguage("zh-Hant-TW,zh;q=0.9")).toBe("zh-Hant");
  });

  it("都不支援就用預設", () => {
    expect(matchAcceptLanguage("fr,de;q=0.8")).toBe("zh-Hant");
  });
});
