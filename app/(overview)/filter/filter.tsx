import RouteSelect from "./route-select";
import Search from "./search";

const TYPES = [
  "Normal",
  "Fire",
  "Water",
  "Electric",
  "Grass",
  "Ice",
  "Fighting",
  "Poison",
  "Ground",
  "Flying",
  "Psychic",
  "Bug",
  "Rock",
  "Ghost",
  "Dragon",
  "Dark",
  "Steel",
  "Fairy",
];

const GENERATIONS = [
  "Gen I",
  "Gen II",
  "Gen III",
  "Gen IV",
  "Gen V",
  "Gen VI",
  "Gen VII",
  "Gen VIII",
  "Gen IX",
];

const PERSONALITIES = [
  "Timid",
  "Jolly",
  "Adamant",
  "Modest",
  "Bold",
  "Calm",
  "Careful",
  "Naive",
  "Hasty",
  "Rash",
];

export default function Filter() {
  return (
    <div className="bg-overlay/80 rounded p-6">
      <div className="flex justify-between items-center gap-4 ">
        <RouteSelect name="type" label="Type" options={TYPES} />
        <RouteSelect
          name="generation"
          label="Generation"
          options={GENERATIONS}
        />
        <RouteSelect
          name="personality"
          label="Personality"
          options={PERSONALITIES}
        />
      </div>
      <div className="my-6">
        <Search />
      </div>
    </div>
  );
}
