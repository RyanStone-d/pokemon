import { z } from "zod";
import { API_URL } from "../api";

// 自己的 pokemon-api（Render + Neon），一次請求拿一整頁，不再一隻一隻打 PokeAPI。
// 網址跟交換單、登入共用 app/shared/api.ts 的 API_URL，環境變數改一處就好

const pokemonListSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      image: z.string().url().nullable(),
      types: z.array(z.string()),
    }),
  ),
  page: z.number(),
  perPage: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

const pokemonDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string().url().nullable(),
  height: z.number(),
  weight: z.number(),
  types: z.array(z.string()),
  stats: z.object({
    hp: z.number(),
    attack: z.number(),
    defense: z.number(),
    spAtk: z.number(),
    spDef: z.number(),
    speed: z.number(),
  }),
  generation: z.number(),
});

async function getJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 3600 }, // 一小時更新一次
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const parsed = schema.safeParse(await response.json());
    if (!parsed.success) {
      throw new Error(`Invalid API response: ${parsed.error.message}`);
    }
    return parsed.data;
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error);
    throw error;
  }
}

function getList(
  page: number,
  type?: string,
  generation?: string,
  query?: string,
) {
  const search = new URLSearchParams({ page: String(Math.max(1, page)) });
  if (type) search.set("type", type);
  if (generation) search.set("generation", generation);
  if (query) search.set("search", query.toLowerCase());
  return getJson(`/pokemon?${search}`, pokemonListSchema);
}

export async function fetchPokemonList(
  page: number,
  type?: string,
  generation?: string,
  query?: string,
) {
  const { items } = await getList(page, type, generation, query);
  return items;
}

export async function fetchTotalPages(
  type?: string,
  generation?: string,
  query?: string,
) {
  const { totalPages } = await getList(1, type, generation, query);
  return totalPages;
}

// 「顯示 NO.x 到 NO.y，共 z 隻」用的數字。跟 Cards 打同一個網址，Next 會合併成一次請求
export async function fetchSummary(
  page: number,
  type?: string,
  generation?: string,
  query?: string,
) {
  const list = await getList(page, type, generation, query);
  const { total, perPage } = list;
  return {
    from: total === 0 ? 0 : (list.page - 1) * perPage + 1,
    to: Math.min(list.page * perPage, total),
    total,
  };
}

export async function fetchPokemonDetail(id: string) {
  const p = await getJson(
    `/pokemon/${encodeURIComponent(id)}`,
    pokemonDetailSchema,
  );

  return {
    name: p.name,
    id: p.id,
    types: p.types,
    image: p.image,
    stats: [
      { name: "HP", val: p.stats.hp },
      { name: "Atk", val: p.stats.attack },
      { name: "Def", val: p.stats.defense },
      { name: "SpA", val: p.stats.spAtk },
      { name: "SpD", val: p.stats.spDef },
      { name: "Spe", val: p.stats.speed },
    ],
    shape: {
      weight: p.weight.toFixed(1), // 公斤，API 已經換算好
      height: p.height.toFixed(1), // 公尺
    },
  };
}
