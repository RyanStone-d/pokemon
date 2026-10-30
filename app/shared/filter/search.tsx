"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/design-system/input";
import { Field, FieldLabel } from "@/design-system/field";
import { useDictionary } from "@/app/shared/i18n";

// 名字搜尋：打字後 500ms 把 query 寫進網址，頁面重新抓資料。
// 圖鑑和交換列表共用，文案由外面傳，沒傳就用字典裡的預設
export default function Search({
  label,
  placeholder,
}: {
  label?: string;
  placeholder?: string;
}) {
  const t = useDictionary();
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
        <FieldLabel>{label ?? t.filter.search}</FieldLabel>
        <Input
          defaultValue={defaultQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder ?? t.filter.searchPlaceholder}
          className="rounded-sm p-5 border-none bg-[#6B7280]"
        />
      </Field>
    </div>
  );
}
