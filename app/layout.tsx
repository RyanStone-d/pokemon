import type { Metadata } from "next";
import { sora } from "./shared/fonts";
import { DictionaryProvider } from "./shared/i18n";
import { getDictionary, getLocale } from "./shared/i18n/server";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    title: "PokéNexus",
    description: t.meta.description,
  };
}

// 語系從 cookie 來（見 shared/i18n），字典在這裡挑好交給 Client Component
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, dictionary] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <html lang={locale} className={`${sora.className} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <DictionaryProvider dictionary={dictionary}>{children}</DictionaryProvider>
      </body>
    </html>
  );
}
