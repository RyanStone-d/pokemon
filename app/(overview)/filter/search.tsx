import { Input } from "@/design-system/input";
import { Field, FieldLabel } from "@/design-system/field";

export default function Search() {
  return (
    <div>
      <Field>
        <FieldLabel>Search</FieldLabel>
        <Input
          placeholder="Search by name or ID"
          className="rounded-sm p-5 border-none bg-[#6B7280]"
        />
      </Field>
    </div>
  );
}
