"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/design-system/input";
import { Field, FieldLabel } from "@/design-system/field";

export default function Search() {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();
  const defaultQuery = searchParams.get("query") || "";

  const handleSearch = useDebouncedCallback((val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("query", val);
    } else {
      params.delete("query");
    }
    params.set("page", "1");

    replace(`${pathName}?${params.toString()}`);
  }, 500);
  return (
    <div>
      <Field>
        <FieldLabel>Search</FieldLabel>
        <Input
          defaultValue={defaultQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name"
          className="rounded-sm p-5 border-none bg-[#6B7280]"
        />
      </Field>
    </div>
  );
}
