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
    this.innerHTML = `<div class="text-gray-500 dark:text-gray-400 text-center text-sm font-serif italic py-4">Chargement de la famille...</div>`;
    try {
      const speciesData = await getDataFromURL(speciesUrl);
      if (!speciesData?.evolution_chain) {
        this.innerHTML = `<div class="text-gray-500 dark:text-gray-400 text-center">Pas d'évolution</div>`;
        return;
      }

      const evoData = await getDataFromURL(speciesData.evolution_chain.url);
      const evoTree = this.buildEvoTree(evoData.chain);
      
      this.innerHTML = "";
      const container = document.createElement("div");
      container.className = "flex justify-center w-full overflow-x-auto";
      
      if (evoTree.evolvesTo.length > 2) {
          container.innerHTML = this.renderEeveeStyle(evoTree);
      } else {
          container.innerHTML = this.renderLinearStyle(evoTree);
      }
      
      this.appendChild(container);
    } catch (err) {
      console.error(err);
      this.innerHTML = `<div class="text-red-600 dark:text-red-400 text-center">Erreur.</div>`;
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
      evolutionDetails: chainNode.evolution_details || [],
    };

    if (chainNode.evolves_to && chainNode.evolves_to.length > 0) {
      node.evolvesTo = chainNode.evolves_to.map((childNode: any) =>
        this.buildEvoTree(childNode),
      );
    }
    return node;
  }

  private getConditionText(details: any[]): string {
    if (!details || details.length === 0) return "Évolution";
    const d = details[0]; 

    let text = "";
    if (d.min_level) text = `Niveau ${d.min_level}`;
    else if (d.item) text = `Avec ${d.item.name.replace(/-/g, ' ')}`;
    else if (d.trigger?.name === "trade") text = "Échange";
    else if (d.min_happiness) text = "Bonheur";
    else if (d.known_move_type) text = `Avec cap. ${d.known_move_type.name}`;
    else if (d.location) text = `À ${d.location.name.replace(/-/g, ' ')}`;
    else text = "Spécial";

    if (d.time_of_day) text += `, de ${d.time_of_day}`;
    
    return text;
  }

  // --- STYLE 1 : TABLEAU COMPLEXE (Dark Mode Ready) ---
  private renderEeveeStyle(node: EvoNode): string {
    const children = node.evolvesTo;
    
    const rowsHtml = children.map((child, index) => {
        const condition = this.getConditionText(child.evolutionDetails);
        const childCell = /*html*/`
            <td class="border border-[#aaa] dark:border-slate-700 p-2 bg-white dark:bg-slate-900 text-center text-sm dark:text-gray-300">
                ${condition} ►
            </td>
            <td class="border border-[#aaa] dark:border-slate-700 p-2 bg-white dark:bg-slate-900 text-center w-[120px]">
                <div class="flex flex-col items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded transition-colors" onclick="window.location.hash = '/pokemon/${child.id}'">
                    <img src="${child.image}" class="w-16 h-16 object-contain rendering-pixelated" alt="${child.name}">
                    <span class="text-[#0645ad] dark:text-blue-400 font-bold text-sm hover:underline capitalize">${child.name}</span>
                </div>
            </td>
        `;

        if (index === 0) {
            return /*html*/`
                <tr>
                    <td rowspan="${children.length}" class="border border-[#aaa] dark:border-slate-700 p-4 bg-white dark:bg-slate-900 text-center w-[120px]">
                        <div class="flex flex-col items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded transition-colors" onclick="window.location.hash = '/pokemon/${node.id}'">
                            <img src="${node.image}" class="w-20 h-20 object-contain rendering-pixelated" alt="${node.name}">
                            <span class="text-black dark:text-white font-bold text-sm capitalize">${node.name}</span>
                        </div>
                    </td>
                    ${childCell}
                </tr>
            `;
        } else {
            return `<tr>${childCell}</tr>`;
        }
    }).join("");

    return /*html*/`
        <table class="border-collapse border border-[#aaa] dark:border-slate-700 bg-[#f9f9f9] dark:bg-slate-800 text-sm shadow-sm transition-colors" style="min-width: 300px;">
            <thead>
                <tr class="bg-[#cedff2] dark:bg-slate-800">
                    <th colspan="3" class="border border-[#aaa] dark:border-slate-700 p-2 text-center font-serif dark:text-gray-200">Famille d'évolution de ${node.name}</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    `;
  }

  // --- STYLE 2 : TABLEAU VERTICAL (Dark Mode Ready) ---
  private renderLinearStyle(node: EvoNode): string {
    
    const buildLinearRows = (current: EvoNode): string => {
        let html = "";

        // 1. Pokémon
        html += /*html*/`
            <tr>
                <td colspan="2" class="p-4 border-l border-r border-[#aaa] dark:border-slate-700 bg-white dark:bg-slate-900 text-center">
                    <div class="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform" onclick="window.location.hash = '/pokemon/${current.id}'">
                        <img src="${current.image}" class="w-20 h-20 object-contain rendering-pixelated" alt="${current.name}">
                        <span class="text-[#0645ad] dark:text-blue-400 font-bold hover:underline capitalize mt-1">${current.name}</span>
                    </div>
                </td>
            </tr>
        `;

        // 2. Évolutions
        if (current.evolvesTo.length > 0) {
            if (current.evolvesTo.length > 1) {
                const width = 100 / current.evolvesTo.length;
                html += "<tr>";
                // Conditions
                current.evolvesTo.forEach(child => {
                    html += /*html*/`
                        <td class="p-2 border border-[#aaa] dark:border-slate-700 bg-white dark:bg-slate-900 text-center text-xs dark:text-gray-300" style="width:${width}%">
                            <div class="my-1">${this.getConditionText(child.evolutionDetails)} ▼</div>
                        </td>
                    `;
                });
                html += "</tr><tr>";
                // Pokémon Enfants
                current.evolvesTo.forEach(child => {
                    html += /*html*/`
                        <td class="p-4 border border-[#aaa] dark:border-slate-700 bg-white dark:bg-slate-900 text-center align-top">
                            <div class="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform" onclick="window.location.hash = '/pokemon/${child.id}'">
                                <img src="${child.image}" class="w-16 h-16 object-contain rendering-pixelated" alt="${child.name}">
                                <span class="text-[#0645ad] dark:text-blue-400 font-bold hover:underline capitalize mt-1">${child.name}</span>
                            </div>
                        </td>
                    `;
                });
                html += "</tr>";
            } 
            else {
                const child = current.evolvesTo[0];
                html += /*html*/`
                    <tr>
                        <td colspan="2" class="py-1 border-l border-r border-[#aaa] dark:border-slate-700 bg-white dark:bg-slate-900 text-center text-xs">
                            <div class="py-1 font-bold text-gray-700 dark:text-gray-400">${this.getConditionText(child.evolutionDetails)} ▼</div>
                        </td>
                    </tr>
                `;
                html += buildLinearRows(child);
            }
        }
        return html;
    };

    return /*html*/`
        <table class="border-collapse border border-[#aaa] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm shadow-sm w-full max-w-[400px] transition-colors">
            <thead>
                <tr class="bg-[#cedff2] dark:bg-slate-800">
                    <th colspan="2" class="border border-[#aaa] dark:border-slate-700 p-2 text-center font-serif dark:text-gray-200">Famille d'évolution</th>
                </tr>
            </thead>
            <tbody>
                ${buildLinearRows(node)}
            </tbody>
        </table>
    `;
  }
}

customElements.define("pokemon-evolution", PokemonEvolution);