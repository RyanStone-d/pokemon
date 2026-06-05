import { describe, it, expect } from "vitest";
import { generatePagination } from "./generatePagination";

describe("generatePagination", () => {
  describe("當總頁數 <= 7", () => {
    it("應回傳所有頁碼", () => {
      expect(generatePagination(1, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(generatePagination(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe("當總頁數 > 7 且目前頁數在前端", () => {
    it("currentPage <= 3 時，應顯示前三頁和最後兩頁", () => {
      expect(generatePagination(1, 20)).toEqual([1, 2, 3, "...", 19, 20]);
      expect(generatePagination(3, 20)).toEqual([1, 2, 3, "...", 19, 20]);
    });
  });

  describe("當總頁數 > 7 且目前頁數在後端", () => {
    it("currentPage >= totalPages - 2 時，應顯示前兩頁和最後三頁", () => {
      expect(generatePagination(18, 20)).toEqual([1, 2, "...", 18, 19, 20]);
      expect(generatePagination(20, 20)).toEqual([1, 2, "...", 18, 19, 20]);
    });
  });

  describe("當目前頁數在中間", () => {
    it("應顯示當前頁附近及省略號", () => {
      expect(generatePagination(10, 20)).toEqual([
        1,
        "...",
        9,
        10,
        11,
        "...",
        20,
      ]);
    });
  });
});
