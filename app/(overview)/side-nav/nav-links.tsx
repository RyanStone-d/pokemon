"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import {
  ArrowPathIcon,
  PlusCircleIcon,
  UserCircleIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

import { useDictionary } from "@/app/shared/i18n";

// key 對到字典的 nav
const links = [
  { key: "pokedex", href: "/", icon: ArchiveBoxIcon },
  { key: "exchange", href: "/exchange", icon: ArrowPathIcon },
  // 發交換單是登入者專屬，沒登入點進去會被導到 /profile
  { key: "newTrade", href: "/exchange/new", icon: PlusCircleIcon },
  { key: "profile", href: "/profile", icon: UserCircleIcon },
] as const;

export default function NavLinks() {
  const pathname = usePathname();
  const t = useDictionary();
  return (
    <>
      {links.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          title={t.nav[link.key]}
          className={clsx(
            "flex items-center gap-5 p-4 hover:bg-red-300 rounded",
            {
              "bg-[#201F21] text-red-500": pathname === link.href,
            },
          )}
        >
          <link.icon className="w-6 h-6" />
          <p className="hidden md:block">{t.nav[link.key]}</p>
        </Link>
      ))}
    </>
  );
}
