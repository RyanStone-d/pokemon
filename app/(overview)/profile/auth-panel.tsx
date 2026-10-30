"use client";

import { useState } from "react";
import { useDictionary } from "@/app/shared/i18n";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";
import SocialButtons from "./social-buttons";

type AuthMode = "login" | "register";

// mode 剛好對到字典的 auth.login、auth.register
const AUTH_TABS: AuthMode[] = ["login", "register"];

// 沒登入時的面板：上面切登入／註冊，中間是對應的表單，下面第三方登入。
// 只有「現在在哪個 tab」是前端狀態，送出都走 Server Action
export default function AuthPanel() {
  const t = useDictionary();
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="w-full max-w-md bg-overlay/80 rounded-lg p-8 shadow-card flex flex-col gap-6">
      <div role="tablist" aria-label={t.auth.tabs} className="flex justify-center gap-2">
        {AUTH_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={mode === tab}
            onClick={() => setMode(tab)}
            className={`px-5 py-2 rounded ${mode === tab ? "bg-red-500" : "bg-surface hover:bg-surface-hover"}`}
          >
            {t.auth[tab]}
          </button>
        ))}
      </div>
      {/* key 讓切換 tab 時欄位和錯誤訊息重置，不會把登入打一半的帳密帶去註冊 */}
      {mode === "login" ? <LoginForm key="login" /> : <RegisterForm key="register" />}
      <SocialButtons />
    </div>
  );
}
