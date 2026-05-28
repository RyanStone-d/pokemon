import Link from "next/link";
import Image from "next/image";
import Logo from "./logo";
import NavLinks from "./nav-links";

export default function SideNav() {
  return (
    <div className="flex flex-col px-4 p-6 h-full bg-overlay/80">
      <Link href="/" className="mb-10" title="Pokemon Home">
        <Logo />
      </Link>

      <div className="flex gap-2 items-center md:p-3 bg-surface-hover rounded mb-2">
        <Image
          width={0}
          height={0}
          style={{ width: "48px", height: "auto" }}
          src="/vercel.svg"
          alt="Vercel Logo"
        />
        <div>Ryan</div>
      </div>

      <div className="flex-grow flex flex-col">
        <NavLinks />
        <button className="mt-auto flex items-center gap-5 p-4 hover:bg-red-300 rounded cursor-pointer">
          Sign Out
        </button>
      </div>
    </div>
  );
}
