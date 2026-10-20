// 帳密的前端驗證規則，跟 API 一樣：帳號 3–20 個英文、數字或底線，密碼至少 8 個字。
// 純函式，Server Action 用，也有測試
export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;
export const PASSWORD_MIN_LENGTH = 8;

export type Credentials = { username: string; password: string };

// 登入只擋空白，帳密對不對交給 API
export function validateLogin({ username, password }: Credentials) {
  return !username.trim() || !password ? "請輸入帳號和密碼" : null;
}

export function validateRegister({ username, password }: Credentials) {
  if (!USERNAME_PATTERN.test(username)) {
    return "帳號要 3–20 個字，只能用英文、數字或底線";
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `密碼至少 ${PASSWORD_MIN_LENGTH} 個字`;
  }
  return null;
}
