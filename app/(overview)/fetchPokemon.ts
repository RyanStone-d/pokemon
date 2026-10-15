import { z } from "zod";

// 自己的 pokemon-api（Render + Neon），一次請求拿一整頁，不再一隻一隻打 PokeAPI
const API_URL =
  process.env.POKEMON_API_URL ?? "https://pokemon-api-3igu.onrender.com";

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
