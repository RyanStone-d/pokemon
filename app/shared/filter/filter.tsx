import RouteSelect from "./route-select";
import Search from "./search";
import { fetchGenerations, fetchTypes } from "../pokemon";
import { getDictionary } from "../i18n/server";

// 圖鑑的篩選面板：Type、Generation 下拉加名字搜尋，條件都寫在網址上。
// 交換列表和發交換單的選擇器也用這個；交換列表會多塞一個「我想要／我拿出」切換在最上面
export default async function Filter({
  header,
  searchLabel,
  searchPlaceholder,
}: {
  header?: React.ReactNode;
  searchLabel?: string;
  searchPlaceholder?: string;
} = {}) {
  const [t, types, generations] = await Promise.all([
    getDictionary(),
    fetchTypes(),
    fetchGenerations(),
  ]);
  // 選項名字由 API 依語系回傳。網址上的值跟 /pokemon 的篩選參數一樣：屬性用 code、世代用 id，
  // 換語系時網址不用變
  const typeOptions = types.map(({ code, name }) => ({ label: name, value: code }));
  const generationOptions = generations.map(({ id, name }) => ({
    label: name,
    value: String(id),
  }));

  return (
    <div className="bg-overlay/80 rounded p-6">
      {header && <div className="mb-6">{header}</div>}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 ">
        <RouteSelect name="type" label={t.filter.type} options={typeOptions} />
        <RouteSelect
          name="generation"
          label={t.filter.generation}
          options={generationOptions}
        />
      </div>
      <div className="my-6">
        <Search label={searchLabel} placeholder={searchPlaceholder} />
      </div>
    </div>
  );
}
