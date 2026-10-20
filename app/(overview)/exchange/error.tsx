"use client";

// Exchange 底下（含 /exchange/new）沒接到的例外會落到這裡，不會整站白頁
export default function ExchangeError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex flex-col gap-4 p-6">
      <h1 className="text-xl">交換區出了點問題</h1>
      <p className="text-sm text-red-300">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="self-start px-4 py-2 rounded bg-red-500 hover:bg-red-400"
      >
        再試一次
      </button>
    </main>
  );
}
