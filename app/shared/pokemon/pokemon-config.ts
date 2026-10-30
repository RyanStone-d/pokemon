export const TYPE_COLOR_MAP = {
  normal: "#a8a878",
  fire: "#f08030",
  water: "#6890f0",
  electric: "#f8d030",
  grass: "#78c850",
  ice: "#98d8d8",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#e0c068",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#b8b8d0",
  fairy: "#ee99ac",
} as const;

export type PokemonType = keyof typeof TYPE_COLOR_MAP;

export type SelectOption = {
  label: string;
  value: string;
};

export function getPokemonBackground(types: string[]): string {
  const color1 = TYPE_COLOR_MAP[types[0] as PokemonType];
  const color2 = TYPE_COLOR_MAP[types[1] as PokemonType];
  return color2 ? `linear-gradient(to bottom, ${color1}, ${color2})` : color1;
}
