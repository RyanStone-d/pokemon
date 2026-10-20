// 第三方登入：之後接 Google / Facebook，先放按鈕佔位
export default function SocialButtons() {
  return (
    <>
      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="flex-1 h-px bg-border" />
        或使用
        <span className="flex-1 h-px bg-border" />
      </div>
      <div className="flex flex-col gap-3">
        <SocialButton label="使用 Google 繼續">
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
          </svg>
        </SocialButton>
        <SocialButton label="使用 Facebook 繼續">
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z" />
          </svg>
        </SocialButton>
      </div>
    </>
  );
}

function SocialButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled
      title="尚未開放"
      className="flex items-center justify-center gap-3 px-4 py-3 rounded bg-surface border border-border disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {children}
      <span>{label}</span>
    </button>
  );
}
