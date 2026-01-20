import type {Pokemon} from "../types/pokemon.ts";

export class PokemonCard extends HTMLElement
{

    private _pokemonData: Pokemon[] = []

    set data(pokemon: Pokemon[]) {
        this._pokemonData = pokemon;
        this.renderPokemonList(pokemon);
    }

    private renderPokemonList(pokemonList:Pokemon[]){
        this.innerHTML = pokemonList.map((pokemon)=>{
            return `<div class ="justify-self-center bg-blue-200/20 rounded-3xl m-5 hover:scale-110 active:scale-95">
                        <img class="justify-self-center w-80" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png" alt=${pokemon.name}>
                        <p class="text-center uppercase font-bold text-white">${pokemon.name}</p>
                    </div>
            `
        }).join('')
        return this.innerHTML

    }
    connectedCallback(){
       this.renderPokemonList(this._pokemonData)
    }
}

customElements.define("pokemon-card", PokemonCard);