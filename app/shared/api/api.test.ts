// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";
import en from "../i18n/dictionaries/en";
import { apiFetch } from "./api";

vi.mock("../i18n/server", () => ({
  getLocale: async () => "en",
  getDictionary: async () => en,
}));

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("MOCK_API", "false");
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status });

describe("apiFetch 的語言", () => {
  test("網址帶目前的語系，原本的 query 不動", async () => {
    fetchMock.mockResolvedValue(reply(200, {}));
    await apiFetch("/trades?search=pika");

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe("/trades");
    expect(url.searchParams.get("search")).toBe("pika");
    expect(url.searchParams.get("lang")).toBe("en");
  });

  test("API 回的錯誤訊息直接顯示", async () => {
    fetchMock.mockResolvedValue(
      reply(409, { error: "username_taken", message: "This username is already taken" }),
    );
    expect(await apiFetch("/user", { method: "PATCH", body: {} })).toEqual({
      ok: false,
      status: 409,
      error: "This username is already taken",
    });
  });

  test("連不上：訊息照語系", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    expect(await apiFetch("/user")).toEqual({
      ok: false,
      status: 0,
      error: en.common.cannotReachServer,
    });
  });

  test("回傳格式不對：訊息照語系", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue(reply(200, { nope: true }));
    expect(await apiFetch("/user", { schema: z.object({ id: z.number() }) })).toEqual({
      ok: false,
      status: 200,
      error: en.common.badResponse,
    });
    logged.mockRestore();
  });
});
