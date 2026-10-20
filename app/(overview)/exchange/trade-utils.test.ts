import { describe, it, expect } from "vitest";
import {
  formatLinkCode,
  isValidLinkCode,
  normalizeLinkCode,
  relativeTime,
} from "./trade-utils";

describe("normalizeLinkCode", () => {
  it("只留數字", () => {
    expect(normalizeLinkCode("1234-5678")).toBe("12345678");
    expect(normalizeLinkCode("12 34 ab 56")).toBe("123456");
  });

  it("最多 8 碼，多的砍掉", () => {
    expect(normalizeLinkCode("1234567890")).toBe("12345678");
  });
});

describe("isValidLinkCode", () => {
  it("剛好 8 個數字才算", () => {
    expect(isValidLinkCode("12345678")).toBe(true);
    expect(isValidLinkCode("1234567")).toBe(false);
    expect(isValidLinkCode("1234-5678")).toBe(false);
    expect(isValidLinkCode("")).toBe(false);
  });
});

describe("formatLinkCode", () => {
  it("8 碼顯示成 XXXX-XXXX", () => {
    expect(formatLinkCode("12345678")).toBe("1234-5678");
  });

  it("已經有 dash 的不會重複加", () => {
    expect(formatLinkCode("1234-5678")).toBe("1234-5678");
  });

  it("打到一半照樣能顯示", () => {
    expect(formatLinkCode("123")).toBe("123");
    expect(formatLinkCode("1234")).toBe("1234");
    expect(formatLinkCode("12345")).toBe("1234-5");
  });
});

describe("relativeTime", () => {
  const now = new Date("2026-10-20T12:00:00Z");

  it("一分鐘內是剛剛", () => {
    expect(relativeTime("2026-10-20T11:59:30Z", now)).toBe("剛剛");
  });

  it("一小時內用分鐘", () => {
    expect(relativeTime("2026-10-20T11:45:00Z", now)).toBe("15 分鐘前");
  });

  it("一天內用小時", () => {
    expect(relativeTime("2026-10-20T09:00:00Z", now)).toBe("3 小時前");
  });

  it("一個月內用天", () => {
    expect(relativeTime("2026-10-18T12:00:00Z", now)).toBe("2 天前");
  });

  it("超過一個月顯示日期", () => {
    expect(relativeTime("2026-08-01T12:00:00Z", now)).toMatch(/2026/);
  });

  it("壞掉的時間字串回空字串", () => {
    expect(relativeTime("not-a-date", now)).toBe("");
  });
});
