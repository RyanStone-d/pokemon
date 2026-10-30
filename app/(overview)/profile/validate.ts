// 帳密的前端驗證規則，跟 API 一樣：帳號 3–20 個英文、數字或底線，密碼至少 8 個字。
// 純函式，Server Action 用，也有測試。
// 回傳的是錯誤代碼，對到字典的 auth.errors，畫面上的文字由 Server Action 依語系換
export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;
export const PASSWORD_MIN_LENGTH = 8;

export type Credentials = { username: string; password: string };
export type ValidationError =
  | "missingCredentials"
  | "invalidUsername"
  | "passwordTooShort";

// 登入只擋空白，帳密對不對交給 API
export function validateLogin({
  username,
  password,
}: Credentials): ValidationError | null {
  return !username.trim() || !password ? "missingCredentials" : null;
}

export function validateRegister({
  username,
  password,
}: Credentials): ValidationError | null {
  if (!USERNAME_PATTERN.test(username)) return "invalidUsername";
  if (password.length < PASSWORD_MIN_LENGTH) return "passwordTooShort";
  return null;
}
