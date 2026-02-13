import { getDataFromURL } from "../service/pokemonApi.ts";
import type { Team, TeamMember } from "../types/team.ts";

// Couleurs
const TYPE_COLORS: { [key: string]: string } = {
  normal: "bg-[#A8A878]", fire: "bg-[#F08030]", water: "bg-[#6890F0]", 
  electric: "bg-[#F8D030]", grass: "bg-[#78C850]", ice: "bg-[#98D8D8]",
  fighting: "bg-[#C03028]", poison: "bg-[#A040A0]", ground: "bg-[#E0C068]", 
  flying: "bg-[#A890F0]", psychic: "bg-[#F85888]", bug: "bg-[#A8B820]",
  rock: "bg-[#B8A038]", ghost: "bg-[#705898]", dragon: "bg-[#7038F8]", 
  steel: "bg-[#B8B8D0]", dark: "bg-[#705848]", fairy: "bg-[#EE99AC]"
};

// Cache API
const TYPE_RELATIONS_CACHE: { [key: string]: any } = {};

export class TeamBuilder extends HTMLElement {
  private _teams: Team[] = [];
  private _currentTeam: Team;
  private _searchCache: { name: string; url: string }[] = [];

  constructor() {
    super();
    this._currentTeam = this.createEmptyTeam();
    this.loadTeamsFromStorage();
  }

  connectedCallback() {
    this.initSearchData(); // Charger la liste des 1000 pokémons
    this.render();
  }

  // --- Fonctions ---

  private createEmptyTeam(): Team {
    return {
      id: Date.now().toString(),
      name: "Nouvelle Équipe",
      members: [null, null, null, null, null, null]
    };
  }

  private loadTeamsFromStorage() {
    const stored = localStorage.getItem("pokemon_teams");
    if (stored) {
      this._teams = JSON.parse(stored);
    }
  }

  private saveCurrentTeam() {
    const index = this._teams.findIndex(t => t.id === this._currentTeam.id);
    if (index >= 0) {
      this._teams[index] = this._currentTeam;
    } else {
      this._teams.push(this._currentTeam);
    }
    
    localStorage.setItem("pokemon_teams", JSON.stringify(this._teams));
    this.render();
    alert("Équipe sauvegardée !");
  }

  private deleteTeam(teamId: string) {
    if(!confirm("Voulez-vous vraiment supprimer cette équipe ?")) return;

    this._teams = this._teams.filter(t => t.id !== teamId);
    localStorage.setItem("pokemon_teams", JSON.stringify(this._teams));
    
    // Supprime une équipe, créer une nouvelle
    if (this._currentTeam.id === teamId) {
        this._currentTeam = this.createEmptyTeam();
    }
    this.render();
  }

  private loadTeam(teamId: string) {
    const found = this._teams.find(t => t.id === teamId);
    if (found) {
        // Clone pour casser la référence
        this._currentTeam = structuredClone(found);
        this.render();
    }
  }

  private async addPokemon(url: string, slotIndex: number) {
    try {
        const p = await getDataFromURL(url);
        if (!p) return;

        const member: TeamMember = {
            id: p.id,
            name: p.name,
            sprites: { front_default: p.sprites.front_default },
            types: p.types
        };

        this._currentTeam.members[slotIndex] = member;
        this.render(); 
    } catch (e) {
        console.error("Erreur ajout pokemon", e);
    }
  }

  private removePokemon(slotIndex: number) {
    this._currentTeam.members[slotIndex] = null;
    this.render();
  }

  private async initSearchData() {
    if (this._searchCache.length > 0) return;
    try {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1350");
      const data = await res.json();
      this._searchCache = data.results;
    } catch (e) { console.error(e); }
  }

  // --- Render ---

  private render() {
    this.innerHTML = /*html*/`
      <div class="flex flex-col lg:flex-row gap-6 min-h-screen text-[#222] dark:text-gray-200 font-sans p-4">
        
        <aside class="w-full lg:w-64 bg-white dark:bg-slate-800 border border-[#aaa] dark:border-slate-600 shadow-sm p-4 h-fit rounded-sm">
            
            <button id="btn-back-home" class="flex items-center gap-2 text-gray-500 hover:text-[#0645ad] dark:text-gray-400 dark:hover:text-blue-300 font-bold text-sm mb-4 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Retour à l'accueil
            </button>

            <h2 class="font-serif font-bold text-xl mb-4 border-b border-[#aaa] dark:border-slate-600 pb-2">Mes Équipes</h2>
            
            <button id="btn-create-new" class="w-full mb-4 bg-[#cedff2] dark:bg-slate-700 hover:bg-white border border-[#aaa] dark:border-slate-500 py-2 text-sm font-bold text-[#0645ad] dark:text-blue-300 transition-colors">
                + Nouvelle Équipe
            </button>

            <ul class="space-y-2 max-h-80 overflow-y-auto">
                ${this._teams.length === 0 ? '<li class="text-xs italic text-gray-500">Aucune équipe.</li>' : ''}
                ${this._teams.map(t => `
                    <li class="team-item flex justify-between items-center p-2 border cursor-pointer group transition-colors ${this._currentTeam.id === t.id ? 'bg-[#e0e0e0] dark:bg-slate-700 border-[#0645ad]' : 'bg-[#f9f9f9] dark:bg-slate-900 border-[#ccc] hover:border-[#aaa]'}"
                        data-id="${t.id}">
                        <span class="font-bold text-sm truncate w-32 ${this._currentTeam.id === t.id ? 'text-[#0645ad] dark:text-blue-400' : ''}">${t.name}</span>
                        <button class="btn-delete-team text-gray-400 hover:text-red-600 font-bold px-2" data-id="${t.id}" title="Supprimer">×</button>
                    </li>
                `).join('')}
            </ul>
        </aside>

        <div class="flex-1">
            <div class="bg-white dark:bg-slate-800 p-4 border border-[#aaa] dark:border-slate-600 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-sm rounded-sm">
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <label class="font-bold text-sm">Nom de l'équipe :</label>
                    <input type="text" id="input-team-name" value="${this._currentTeam.name}" 
                           class="border border-[#aaa] dark:border-slate-600 p-1 px-2 font-serif text-lg bg-[#f9f9f9] dark:bg-slate-900 dark:text-white focus:border-[#0645ad] outline-none w-full md:w-64">
                </div>
                <button id="btn-save" class="bg-[#e0e0e0] dark:bg-slate-700 hover:bg-green-100 dark:hover:bg-green-900/30 border border-[#aaa] dark:border-slate-500 px-4 py-2 font-bold text-green-700 dark:text-green-400 transition-colors rounded-sm shadow-sm">
                    💾 Sauvegarder
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                ${this._currentTeam.members.map((member, i) => this.renderSlot(member, i)).join('')}
            </div>

            <div id="analysis-container" class="bg-white dark:bg-slate-800 border border-[#aaa] dark:border-slate-600 p-4 shadow-sm rounded-sm">
                <h3 class="font-serif font-bold text-xl mb-4 border-b border-[#aaa] dark:border-slate-600 pb-2">
                    Couverture Défensive
                </h3>
                <div id="analysis-content" class="text-center text-gray-500 italic">
                    Ajoutez des Pokémon pour voir l'analyse.
                </div>
            </div>
        </div>
      </div>
    `;

    this.addEventListeners();
    this.updateAnalysis();
  }

  private renderSlot(member: TeamMember | null, index: number) {
    // Slot Vide (Afficher input recherche)
    if (!member) {
        return /*html*/`
            <div class="h-40 bg-[#f9f9f9] dark:bg-slate-900 border-2 border-dashed border-[#ccc] dark:border-slate-600 flex flex-col items-center justify-center gap-2 hover:bg-[#e0e0e0] dark:hover:bg-slate-800 transition-colors relative rounded-md group">
                <span class="text-gray-400 group-hover:text-gray-500 font-bold text-3xl select-none">+</span>
                <span class="text-gray-500 text-xs uppercase font-bold">Slot ${index + 1}</span>
                
                <div class="relative w-3/4">
                    <input type="text" 
                           class="input-search-pokemon w-full mt-2 text-xs p-2 border border-[#aaa] dark:border-slate-600 text-center dark:bg-slate-700 dark:text-white rounded-sm focus:border-[#0645ad] outline-none"
                           placeholder="Chercher un Pokémon..." 
                           data-index="${index}">
                    
                    <div class="search-results-list absolute top-full left-0 w-full bg-white dark:bg-slate-800 border border-[#aaa] z-20 hidden max-h-48 overflow-y-auto shadow-xl text-sm rounded-b-sm" 
                         id="results-${index}">
                    </div>
                </div>
            </div>
        `;
    }

    // Slot Rempli (Afficher Pokémon)
    const typesHtml = member.types.map(t => `
        <span class="${TYPE_COLORS[t.type.name] || 'bg-gray-500'} text-white px-2 py-0.5 text-[10px] font-bold uppercase rounded shadow-sm border border-black/10">${t.type.name}</span>
    `).join(' ');

    return /*html*/`
        <div class="relative bg-white dark:bg-slate-800 border border-[#aaa] dark:border-slate-600 p-3 flex items-center gap-4 shadow-sm h-40 rounded-md hover:shadow-md transition-shadow">
            <button class="btn-remove-member absolute top-2 right-2 text-gray-400 hover:text-red-500 font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" 
                    data-index="${index}" title="Retirer">×</button>
            
            <img src="${member.sprites.front_default}" class="w-24 h-24 object-contain rendering-pixelated bg-[#f0f0f0] dark:bg-slate-700 rounded-full border border-[#ccc] dark:border-slate-600" alt="${member.name}">
            
            <div class="flex flex-col gap-1 overflow-hidden">
                <span class="text-xs text-gray-500 font-mono">#${String(member.id).padStart(4, '0')}</span>
                <span class="font-bold text-lg capitalize text-[#0645ad] dark:text-blue-400 cursor-pointer hover:underline truncate"
                      onclick="globalThis.location.hash = '/pokemon/${member.id}'">
                    ${member.name}
                </span>
                <div class="flex gap-1 mt-1 flex-wrap">${typesHtml}</div>
            </div>
        </div>
    `;
  }

  // --- Gestion des évenements ---

  private addEventListeners() {
    // --- Back to home ---
    this.querySelector("#btn-back-home")?.addEventListener("click", () => {
        globalThis.location.hash = "#"; // Retourne à l'accueil
    });
    
    this.querySelector("#btn-create-new")?.addEventListener("click", () => {
        this._currentTeam = this.createEmptyTeam();
        this.render();
    });
    
    this.querySelector("#btn-save")?.addEventListener("click", () => {
        const input = this.querySelector("#input-team-name") as HTMLInputElement;
        this._currentTeam.name = input.value || "Sans nom";
        this.saveCurrentTeam();
    });

    this.querySelectorAll(".team-item").forEach(item => {
        item.addEventListener("click", (e) => {
            if ((e.target as HTMLElement).closest(".btn-delete-team")) return;
            const id = item.getAttribute("data-id");
            if(id) this.loadTeam(id);
        });
    });

    this.querySelectorAll(".btn-delete-team").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = btn.getAttribute("data-id");
            if(id) this.deleteTeam(id);
        });
    });

    this.querySelectorAll(".btn-remove-member").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = Number(btn.getAttribute("data-index"));
            this.removePokemon(idx);
        });
    });

    this.querySelectorAll(".input-search-pokemon").forEach(input => {
        input.addEventListener("input", (e: any) => {
            const val = e.target.value.toLowerCase().trim();
            const idx = e.target.dataset.index;
            const listContainer = this.querySelector(`#results-${idx}`) as HTMLElement;

            if (val.length < 2) {
                listContainer.classList.add("hidden");
                return;
            }

            const matches = this._searchCache.filter(p => p.name.includes(val)).slice(0, 10);
            
            if (matches.length > 0) {
                listContainer.innerHTML = matches.map(m => `
                    <div class="result-item p-2 hover:bg-[#cedff2] dark:hover:bg-slate-600 cursor-pointer border-b border-gray-100 dark:border-slate-700 flex justify-between capitalize text-black dark:text-white"
                         data-url="${m.url}" data-index="${idx}">
                        <span>${m.name}</span>
                    </div>
                `).join('');
                listContainer.classList.remove("hidden");

                listContainer.querySelectorAll(".result-item").forEach(res => {
                    res.addEventListener("click", () => {
                        const url = res.getAttribute("data-url");
                        const index = Number(res.getAttribute("data-index"));
                        if (url) this.addPokemon(url, index);
                    });
                });
            } else {
                listContainer.innerHTML = `<div class="p-2 text-gray-500 text-xs italic">Aucun résultat</div>`;
                listContainer.classList.remove("hidden");
            }
        });

        input.addEventListener("blur", () => {
            setTimeout(() => {
                const idx = input.getAttribute("data-index");
                const list = this.querySelector(`#results-${idx}`);
                list?.classList.add("hidden");
            }, 200);
        });
    });
  }

  // --- Analyse de Type ---

  private async updateAnalysis() {
    const container = this.querySelector("#analysis-content");
    if (!container) return;

    const activeMembers = this._currentTeam.members.filter((m): m is TeamMember => m !== null);
    
    if (activeMembers.length === 0) {
        container.innerHTML = `<div class="py-8 text-gray-400 dark:text-gray-500 italic text-center">Ajoutez au moins un Pokémon pour voir ses faiblesses.</div>`;
        return;
    }

    container.innerHTML = `<div class="text-sm italic py-4 animate-pulse">Calcul des résistances en cours...</div>`;

    const typeScore: { [key: string]: { weak: number; resist: number; immune: number } } = {};
    const allTypes = Object.keys(TYPE_COLORS);
    allTypes.forEach(t => typeScore[t] = { weak: 0, resist: 0, immune: 0 });

    for (const member of activeMembers) {
        const memberWeaknesses: { [key: string]: number } = {};
        allTypes.forEach(t => memberWeaknesses[t] = 1);

        for (const t of member.types) {
            const typeName = t.type.name;
            if (!TYPE_RELATIONS_CACHE[typeName]) {
                const res = await fetch(t.type.url);
                TYPE_RELATIONS_CACHE[typeName] = await res.json();
            }
            const rel = TYPE_RELATIONS_CACHE[typeName].damage_relations;
            rel.double_damage_from.forEach((x: any) => memberWeaknesses[x.name] *= 2);
            rel.half_damage_from.forEach((x: any) => memberWeaknesses[x.name] *= 0.5);
            rel.no_damage_from.forEach((x: any) => memberWeaknesses[x.name] *= 0);
        }

        for (const [type, multiplier] of Object.entries(memberWeaknesses)) {
            if (multiplier > 1) typeScore[type].weak++;
            if (multiplier < 1 && multiplier > 0) typeScore[type].resist++;
            if (multiplier === 0) typeScore[type].immune++;
        }
    }

    // Render Tableaux
    const mid = Math.ceil(allTypes.length / 2);
    const col1 = allTypes.slice(0, mid);
    const col2 = allTypes.slice(mid);

    const renderRow = (type: string) => {
        const s = typeScore[type];
        // 3+ Pokemon faiblesse
        const rowClass = s.weak >= 3 ? "bg-red-100 dark:bg-red-900/40" : "";
        
        return /*html*/`
            <tr class="border-b border-[#eee] dark:border-slate-700 ${rowClass} last:border-0">
                <td class="p-1.5 w-28">
                    <span class="${TYPE_COLORS[type]} text-white px-2 py-0.5 text-[10px] font-bold uppercase rounded w-full block text-center shadow-sm" style="text-shadow: 1px 1px 0 #000;">${type}</span>
                </td>
                <td class="p-1.5 text-center font-bold text-sm ${s.weak > 0 ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 'text-gray-300 dark:text-gray-600'}">${s.weak || '-'}</td>
                <td class="p-1.5 text-center font-bold text-sm ${s.resist > 0 ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-300 dark:text-gray-600'}">${s.resist || '-'}</td>
                <td class="p-1.5 text-center font-bold text-sm ${s.immune > 0 ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-300 dark:text-gray-600'}">${s.immune || '-'}</td>
            </tr>
        `;
    };

    const tableHeader = /*html*/`
        <thead class="bg-[#cedff2] dark:bg-slate-700 text-xs uppercase text-gray-700 dark:text-gray-200">
            <tr>
                <th class="p-2 text-left">Type</th>
                <th class="p-2 text-center" title="Faiblesse">Faib.</th>
                <th class="p-2 text-center" title="Résistance">Rés.</th>
                <th class="p-2 text-center" title="Immunité">Imm.</th>
            </tr>
        </thead>
    `;

    container.innerHTML = /*html*/`
        <div class="flex flex-col lg:flex-row gap-6">
            <table class="w-full bg-white dark:bg-slate-900 border border-[#aaa] dark:border-slate-700 rounded-sm overflow-hidden">
                ${tableHeader}
                <tbody>${col1.map(renderRow).join('')}</tbody>
            </table>
            <table class="w-full bg-white dark:bg-slate-900 border border-[#aaa] dark:border-slate-700 rounded-sm overflow-hidden">
                ${tableHeader}
                <tbody>${col2.map(renderRow).join('')}</tbody>
            </table>
        </div>
        <div class="mt-3 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-4 justify-center">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Faiblesse (x2, x4)</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> Résistance (x0.5, x0.25)</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-500"></span> Immunité (x0)</span>
        </div>
    `;
  }
}

customElements.define("team-builder", TeamBuilder);