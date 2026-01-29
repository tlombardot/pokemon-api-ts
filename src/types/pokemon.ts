// Response PokéApi avec limit & offset
export interface AllPokemon {
  count: number;
  next: string;
  previous: string;
  results: PokemonURL[];
}

// Pokemon Name & Url de la response de l'API
export interface PokemonURL {
  name: string;
  url: string;
}

// Response PokéApi d'un pokémon en détail
export interface Pokemon {
  id: number;
  name: string;
  weight: number;
  height: number;
  abilities: Ability[];
  sprites: Sprites;
  stats: Stats[];
  types: Types[];
  cries: Cries;
  species: {
    url: string;
  };
}

// Ability d'un pokémon
interface Ability {
  ability: {
    name: string;
    url: string;
  };
}

// Sprites d'un pokémon
interface Sprites {
  front_default: string;
  other: {
    "official-artwork": {
      front_default: string;
    };
  };
}

// Stats de base d'un pokémon
interface Stats {
  base_stat: number;
  stat: {
    name: string;
  };
}

// Types d'un pokémon
interface Types {
  slot: number;
  type: {
    name: string;
  };
}

interface Cries {
  latest: string;
}

export interface EvoNode {
  name: string;
  id: string;
  image: string;
  evolvesTo: EvoNode[]; // Le tableau des évolutions possibles
}
