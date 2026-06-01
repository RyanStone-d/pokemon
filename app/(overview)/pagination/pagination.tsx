"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { generatePagination } from "./generatePagination";

export default function Pagination({
  totalPages,
  currentPage,
}: {
  totalPages: number;
  currentPage: number;
}) {
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = (page: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${pathName}?${params.toString()}`;
  };

  const allPages = generatePagination(currentPage, totalPages).map(
    (page, index, arr) => {
      let position: "first" | "last" | "middle" | "single" | undefined;
      if (index === 0) position = "first";
      if (index === arr.length - 1) position = "last";
      if (arr.length === 1) position = "single";
      if (page === "...") position = "middle";

      return {
        page,
        position,
      };
    },
  );

  return (
    <div className="inline-flex">
      <PaginationArrow
        direction="left"
        href={createPageUrl(currentPage - 1)}
        isDisabled={currentPage <= 1}
      />
      <div className="flex -space-x-px">
        {allPages.map(({ page, position }, index) => (
          <PaginationNumber
            key={`${page}-${index}`}
            href={createPageUrl(page)}
            page={page}
            position={position}
            isActive={currentPage === page}
          />
        ))}
      </div>
      <PaginationArrow
        direction="right"
        href={createPageUrl(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
      />
    </div>
  );
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  isActive: boolean;
  position?: "first" | "last" | "middle" | "single";
}) {
  const className = cn(
    "flex h-10 w-10 items-center justify-center text-sm border",
    {
      "rounded-l-md": position === "first" || position === "single",
      "rounded-r-md": position === "last" || position === "single",
      "z-10 bg-red-300": isActive,
      "hover:bg-red-300": !isActive && position !== "middle",
      "text-gray-300": position === "middle",
    },
  );

  if (isActive || position === "middle") {
    return <div className={className}>{page}</div>;
  }

  return (
    <Link href={href} className={className}>
      {page}
    </Link>
  );
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: "left" | "right";
  isDisabled: boolean;
}) {
  const className = cn(
    "flex h-10 w-10 items-center justify-center rounded-md border",
    {
      "pointer-event-none text-gray-300": isDisabled,
      "hover:bg-red-300": !isDisabled,
      "mr-2 md:mr-4": direction === "left",
      "ml-2 md:ml-4": direction === "right",
    },
  );

  const icon = {
    left: <ArrowLeftIcon className="w-4 h-4" />,
    right: <ArrowRightIcon className="w-4 h-4" />,
  };

  if (isDisabled) {
    return <div className={className}>{icon[direction]}</div>;
  }

  return (
    <Link href={href} className={className}>
      {icon[direction]}
    </Link>
  );
}
