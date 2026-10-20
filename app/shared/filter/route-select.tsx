"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/select";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";

import { Field, FieldLabel } from "@/design-system/field";
import { SelectOption } from "../pokemon-config";
import { cn } from "@/lib/utils";

type RouteSelectProps = Omit<
  React.ComponentProps<typeof SelectTrigger>,
  "name"
> & {
  name: string;
  label: string;
  options: SelectOption[];
};

const allOption = "_All_";

export default function RouteSelect({
  name,
  label,
  options,
  ...props
}: RouteSelectProps) {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const rawValue = searchParams.get(name);
  const defaultVal =
    rawValue && options.find((item) => item.value === rawValue)
      ? rawValue
      : allOption;

  const [isPending, startTransition] = useTransition();

  const handleSelect = useDebouncedCallback((val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (val === allOption) {
      params.delete(name);
    } else {
      params.set(name, val);
    }
    startTransition(() => {
      replace(`${pathName}?${params.toString()}`, { scroll: false });
    });
  }, 500);

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select
        name={name}
        defaultValue={defaultVal}
        onValueChange={handleSelect}
      >
        <SelectTrigger
          {...props}
          className={cn(
            "w-[180px] rounded-md p-5 border-border-warm capitalize",
            { "opacity-50": isPending },
          )}
        >
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="max-h-60 overflow-y-auto bg-[#6B7280]"
        >
          <SelectGroup>
            <SelectItem value={allOption}>All</SelectItem>
            {options.map(({ label, value }) => (
              <SelectItem key={label} value={value} className="capitalize">
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
