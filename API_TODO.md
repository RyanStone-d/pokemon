# API TODO（pokemon-api）

前端的 Exchange 和 Profile 已經照 PRD 4.C / 4.D 做完，但線上的 pokemon-api 目前只有 `/pokemon`，
下面這些端點都還沒有。做完之後前端不用改就能動。

前端全部在伺服器端呼叫 API（Server Component、Server Action），瀏覽器不直接打，
所以 **API 不需要設 CORS**。

API 做好前，本機用 `.env.local` 的 `MOCK_API=true` 走 `app/shared/mock-api.ts` 的假資料，
行為照下面的規格寫。API 上線後把那行拿掉、刪掉 mock-api.ts 即可。

## 共用規則

- Base URL 由前端的 `POKEMON_API_URL` 決定，預設 `https://pokemon-api-3igu.onrender.com`
- 要登入的端點帶 `Authorization: Bearer <token>`；token 缺、過期或無效回 `401`
- 錯誤一律回 `{ "error": "訊息" }`，前端會把這個字串直接顯示給使用者，請寫中文
- 寶可夢物件（`PokemonBrief`）格式和 `/pokemon` 列表的 item 一樣：

  ```json
  { "id": 4, "name": "charmander", "image": "https://...4.png", "types": ["fire"] }
  ```

  `types` 一定要給，卡片背景要用屬性色。

## Auth

| Method | Path             | 登入 | Body                       | 成功回應                      |
| ------ | ---------------- | ---- | -------------------------- | ----------------------------- |
| POST   | `/auth/register` | 否   | `{ username, password }`   | `201 { token, user }`         |
| POST   | `/auth/login`    | 否   | `{ username, password }`   | `200 { token, user }`         |
| GET    | `/auth/me`       | 是   | —                          | `200 { id, username }`        |

- `user` 格式：`{ "id": 1, "username": "ryan" }`
- 規則：username 3–20 個英文、數字或底線（`/^[A-Za-z0-9_]{3,20}$/`）；password 至少 8 個字。
  前端已經先擋，API 還是要再驗一次
- 帳號重複：`409 { "error": "這個帳號已經有人用了" }`
- 帳密錯誤：`401 { "error": "帳號或密碼錯誤" }`
- token 建議 JWT，有效期 7 天（前端 cookie 也是存 7 天）

## Trades（交換單）

`Trade` 格式：

```json
{
  "id": 12,
  "status": "open",
  "createdAt": "2026-10-20T03:00:00.000Z",
  "creator": "ryan",
  "claimer": null,
  "offered": { "id": 4, "name": "charmander", "image": "...", "types": ["fire"] },
  "wanted":  { "id": 7, "name": "squirtle",   "image": "...", "types": ["water"] },
  "linkCode": "12345678"
}
```

- `status`：`open` | `claimed` | `completed` | `cancelled`
- `linkCode`：**只回給發文者和認領者**，其他人（包含沒登入）的回應裡不能有這個欄位
- `claimer`：沒人認領時是 `null`

| Method | Path                   | 登入 | 說明 |
| ------ | ---------------------- | ---- | ---- |
| GET    | `/trades`              | 否   | 公開列表，只有 `status = open` 的單。Query：`page`（預設 1）、`side`（`offered` 或 `wanted`，預設 `offered`）、`search`（名字，小寫，前綴比對）、`type`（屬性）、`generation`（世代 1–9）。`search`、`type`、`generation` 三個條件都套在 `side` 指定的那一邊：`side=offered` 是「我想要 X，找誰拿出 X」；`side=wanted` 是「我拿出 X，找誰想要 X」。有帶 token 的話，自己發的單要附 `linkCode`。回應格式和 `/pokemon` 列表一樣：`{ items: Trade[], page, perPage, total, totalPages }`，建議 `perPage = 20` |
| GET    | `/trades/mine`         | 是   | 我發的和我認領的，不分狀態，全部附 `linkCode`，新的在前。回 `Trade[]` |
| POST   | `/trades`              | 是   | Body `{ offeredPokemonId, wantedPokemonId, linkCode }`。`linkCode` 是 8 碼數字字串。兩隻相同回 `400`。回 `201 Trade` |
| POST   | `/trades/:id/claim`    | 是   | 認領。回 `200 Trade`（含 `linkCode`）。自己的單回 `400`；已經被認領或不是 open 回 `409 { "error": "這張單已經有人認領了" }` |
| POST   | `/trades/:id/complete` | 是   | 發文者把 `claimed` 的單標成 `completed`。不是發文者回 `403`；狀態不是 claimed 回 `409`。回 `200 Trade` |
| POST   | `/trades/:id/cancel`   | 是   | 發文者下架 `open` 或 `claimed` 的單，變 `cancelled`。不是發文者回 `403`。回 `200 Trade` |

### 一定要守的規則（PRD 4.C）

- **認領要是原子的**：兩個人同時認領同一張單，只能有一個成功，另一個拿 `409`。
  用 `UPDATE ... WHERE id = $1 AND status = 'open'` 之類的條件更新，看影響列數
- 密語只回給發文者和認領者
- `complete` / `cancel` 只有發文者能做，其他人 `403`

## 前端還沒接的

- token 過期時 cookie 不會自動清（Server Component 不能改 cookie），下次登入會直接覆蓋，登出會清掉
- Google / Facebook 登入只有按鈕佔位
- side-nav 的頭像是通用圖示，PRD 4.D 的頭像上傳是之後的 phase
