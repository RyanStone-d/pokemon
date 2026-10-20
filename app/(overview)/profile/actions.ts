"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { apiFetch } from "@/app/shared/api";
import { clearToken, setToken, userSchema } from "@/app/shared/auth";
import { validateLogin, validateRegister } from "./validate";

// 給 useActionState 用。失敗時把 username 一起回去，表單重畫才不會把打好的帳號清掉
export type AuthState = { error: string; username: string } | null;

const authResponseSchema = z.object({ token: z.string(), user: userSchema });

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
  const message = validate({ username, password });
  if (message) return { error: message, username };

  const res = await apiFetch(`/auth/${mode}`, {
    method: "POST",
    body: { username, password },
    schema: authResponseSchema,
  });
  if (!res.ok) return { error: res.error, username };

  await setToken(res.data.token);
  revalidateAuthPages();
  return null;
}

export async function login(_prev: AuthState, formData: FormData) {
  return authenticate("login", formData);
}

export async function register(_prev: AuthState, formData: FormData) {
  return authenticate("register", formData);
}

export async function logout() {
  await clearToken();
  revalidateAuthPages();
}
