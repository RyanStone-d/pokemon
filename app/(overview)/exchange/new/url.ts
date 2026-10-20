// /exchange/new 的狀態全部放在網址上：正在選哪一格、兩格各選了誰、篩選條件。
// 這樣篩選（RouteSelect、Search）、分頁、點卡片都只是換網址，整頁維持 Server Component

export type PickerStep = "offered" | "wanted";

export type NewTradeParams = {
  step: PickerStep;
  offered?: number;
  wanted?: number;
  query: string;
  page: number;
  type: string;
  generation: string;
};

export function newTradeUrl(
  params: NewTradeParams,
  overrides: Partial<NewTradeParams> = {},
) {
  const p = { ...params, ...overrides };
  const search = new URLSearchParams();
  search.set("step", p.step);
  if (p.offered) search.set("offered", String(p.offered));
  if (p.wanted) search.set("wanted", String(p.wanted));
  if (p.query) search.set("query", p.query);
  if (p.page > 1) search.set("page", String(p.page));
  if (p.type) search.set("type", p.type);
  if (p.generation) search.set("generation", p.generation);
  return `/exchange/new?${search}`;
}
