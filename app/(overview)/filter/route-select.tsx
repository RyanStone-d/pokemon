"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/select";

import { Field, FieldLabel } from "@/design-system/field";

type RouteSelectProps = Omit<
  React.ComponentProps<typeof SelectTrigger>,
  "name"
> & {
  name: string;
  label: string;
  options: string[];
};

export default function RouteSelect({
  name,
  label,
  options,
  ...props
}: RouteSelectProps) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select name={name}>
        <SelectTrigger
          className="w-[180px] rounded-md p-5 border-border-warm"
          {...props}
        >
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="max-h-60 overflow-y-auto bg-[#6B7280]"
        >
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
