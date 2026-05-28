import RouteSelect from "./route-select";
import Search from "./search";
import { POKEMON_TYPES, GENERATIONS } from "../pokemon-types";

export default function Filter() {
  return (
    <div className="bg-overlay/80 rounded p-6">
      <div className="flex justify-between items-center gap-4 ">
        <RouteSelect name="type" label="Type" options={POKEMON_TYPES} />
        <RouteSelect
          name="generation"
          label="Generation"
          options={GENERATIONS}
        />
      </div>
      <div className="my-6">
        <Search />
      </div>
    </div>
  );
}
