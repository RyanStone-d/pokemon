"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import {
  ArrowPathIcon,
  UserCircleIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

const links = [
  { name: "Pokedex", href: "/", icon: ArchiveBoxIcon },
  { name: "Profile", href: "/profile", icon: UserCircleIcon },
  { name: "Exchange", href: "/exchange", icon: ArrowPathIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          title={link.name}
          className={clsx(
            "flex items-center gap-5 p-4 hover:bg-red-300 rounded",
            {
              "bg-[#201F21] text-red-500": pathname === link.href,
            },
          )}
        >
          <link.icon className="w-6 h-6" />
          <p>{link.name}</p>
        </Link>
      ))}
    </>
  );
}
