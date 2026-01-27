import type {Pokemon} from "../types/pokemon.ts";

export class PokemonCard extends HTMLElement
{

    public _pokemonData:Pokemon[] = []

    set data(pokemon: Pokemon[]) {
        this._pokemonData = pokemon;
        this.renderPokemonList(pokemon);
    }

    private renderPokemonList(pokemonList:Pokemon[]){
        this.innerHTML = pokemonList.map((pokemon)=>{
            const types = String(pokemon.types.map(p => p.type.name)).split(',')
            return `<div onclick="window.location.hash = '/pokemon/${pokemon.id}'" class ="justify-self-center bg-blue-200/20 rounded-3xl m-5 hover:scale-110 active:scale-95">
                        <p class="cursor-pointer text-center uppercase font-bold text-blue-400">#${pokemon.id}</p>
                        <img class="justify-self-center w-80" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png" alt=${pokemon.name}>
                        <p class="text-center uppercase font-bold text-white">${pokemon.name}</p>
                        <p class="text-center uppercase font-bold text-yellow-200">${types.map(t => t).join(' | ')}</p>
                    </div>
            `
        }).join('')
        return this.innerHTML

    }
}

customElements.define("pokemon-card", PokemonCard);