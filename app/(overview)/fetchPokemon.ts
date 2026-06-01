import { z } from "zod";

const pokemonListSchema = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
  results: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
    }),
  ),
});

const pokemonDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  sprites: z.object({
    other: z.object({
      "official-artwork": z.object({
        front_default: z.string().url().nullable(),
      }),
    }),
  }),
  types: z.array(
    z.object({
      slot: z.number(),
      type: z.object({ name: z.string() }),
    }),
  ),
  stats: z.array(
    z.object({
      base_stat: z.number(),
      effort: z.number(),
      stat: z.object({
        name: z.string(),
        url: z.string().url(),
      }),
    }),
  ),
  weight: z.number(),
  height: z.number(),
});

const pokemonTypeSchema = z.object({
  id: z.number(),
  pokemon: z.array(
    z.object({
      pokemon: z.object({
        name: z.string(),
        url: z.string(),
      }),
    }),
  ),
});

const pokemonGenerationSchema = z.object({
  id: z.number(),
  pokemon_species: z.array(
    z.object({
      name: z.string(),
      url: z
        .string()
        .transform((url) => url.replace("pokemon-species", "pokemon")),
    }),
  ),
});

const MAX_POKEMON = 1500;
const LIMIT = 20;

async function getDefaultUrls() {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`,
      {
        next: { revalidate: 86400 },
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const parsed = pokemonListSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new Error(`Invalid API response: ${parsed.error.message}`);
    }

    return parsed.data.results;
  } catch (error) {
    console.error("Failed to fetch Pokemon data:", error);
    throw error;
  }
}

async function getPokemonTypeUrls(type: string) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const parsed = pokemonTypeSchema.safeParse(await response.json());

    if (!parsed.success) {
      throw new Error(`Invalid API response: ${parsed.error.message}`);
    }

    return parsed.data.pokemon;
  } catch (error) {
    console.error("Failed to fetch Pokemon data:", error);
    throw error;
  }
}

async function getGenerationUrls(generation: string) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/generation/${generation}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const parsed = pokemonGenerationSchema.safeParse(await response.json());

    if (!parsed.success) {
      throw new Error(`Invalid API response: ${parsed.error.message}`);
    }

    const list = parsed.data.pokemon_species.sort((a, b) => {
      const idA = parseInt(a.url.split("/").filter(Boolean).at(-1) ?? "0");
      const idB = parseInt(b.url.split("/").filter(Boolean).at(-1) ?? "0");
      return idA - idB;
    });

    return list;
  } catch (error) {
    console.error("Failed to fetch Pokemon data:", error);
    throw error;
  }
}

async function getFilterList(
  type?: string,
  generation?: string,
  query?: string,
) {
  const [allRes, typeRes, genRes] = await Promise.all([
    getDefaultUrls(),
    type ? getPokemonTypeUrls(type) : Promise.resolve(null),
    generation ? getGenerationUrls(generation) : Promise.resolve(null),
  ]);
  let result = allRes;

  if (type) {
    const set = new Set(typeRes!.map((item) => item.pokemon.name));
    result = allRes.filter((item) => set.has(item.name));
  }

  if (generation) {
    const set = new Set(genRes!.map((item) => item.name));
    result = result.filter((item) => set.has(item.name));
  }

  if (query) {
    const lowerQuery = query.toLowerCase();
    result = result.filter((item) =>
      item.name.toLowerCase().includes(lowerQuery),
    );
  }

  return result;
}

function offsetList(list: string[], page: number) {
  const offset = (page - 1) * LIMIT;
  return list.slice(offset, offset + LIMIT);
}

export async function fetchPokemonList(
  page: number,
  type?: string,
  generation?: string,
  query?: string,
) {
  const result = await getFilterList(type, generation, query);
  const list = offsetList(
    result.map((item) => item.url),
    page,
  );

  try {
    const pokemonList = await Promise.all(
      list.map(async (url) => {
        const detailRes = await fetch(url, {
          next: { revalidate: 3600 }, // 一小時更新一次
        });
        const detailParsed = pokemonDetailSchema.safeParse(
          await detailRes.json(),
        );
        if (!detailParsed.success) {
          throw new Error(
            `Invalid Pokemon detail response for ${url}: ${detailParsed.error.message}`,
          );
        }

        return {
          name: detailParsed.data.name,
          id: detailParsed.data.id,
          types: detailParsed.data.types.map((t) => t.type.name),
          image:
            detailParsed.data.sprites.other["official-artwork"].front_default,
        };
      }),
    );
    return pokemonList;
  } catch (error) {
    console.error("Failed to fetch Pokemon data:", error);
    throw error;
  }
}

export async function fetchTotalPages(
  type?: string,
  generation?: string,
  query?: string,
) {
  const result = await getFilterList(type, generation, query);
  return Math.ceil(result.length / LIMIT);
}

export async function fetchPokemonDetail(id: string) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const parsed = pokemonDetailSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new Error(`Invalid API response: ${parsed.error.message}`);
    }

    const nameMap: Record<string, string> = {
      hp: "HP",
      attack: "Atk",
      defense: "Def",
      "special-attack": "SpA",
      "special-defense": "SpD",
      speed: "Spe",
    };
    return {
      name: parsed.data.name,
      id: parsed.data.id,
      types: parsed.data.types.map((t) => t.type.name),
      image: parsed.data.sprites.other["official-artwork"].front_default,
      stats: parsed.data.stats.map((item) => ({
        name: nameMap[item.stat.name],
        val: item.base_stat,
      })),
      shape: {
        weight: (+parsed.data.weight / 10).toFixed(1), // 換算為公斤
        height: (+parsed.data.height / 10).toFixed(1), // 換算為公尺
      },
    };
  } catch (e) {
    console.error("Failed to fetch Pokemon detail:", e);
    throw e;
  }
}
