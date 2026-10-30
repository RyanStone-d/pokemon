"use client";

import { useTransition } from "react";
import { LanguageIcon } from "@heroicons/react/24/outline";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/select";
import { cn } from "@/lib/utils";
import { LOCALE_LABEL, LOCALES, useDictionary, type Locale } from "@/app/shared/i18n";
import { setLocale } from "@/app/shared/i18n/actions";

// 側欄的語系選單：選了就寫 cookie、整頁換語系，網址不變。
// 樣式跟上面的選單項目一樣，手機只顯示 icon
export default function LanguageSelect({ locale }: { locale: Locale }) {
  const t = useDictionary();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={locale}
      onValueChange={(next) => startTransition(() => setLocale(next))}
      disabled={isPending}
    >
      <SelectTrigger
        aria-label={t.language.label}
        title={t.language.label}
        className={cn(
          "w-full data-[size=default]:h-auto justify-start gap-5 p-4 border-none rounded text-base hover:bg-red-300 dark:bg-transparent dark:hover:bg-red-300 [&>svg:last-child]:hidden md:[&>svg:last-child]:block",
          { "opacity-50": isPending },
        )}
      >
        <LanguageIcon className="size-6" />
        <span className="hidden md:block flex-1 text-left">
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent position="popper" className="bg-[#6B7280]">
        <SelectGroup>
          {LOCALES.map((option) => (
            <SelectItem key={option} value={option} lang={option}>
              {LOCALE_LABEL[option]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
