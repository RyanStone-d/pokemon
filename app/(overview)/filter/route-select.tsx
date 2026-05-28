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

import { Field, FieldLabel } from "@/design-system/field";
import { SelectOption } from "../pokemon-types";

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

  const handleSelect = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (val === allOption) {
      params.delete(name);
    } else {
      params.set(name, val);
    }
    replace(`${pathName}?${params.toString()}`);
  };

  const rawValue = searchParams.get(name);
  const currentValue =
    rawValue && options.find((item) => item.value === rawValue) ? rawValue : "";

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select name={name} value={currentValue} onValueChange={handleSelect}>
        <SelectTrigger
          className="w-[180px] rounded-md p-5 border-border-warm capitalize"
          {...props}
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
