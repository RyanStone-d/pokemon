import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

import Link from "next/link";
import Image from "next/image";
import Logo from "./logo";
import NavLinks from "./nav-links";

export default function SideNav() {
  return (
    <div className="flex flex-wrap items-center md:flex-col px-4 p-6 h-full bg-overlay/80">
      <Link href="/" className="md:mb-10" title="Pokemon Home">
        <Logo />
      </Link>

      <div className="md:w-full grow md:grow-0 flex gap-2 justify-end md:justify-start items-center md:p-3 rounded mb-2">
        <Image width={48} height={48} src="/vercel.svg" alt="Vercel Logo" />
        <div>Ryan</div>
      </div>

      <div className="grow mt-5 justify-between w-full flex md:flex-col">
        <NavLinks />
        <button
          type="button"
          className="mt-auto flex items-center gap-5 p-4 hover:bg-red-300 rounded cursor-pointer"
        >
          <ArrowRightStartOnRectangleIcon className="w-6 h-6" />
          <span className="hidden md:block">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
