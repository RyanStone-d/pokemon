"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/app/shared/api";
import {
  authResponseSchema,
  clearSession,
  getSession,
  getToken,
  setSession,
  updateSessionUser,
} from "@/app/shared/auth";
import { formatMessage } from "@/app/shared/i18n";
import { getDictionary } from "@/app/shared/i18n/server";
import {
  PASSWORD_MIN_LENGTH,
  validateLogin,
  validateRegister,
  validateUsername,
} from "./validate";

// 給 useActionState 用。失敗時把 username 一起回去，表單重畫才不會把打好的帳號清掉
export type AuthState = { error: string; username: string } | null;

// 登入狀態變了，會看到不同內容的頁面都重抓。
// 不用 revalidatePath("/", "layout")，那會把首頁圖鑑的快取也清掉
function revalidateAuthPages() {
  revalidatePath("/profile");
  revalidatePath("/exchange");
  revalidatePath("/exchange/new");
}

async function authenticate(
  mode: "login" | "register",
  formData: FormData,
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const validate = mode === "login" ? validateLogin : validateRegister;
  const invalid = validate({ username, password });
  if (invalid) {
    const { errors } = (await getDictionary()).auth;
    return {
      error: formatMessage(errors[invalid], { min: PASSWORD_MIN_LENGTH }),
      username,
    };
  }

  const res = await apiFetch(`/auth/${mode}`, {
    method: "POST",
    body: { username, password },
    schema: authResponseSchema,
  });
  if (!res.ok) return { error: res.error, username };

  await setSession(res.data.user, res.data.token, res.data.refreshToken);
  revalidateAuthPages();
  return null;
}

export async function login(_prev: AuthState, formData: FormData) {
  return authenticate("login", formData);
}

export async function register(_prev: AuthState, formData: FormData) {
  return authenticate("register", formData);
}

const renameResponseSchema = authResponseSchema.omit({ refreshToken: true });

// 成功時 error 是空字串，畫面靠這個顯示「已更新」
export async function rename(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();

  const invalid = validateUsername(username);
  if (invalid) {
    const { errors } = (await getDictionary()).auth;
    return { error: errors[invalid], username };
  }

  const res = await apiFetch("/user", {
    method: "PATCH",
    token: await getToken(),
    body: { username },
    schema: renameResponseSchema,
  });
  if (!res.ok) return { error: res.error, username };

  // token 裡也有名字，新的 token 要一起存，不然打 API 時用的還是舊名字
  await updateSessionUser(res.data.user, res.data.token);
  revalidateAuthPages();
  return { error: "", username: res.data.user.username };
}

// 先請 Express 作廢 refresh token，cookie 就算被複製走也換不到新的；Express 連不上也照樣登出
export async function logout() {
  const session = await getSession();
  if (session) {
    await apiFetch("/auth/logout", {
      method: "POST",
      body: { refreshToken: session.refreshToken },
    });
  }
  await clearSession();
  revalidateAuthPages();
}
