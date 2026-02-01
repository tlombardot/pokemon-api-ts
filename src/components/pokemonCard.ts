import type { Pokemon } from "../types/pokemon.ts";

// On reprend les mêmes codes couleurs que pour le détail pour la cohérence
const TYPE_COLORS: { [key: string]: string } = {
  normal: "bg-[#A8A878] border-[#6D6D4E]", fire: "bg-[#F08030] border-[#9C531F]", 
  water: "bg-[#6890F0] border-[#445E9C]", electric: "bg-[#F8D030] border-[#A1871F]", 
  grass: "bg-[#78C850] border-[#4E8234]", ice: "bg-[#98D8D8] border-[#638D8D]",
  fighting: "bg-[#C03028] border-[#7D1F1A]", poison: "bg-[#A040A0] border-[#682A68]", 
  ground: "bg-[#E0C068] border-[#927D44]", flying: "bg-[#A890F0] border-[#6D5E9C]", 
  psychic: "bg-[#F85888] border-[#A13959]", bug: "bg-[#A8B820] border-[#6D7815]",
  rock: "bg-[#B8A038] border-[#786824]", ghost: "bg-[#705898] border-[#493963]", 
  dragon: "bg-[#7038F8] border-[#4924A1]", steel: "bg-[#B8B8D0] border-[#787887]", 
  dark: "bg-[#705848] border-[#49392F]", fairy: "bg-[#EE99AC] border-[#9B6470]"
};

export class PokemonCard extends HTMLElement {
  public _pokemonData: Pokemon[] = [];

  set data(pokemon: Pokemon[]) {
    this._pokemonData = pokemon;
    this.renderPokemonList(pokemon);
  }

  private renderPokemonList(pokemonList: Pokemon[]) {
    this.innerHTML = pokemonList
      .map((pokemon) => {
        const typesBadges = pokemon.types.map((t) => {
            const style = TYPE_COLORS[t.type.name] || "bg-gray-500 border-gray-600";
            return `<span class="${style} text-white px-1.5 py-px text-[10px] font-bold uppercase border shadow-sm rounded-sm" style="text-shadow: 1px 1px 0 #000;">${t.type.name}</span>`;
        }).join(" ");

        return /*html*/`
            <div onclick="window.location.hash = '/pokemon/${pokemon.id}'" 
                 class="group cursor-pointer bg-[#f9f9f9] dark:bg-slate-800 border border-[#aaa] dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 hover:border-[#666] dark:hover:border-slate-400 transition-all p-2 flex flex-col items-center gap-2 shadow-sm hover:shadow-md">
                
                <div class="bg-white dark:bg-slate-900 border border-[#ddd] dark:border-slate-700 p-2 w-full flex justify-center items-center h-32">
                    <img class="h-28 w-28 object-contain rendering-pixelated group-hover:scale-110 transition-transform duration-300" 
                         src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png" 
                         alt="${pokemon.name}"
                         loading="lazy">
                </div>

                <div class="text-center w-full">
                    <div class="text-[10px] text-gray-500 dark:text-gray-400 font-mono">#${String(pokemon.id).padStart(4, '0')}</div>
                    
                    <h3 class="text-[#0645ad] dark:text-blue-400 font-serif font-bold text-lg capitalize group-hover:underline truncate">
                        ${pokemon.name}
                    </h3>
                    
                    <div class="flex justify-center gap-1 mt-1">
                        ${typesBadges}
                    </div>
                </div>
            </div>
        `;
      })
      .join("");
    return this.innerHTML;
  }
}

customElements.define("pokemon-card", PokemonCard);