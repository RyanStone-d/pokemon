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
});

const LIMIT = 10;

export async function fetchPokemonList(page: number) {
  const offset = (page - 1) * LIMIT;

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${offset}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const parsed = pokemonListSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new Error(`Invalid API response: ${parsed.error.message}`);
    }

    const pokemonList = await Promise.all(
      parsed.data.results.map(async (pokemon) => {
        const detailRes = await fetch(pokemon.url);
        const detailParsed = pokemonDetailSchema.safeParse(
          await detailRes.json(),
        );
        if (!detailParsed.success) {
          throw new Error(
            `Invalid Pokemon detail response for ${pokemon.name}: ${detailParsed.error.message}`,
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

export async function fetchTotalPages() {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const parsed = z
    .object({ count: z.number() })
    .safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(`Invalid API response: ${parsed.error.message}`);
  }
  return Math.ceil(parsed.data.count / LIMIT);
}
