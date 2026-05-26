import type { Metadata } from "next";
import { sora } from "./shared";

import "./globals.css";

export const metadata: Metadata = {
  title: "PokéNexus",
  description: "Browse the Pokédex, and trade with other trainers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.className} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
