// 單獨一個檔：proxy.ts 也要用（透過 session.ts），不能跟著 api.ts 一起 import next/headers
export const API_URL =
  process.env.POKEMON_API_URL ?? "https://pokemon-api-3igu.onrender.com";
