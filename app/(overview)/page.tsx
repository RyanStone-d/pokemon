import { BellAlertIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Page() {
  return (
    <main>
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl">Pokedex</h1>
        <div className="flex gap-4">
          <button type="button">
            <BellAlertIcon className="w-6 h-6" />
          </button>

          <Link href="/settings">
            <Cog6ToothIcon className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </main>
  );
}
