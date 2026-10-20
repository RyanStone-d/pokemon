"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/app/shared/api";
import { getToken } from "@/app/shared/auth";
import { tradeSchema } from "./fetchTrades";
import { isValidLinkCode, normalizeLinkCode } from "./trade-utils";

// 給 useActionState 用：null 代表成功，有 error 就顯示在表單上
export type ActionState = { error: string } | null;

// 列表和我的交換單都會變，兩頁一起重抓
function revalidateTrades() {
  revalidatePath("/exchange");
  revalidatePath("/profile");
}

// 發一張交換單。成功後回列表
export async function createTrade(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) redirect("/profile");

  const offered = Number(formData.get("offered"));
  const wanted = Number(formData.get("wanted"));
  const linkCode = normalizeLinkCode(String(formData.get("linkCode") ?? ""));

  if (!offered || !wanted) return { error: "拿出和想要的寶可夢都要選" };
  if (offered === wanted) return { error: "拿出和想要的不能是同一隻" };
  if (!isValidLinkCode(linkCode)) return { error: "連線密語要 8 個數字" };

  const res = await apiFetch("/trades", {
    method: "POST",
    token,
    body: { offeredPokemonId: offered, wantedPokemonId: wanted, linkCode },
    schema: tradeSchema,
  });
  if (!res.ok) return { error: res.error };

  revalidateTrades();
  redirect("/exchange");
}

async function tradeAction(
  id: number,
  action: "claim" | "complete" | "cancel",
): Promise<ActionState> {
  const token = await getToken();
  if (!token) redirect("/profile");

  const res = await apiFetch(`/trades/${id}/${action}`, {
    method: "POST",
    token,
  });
  // 就算失敗也重抓：409 搶輸了，列表要把那張單拿掉
  revalidateTrades();
  return res.ok ? null : { error: res.error };
}

// 下面三個都用 .bind(null, id) 綁好再交給表單，多出來的 (prevState, formData) 參數用不到

// 認領成功就帶著單號跳去 Profile，那邊會提示剛認領的單和密語；失敗（409 被搶先）留在原地顯示錯誤
export async function claimTrade(id: number): Promise<ActionState> {
  const failed = await tradeAction(id, "claim");
  if (failed) return failed;
  redirect(`/profile?claimed=${id}`);
}

export async function completeTrade(id: number) {
  return tradeAction(id, "complete");
}

export async function cancelTrade(id: number) {
  return tradeAction(id, "cancel");
}
