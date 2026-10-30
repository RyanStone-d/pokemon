import { Suspense, ViewTransition } from "react";
import { BellAlertIcon } from "@heroicons/react/24/outline";
import { z } from "zod";

import { Filter } from "@/app/shared/filter";
import { Cards, CardsSkeleton } from "./cards";
import { Pagination } from "@/app/shared/pagination";
import { fetchSummary, fetchTotalPages } from "@/app/shared/pokemon";
import { formatNodes } from "@/app/shared/i18n";
import { getDictionary } from "@/app/shared/i18n/server";

export async function generateStaticParams() {
  return [{ query: "" }, { page: "1" }, { type: "" }, { generation: "" }];
}

const searchParamsSchema = z.object({
  query: z.string().optional().default(""),
  page: z.coerce.number().optional().default(1).catch(1),
  type: z.string().optional().default("").catch(""),
  generation: z.string().optional().default("").catch(""),
});

async function Summary({
  page,
  type,
  generation,
  query,
}: {
  page: number;
  type: string;
  generation: string;
  query: string;
}) {
  const [{ from, to, total }, t] = await Promise.all([
    fetchSummary(page, type, generation, query),
    getDictionary(),
  ]);

  return (
    <span className="text-sm text-red-300">
      {formatNodes(t.pokedex.summary, {
        from: <strong className="text-white">{from}</strong>,
        to: <strong className="text-white">{to}</strong>,
        total: <strong className="text-white">{total}</strong>,
      })}
    </span>
  );
}

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
  const t = await getDictionary();

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
          <h1 className="text-xl md:text-2xl">{t.pokedex.title}</h1>
          {/* 通知還沒做，先佔位 */}
          <button type="button" aria-label={t.pokedex.notifications}>
            <BellAlertIcon className="w-6 h-6" />
          </button>
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
            <Suspense fallback={<span />}>
              <Summary
                page={page}
                type={type}
                generation={generation}
                query={query}
              />
            </Suspense>
            <Suspense fallback={<div>...</div>}>
              <Pagination totalPages={totalPagesPromise} currentPage={page} />
            </Suspense>
          </div>
        </div>
      </main>
    </ViewTransition>
  );
}
