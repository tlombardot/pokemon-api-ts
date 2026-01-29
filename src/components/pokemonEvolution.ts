import { getDataFromURL } from "../service/pokemonApi.ts";
import type { EvoNode } from "../types/pokemon.ts";

export class PokemonEvolution extends HTMLElement {
  static get observedAttributes() {
    return ["src"];
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === "src" && newValue) {
      this.loadEvolutions(newValue);
    }
  }

  private async loadEvolutions(speciesUrl: string) {
    this.innerHTML = `<p class="text-gray-500 text-sm animate-pulse">Chargement des évolutions...</p>`;
    try {
      const speciesData = await getDataFromURL(speciesUrl);
      if (!speciesData?.evolution_chain) {
        this.innerHTML = `<p class="text-gray-500">Pas d'évolution</p>`;
        return;
      }

      const evoData = await getDataFromURL(speciesData.evolution_chain.url);
      const evoTree = this.buildEvoTree(evoData.chain);
      console.log(evoTree);
      this.innerHTML = "";
      const container = document.createElement("div");
      container.className =
        "flex items-center justify-center overflow-x-auto py-4";
      container.innerHTML = this.renderNode(evoTree);
      this.appendChild(container);
    } catch (err) {
      console.error(err);
      this.innerHTML = `<p class="text-red-400">Erreur de chargement</p>`;
    }
  }

  private buildEvoTree(chainNode: any): EvoNode {
    const urlParts = chainNode.species.url.split("/");
    const id = urlParts[urlParts.length - 2];

    const node: EvoNode = {
      name: chainNode.species.name,
      id: id,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      evolvesTo: [],
    };

    if (chainNode.evolves_to && chainNode.evolves_to.length > 0) {
      node.evolvesTo = chainNode.evolves_to.map((childNode: any) =>
        this.buildEvoTree(childNode),
      );
    }

    return node;
  }

  private renderNode(node: EvoNode): string {
    // Parent
    const pokemonHtml = /*html*/ `
            <div class="flex flex-col items-center group cursor-pointer relative z-10" onclick="window.location.hash = '/pokemon/${node.id}'">
                <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-700/50 border border-gray-600 flex items-center justify-center overflow-hidden mb-2 relative transition-transform hover:scale-110 shadow-lg">
                     <img src="${node.image}" alt="${node.name}" class="w-full h-full object-contain p-1 z-10">
                     <div class="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/20 transition-colors"></div>
                </div>
                <span class="text-xs font-bold text-gray-300 uppercase tracking-wider group-hover:text-blue-300 transition-colors">${node.name}</span>
            </div>
        `;
    if (node.evolvesTo.length === 0) {
      return pokemonHtml;
    }

    // Fléche
    const arrowHtml = /*html*/ `
            <div class="text-gray-500 mx-2 md:mx-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </div>
        `;

    // Enfant
    const childrenHtml = node.evolvesTo
      .map((child) => this.renderNode(child))
      .join("");

    return /*html*/ `
            <div class="flex items-center">
                ${pokemonHtml}
                
                ${arrowHtml}
                
                <div class="grid grid-cols-4 items-center justify-center gap-4">
                    ${childrenHtml}
                </div>
            </div>
        `;
  }
}

customElements.define("pokemon-evolution", PokemonEvolution);
