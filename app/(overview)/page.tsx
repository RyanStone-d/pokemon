import { Suspense, ViewTransition } from "react";
import { BellAlertIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { z } from "zod";

import { Filter } from "./filter";
import { Cards, CardsSkeleton } from "./cards";
import { Pagination } from "./pagination";
import { fetchTotalPages } from "./fetchPokemon";

export async function generateStaticParams() {
  return [{ query: "" }, { page: "1" }, { type: "" }, { generation: "" }];
}

const searchParamsSchema = z.object({
  query: z.string().optional().default(""),
  page: z.coerce.number().optional().default(1).catch(1),
  type: z.string().optional().default("").catch(""),
  generation: z.string().optional().default("").catch(""),
});

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    type?: string;
    generation?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const { query, type, generation, page } =
    searchParamsSchema.parse(searchParams);
  const totalPagesPromise = fetchTotalPages(type, generation, query);

  return (
    <ViewTransition
      enter={{
        "nav-forward": "fade-in",
        "nav-back": "fade-in",
        default: "none",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      default="none"
    >
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
            <Suspense
              key={`${query}-${type}-${generation}-${page}`}
              fallback={<CardsSkeleton />}
            >
              <Cards
                currentPage={page}
                type={type}
                generation={generation}
                query={query}
              />
            </Suspense>
          </div>
          <div className="my-6 flex gap-3 items-center flex-col md:flex-row md:justify-between">
            <span className="text-sm text-red-300">
              顯示NO. <strong className="text-white">{1}</strong> 到NO.
              <strong className="text-white">{30}</strong> 隻寶可夢，共{" "}
              <strong className="text-white">150</strong> 隻寶可夢
            </span>
            <Suspense fallback={<div>...</div>}>
              <Pagination totalPages={totalPagesPromise} currentPage={page} />
            </Suspense>
          </div>
        </div>
      </main>
    </ViewTransition>
  );
}
