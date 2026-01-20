// Response PokéApi avec limit & offset
export interface AllPokemon {
    count: number;
    next:string
    previous:string
    results: PokemonURL[]
}

// Pokemon Name & Url de la response de l'API
export interface PokemonURL {
    name: string
    url: string
}

// Response PokéApi d'un pokémon en détail
export interface Pokemon {
    id:number
    name:string
    weight:number
    height:number
    abilities: Ability[]
    sprites: Sprites
    stats : Stats[]
    types: Types[]
}

// Ability d'un pokémon
interface Ability {
    ability:{
        name:string
        url:string
    }
}

// Sprites d'un pokémon
interface Sprites {
    front_default: string
    other:{
        "official-artwork": {
            front_default: string
        }
    }
}

// Stats de base d'un pokémon
interface Stats {
    base_stats:number
    stat:{
        name: string
    }
}

// Types d'un pokémon
interface Types {
    slot:number
    type:{
        name: string
    }
}