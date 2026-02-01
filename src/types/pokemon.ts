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
  base_experience: number; // Ajouté pour l'infobox
  abilities: Ability[];
  sprites: Sprites;
  stats: Stats[];
  types: Types[];
  cries: Cries;
  moves: PokemonMove[]; // Ajouté pour le tableau des attaques
  species: {
    name: string;
    url: string;
  };
}

// --- ABILITIES (Talents) ---
export interface Ability {
  is_hidden: boolean; // Ajouté pour savoir si c'est un talent caché
  slot: number;
  ability: {
    name: string;
    url: string;
  };
}

// --- MOVES (Attaques) ---
export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
  version_group_details: VersionGroupDetail[];
}

interface VersionGroupDetail {
  level_learned_at: number;
  move_learn_method: {
    name: string; 
    url: string;
  };
  version_group: {
    name: string;
    url: string;
  };
}

// --- SPRITES ---
interface Sprites {
  front_default: string;
  front_shiny: string;
  other: {
    "official-artwork": {
      front_default: string;
      front_shiny: string;
    };
  };
}

// --- STATS ---
interface Stats {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

// --- TYPES ---
interface Types {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

interface Cries {
  latest: string;
  legacy: string;
}

// --- EVOLUTION TREE ---
export interface EvoNode {
  name: string;
  id: string;
  image: string;
  evolvesTo: EvoNode[];
  evolutionDetails: EvolutionDetail[];
}

// Détails spécifiques d'une évolution
export interface EvolutionDetail {
  min_level?: number;
  min_happiness?: number;
  item?: {
    name: string;
  };
  trigger?: {
    name: string;
  };
  known_move_type?: {
    name: string;
  };
  location?: {
    name: string;
  };
  time_of_day?: string;
  [key: string]: any;
}