import { BellAlertIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { Filter } from "./filter";
import { Cards } from "./cards";
import { Pagination } from "./pagination";
import { fetchTotalPages } from "./fetchPokemon";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = searchParams?.page || "1";
  const totalPages = await fetchTotalPages();
  return (
    <main>
      <div className="flex justify-between items-center bg-overlay/80 py-6 px-4">
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

      <div className="flex flex-col md:p-6">
        <Filter />
        <div className="my-[48px]">
          <Cards currentPage={currentPage} />
        </div>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-red-300">
            顯示NO. <strong className="text-white">{1}</strong> 到NO.
            <strong className="text-white">{30}</strong> 隻寶可夢，共{" "}
            <strong className="text-white">150</strong> 隻寶可夢
          </span>
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </main>
  );
}
