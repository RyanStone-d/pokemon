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

const LIMIT = 10;

async function getDefaultUrls(page: number) {
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

    return parsed.data.results.map((pokemon) => pokemon.url);
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

    const list = parsed.data.pokemon.map((entry) => entry.pokemon.url);

    return list;
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

    const list = parsed.data.pokemon_species
      .sort((a, b) => {
        const idA = parseInt(a.url.split("/").filter(Boolean).at(-1) ?? "0");
        const idB = parseInt(b.url.split("/").filter(Boolean).at(-1) ?? "0");
        return idA - idB;
      })
      .map((entry) => entry.url);

    return list;
  } catch (error) {
    console.error("Failed to fetch Pokemon data:", error);
    throw error;
  }
}

async function getCombinedUrls(type: string, generation: string) {
  const [typeRes, generationRes] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/type/${type}`),
    fetch(`https://pokeapi.co/api/v2/generation/${generation}`),
  ]);
  if (!typeRes.ok) {
    throw new Error(`HTTP error! status: ${typeRes.status}`);
  }

  if (!generationRes.ok) {
    throw new Error(`HTTP error! status: ${generationRes.status}`);
  }

  const [typeJson, generationJson] = await Promise.all([
    typeRes.json(),
    generationRes.json(),
  ]);

  const typeParsed = pokemonTypeSchema.safeParse(typeJson);
  const generationParsed = pokemonGenerationSchema.safeParse(generationJson);

  if (!typeParsed.success) {
    throw new Error(
      `Invalid API response for type: ${typeParsed.error.message}`,
    );
  }

  if (!generationParsed.success) {
    throw new Error(`Invalid API response: ${generationParsed.error.message}`);
  }

  const set = new Set(
    generationParsed.data.pokemon_species.map((entry) => entry.url),
  );
  const list = typeParsed.data.pokemon.filter((entry) =>
    set.has(entry.pokemon.url),
  );

  return list.map((entry) => entry.pokemon.url);
}

function offsetList(list: string[], page: number) {
  const offset = (page - 1) * LIMIT;
  return list.slice(offset, offset + LIMIT);
}

export async function fetchPokemonList(
  page: number,
  type?: string,
  generation?: string,
) {
  let urls: string[];

  if (type && generation) {
    const list = await getCombinedUrls(type, generation);
    urls = offsetList(list, page);
  } else if (type) {
    const list = await getPokemonTypeUrls(type);
    urls = offsetList(list, page);
  } else if (generation) {
    const list = await getGenerationUrls(generation);
    urls = offsetList(list, page);
  } else {
    urls = await getDefaultUrls(page);
  }

  console.log({ urls });
  try {
    const pokemonList = await Promise.all(
      urls.map(async (url) => {
        const detailRes = await fetch(url);
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

export async function fetchTotalPages(type?: string, generation?: string) {
  if (type && generation) {
    const list = await getCombinedUrls(type, generation);
    return Math.ceil(list.length / LIMIT);
  }

  if (type) {
    const list = await getPokemonTypeUrls(type);
    return Math.ceil(list.length / LIMIT);
  }

  if (generation) {
    const list = await getGenerationUrls(generation);
    return Math.ceil(list.length / LIMIT);
  }

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
