"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/design-system/input";
import { Field, FieldLabel } from "@/design-system/field";

// 名字搜尋：打字後 500ms 把 query 寫進網址，頁面重新抓資料。
// 圖鑑和交換列表共用，文案由外面傳
export default function Search({
  label = "Search",
  placeholder = "Search by name",
}: {
  label?: string;
  placeholder?: string;
}) {
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
        <FieldLabel>{label}</FieldLabel>
        <Input
          defaultValue={defaultQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="rounded-sm p-5 border-none bg-[#6B7280]"
        />
      </Field>
    </div>
  );
}
