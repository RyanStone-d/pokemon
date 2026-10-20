import RouteSelect from "./route-select";
import Search from "./search";
import { POKEMON_TYPES, GENERATIONS } from "../pokemon";

// 圖鑑的篩選面板：Type、Generation 下拉加名字搜尋，條件都寫在網址上。
// 交換列表和發交換單的選擇器也用這個；交換列表會多塞一個「我想要／我拿出」切換在最上面
export default function Filter({
  header,
  searchLabel,
  searchPlaceholder,
}: {
  header?: React.ReactNode;
  searchLabel?: string;
  searchPlaceholder?: string;
} = {}) {
  return (
    <div className="bg-overlay/80 rounded p-6">
      {header && <div className="mb-6">{header}</div>}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 ">
        <RouteSelect name="type" label="Type" options={POKEMON_TYPES} />
        <RouteSelect
          name="generation"
          label="Generation"
          options={GENERATIONS}
        />
      </div>
      <div className="my-6">
        <Search label={searchLabel} placeholder={searchPlaceholder} />
      </div>
    </div>
  );
}
