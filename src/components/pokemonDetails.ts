import { getPokemon } from "../service/pokemonApi.ts";

// Couleurs officielles des Types
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

// Interface pour la recherche
interface SimplePokemon {
    name: string;
    id: number;
}

export class PokemonDetails extends HTMLElement {
  // Cache statique pour éviter de recharger la liste de recherche à chaque navigation
  static allPokemonCache: SimplePokemon[] = [];

  static get observedAttributes() {
    return ["pokemon-id", "prev-id", "next-id"];
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === "pokemon-id" && newValue) {
      this.render(Number(newValue));
    }
  }

  // Initialisation de la liste pour l'autocomplétion (une seule fois)
  private async initSearchData() {
      if (PokemonDetails.allPokemonCache.length > 0) return;
      
      try {
          // On récupère une grande liste légère (juste nom et url)
          const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
          const data = await res.json();
          PokemonDetails.allPokemonCache = data.results.map((p: any) => {
              const parts = p.url.split('/');
              return {
                  name: p.name,
                  id: Number(parts[parts.length - 2])
              };
          });
      } catch (e) {
          console.error("Erreur chargement recherche", e);
      }
  }

  // Méthode utilitaire pour générer les lignes du tableau (Wiki + Dark Mode)
  private renderInfoRow(title: string, data: any[]) {
    return `
        <tr class="bg-[#cedff2] dark:bg-slate-800">
            <th colspan="2" class="p-1 border-b border-[#aaa] dark:border-slate-700 border-t border-[#aaa] text-center text-xs uppercase dark:text-gray-200">
                ${title}
            </th>
        </tr>
        ${data.map(d => `
            <tr>
                <td class="p-1 border border-[#aaa] dark:border-slate-700 bg-[#e0e0e0] dark:bg-slate-800 font-bold dark:text-gray-300 w-1/3">
                    ${d.label}
                </td>
                <td class="p-1 border border-[#aaa] dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-gray-100 ${d.capitalize ? 'capitalize' : ''}">
                    ${d.value}
                </td>
            </tr>
        `).join('')}
    `;
  }

  private async render(id: number) {
    // Lancer le chargement des données de recherche en arrière-plan
    this.initSearchData();

    this.innerHTML = `<div class="text-gray-600 text-center mt-10 font-serif">Chargement de l'article...</div>`;

    const p = await getPokemon(id);
    if (!p) {
      this.innerHTML = `<div class="text-red-600 text-center font-bold">Article introuvable.</div>`;
      return;
    }

    const prevId = this.getAttribute("prev-id");
    const nextId = this.getAttribute("next-id");

    const [speciesData, typeDataList, abilityDataList] = await Promise.all([
      fetch(p.species.url).then(r => r.json()),
      Promise.all(p.types.map(t => fetch(t.type.url).then(r => r.json()))),
      Promise.all(p.abilities.map(a => fetch(a.ability.url).then(r => r.json()))),
    ]);

    const description = speciesData.flavor_text_entries.find((e: any) => e.language.name === "en")?.flavor_text.replace(/[\f\n]/g, ' ') || "Aucune description disponible.";
    const genus = speciesData.genera.find((g: any) => g.language.name === "en")?.genus || "Pokémon";
    
    let genderHtml = "Inconnu";
    if (speciesData.gender_rate === -1) {
       genderHtml = "Asexué";
    } else {
       const femalePct = (speciesData.gender_rate / 8) * 100;
       genderHtml = `<span style="color:blue">♂ ${(100 - femalePct)}%</span> / <span style="color:magenta">♀ ${femalePct}%</span>`;
    }

    // --- LOGIQUE METIER (Identique au précédent) ---
    const typeRelations: { [key: string]: number } = {};
    const typesList = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "steel", "dark", "fairy"];
    typesList.forEach(t => typeRelations[t] = 1);

    typeDataList.forEach((td: any) => {
      td.damage_relations.double_damage_from.forEach((t: any) => typeRelations[t.name] *= 2);
      td.damage_relations.half_damage_from.forEach((t: any) => typeRelations[t.name] *= 0.5);
      td.damage_relations.no_damage_from.forEach((t: any) => typeRelations[t.name] *= 0);
    });

    const weaknessesHtml = Object.entries(typeRelations)
      .filter(([_, val]) => val !== 1)
      .sort((a, b) => b[1] - a[1])
      .map(([type, val]) => {
        const style = TYPE_COLORS[type] || "bg-gray-400 border-gray-600";
        return `
        <div class="flex flex-col items-center p-1">
            <span class="${style} text-white text-[10px] font-bold px-2 py-0.5 rounded border shadow-sm uppercase w-16 text-center" style="text-shadow: 1px 1px 0 #000;">${type.substring(0,3)}</span>
            <span class="font-bold text-xs mt-1 ${val > 1 ? 'text-red-600' : 'text-green-600'}">× ${val}</span>
        </div>`;
      }).join("");

    const movesLevelUp = p.moves
      .filter((m) => m.version_group_details.some((d) => d.move_learn_method.name === "level-up"))
      .map((m) => ({ name: m.move.name, level: m.version_group_details.at(-1)?.level_learned_at }))
      .sort((a, b) => a.level - b.level);

    const movesTM = p.moves
      .filter((m) => m.version_group_details.some((d) => d.move_learn_method.name === "machine"))
      .map((m) => m.move.name).sort();

    const statsHtml = p.stats.map((s) => {
      const pct = (s.base_stat / 255) * 100;
      let barColor = "bg-red-600";
      if (s.base_stat >= 60) barColor = "bg-orange-500";
      if (s.base_stat >= 90) barColor = "bg-yellow-500";
      if (s.base_stat >= 110) barColor = "bg-green-600";
      if (s.base_stat >= 140) barColor = "bg-blue-500";

      return `
        <tr class="text-sm border-b border-gray-300 dark:border-slate-600 last:border-0">
            <td class="py-1 px-2 font-bold text-gray-600 w-32 dark:bg-slate-800 border-r dark:text-gray-200 border-gray-300 bg-[#f0f0f0]">${s.stat.name.replace('special-', 'Sp.').toLocaleUpperCase()}</td>
            <td class="py-1 px-2 font-bold text-black w-12 dark:text-gray-200 text-right">${s.base_stat}</td>
            <td class="py-1 px-2 w-full">
                <div class="h-3 w-full bg-gray-200 dark:bg-slate-800 dark:border-slate-600 border border-gray-400 rounded-sm">
                    <div class="${barColor} h-full" style="width: ${pct}%"></div>
                </div>
            </td>
        </tr>`;
    }).join("");


    // --- HTML  ---
    this.innerHTML = /*html*/ `
      <div class="bg-white dark:bg-slate-900 min-h-screen text-[#222] dark:text-gray-200 font-sans transition-colors duration-300">
        
        <header class="sticky top-0 z-50 shadow-md">
            <div class="bg-white dark:bg-slate-800 border-b border-[#a7d7f9] dark:border-slate-700 px-4 py-2 transition-colors">
                <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    
                    <div class="flex items-center gap-2 cursor-pointer group" onclick="window.location.hash='#'">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" class="w-8 h-8" alt="Logo">
                        <h1 class="text-2xl font-serif font-bold text-[#222] dark:text-white tracking-wide group-hover:text-[#0645ad] dark:group-hover:text-blue-400 transition-colors">
                            Poke Next
                        </h1>
                    </div>

                    <div class="flex items-center gap-3 w-full md:w-auto relative">
                        <div class="relative w-full md:w-80">
                            <input id="wiki-search" 
                                   type="text"
                                   placeholder="Rechercher un Pokémon..." 
                                   class="w-full border border-[#aaa] dark:border-slate-600 px-2 py-1 text-sm outline-none focus:border-[#0645ad] dark:focus:border-blue-400 focus:ring-1 bg-[#f9f9f9] dark:bg-slate-700 dark:text-white placeholder-gray-500">
                            
                            <div id="search-results" class="absolute top-full left-0 w-full bg-white dark:bg-slate-800 border border-[#aaa] dark:border-slate-600 shadow-lg max-h-60 overflow-y-auto hidden z-50">
                                </div>
                        </div>

                        <button class="bg-[#f0f0f0] dark:bg-slate-700 border border-[#aaa] dark:border-slate-600 px-3 py-1 text-sm font-bold text-[#0645ad] dark:text-blue-300 hover:bg-white dark:hover:bg-slate-600 transition-all whitespace-nowrap" 
                                onclick="window.location.hash ='/party-create'">
                            Créer Équipe
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="bg-[#cedff2] dark:bg-slate-900 border-b border-[#a7d7f9] dark:border-slate-700 px-4 py-1 h-6"></div>
        </header>

        <div class="max-w-7xl mx-auto p-4 md:p-6">

            <div class="flex justify-between items-center mb-4 text-sm font-sans border-b border-[#aaa] dark:border-slate-700 pb-2">
                <div class="flex-1">
                    ${prevId && prevId !== "null" ? `<a href="#/pokemon/${prevId}" class="text-[#0645ad] dark:text-blue-400 hover:underline font-bold">◄ #${String(prevId).padStart(4, '0')} (Précédent)</a>` : ''}
                </div>
                <div class="flex-1 text-center font-bold text-gray-500 dark:text-gray-400">
                    #${String(p.id).padStart(4, '0')}
                </div>
                <div class="flex-1 text-right">
                    ${nextId && nextId !== "null" ? `<a href="#/pokemon/${nextId}" class="text-[#0645ad] dark:text-blue-400 hover:underline font-bold">(Suivant) #${String(nextId).padStart(4, '0')} ►</a>` : ''}
                </div>
            </div>

            <h1 class="text-3xl font-serif border-b border-[#aaa] dark:border-slate-700 pb-1 mb-6 text-black dark:text-white flex items-center justify-between">
                ${p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                <button id="btn-sound" class="text-sm font-sans font-normal bg-[#f9f9f9] dark:bg-slate-800 border border-[#aaa] dark:border-slate-600 px-2 py-1 rounded hover:bg-[#e0e0e0] dark:hover:bg-slate-700 cursor-pointer text-black dark:text-gray-200" title="Écouter le cri">
                    🔊 Cri
                </button>
            </h1>

            <div class="flex flex-col lg:flex-row gap-6">

                <div class="flex-1 order-2 lg:order-1 min-w-0">
                    
                    <p class="mb-4 leading-relaxed text-sm">
                        <b class="dark:text-white">${p.name.charAt(0).toUpperCase() + p.name.slice(1)}</b> (${genus}) est un Pokémon de type 
                        ${p.types.map(t => `<span class="font-bold lowercase dark:text-gray-300">${t.type.name}</span>`).join(' et ')}.
                    </p>
                    <div class="bg-[#fcfcfc] dark:bg-slate-800/50 border border-[#ccc] dark:border-slate-700 p-3 mb-6 text-sm italic text-gray-700 dark:text-gray-300">
                        « ${description} »
                    </div>

                    <div class="bg-[#f8f9fa] dark:bg-slate-800 border border-[#a2a9b1] dark:border-slate-600 inline-block p-3 mb-6 min-w-[200px]">
                        <div class="text-center font-bold text-sm mb-2 dark:text-white">Sommaire</div>
                        <ol class="list-decimal list-inside text-[#0645ad] dark:text-blue-400 text-xs space-y-1">
                            <li><span class="hover:underline cursor-pointer">Physionomie et attitudes</span></li>
                            <li><span class="hover:underline cursor-pointer">Famille d'évolution</span></li>
                            <li><span class="hover:underline cursor-pointer">Statistiques</span></li>
                            <li><span class="hover:underline cursor-pointer">Sensibilités</span></li>
                            <li><span class="hover:underline cursor-pointer">Capacités apprises</span></li>
                        </ol>
                    </div>

                    <h2 class="text-xl font-serif border-b border-[#aaa] dark:border-slate-700 mb-4 mt-2 dark:text-gray-100">Famille d'évolution</h2>
                    <div class="border border-[#aaa] dark:border-slate-700 bg-[#f9f9f9] dark:bg-slate-800 p-4 mb-6 overflow-x-auto flex justify-center">
                        <pokemon-evolution src="${p.species.url}"></pokemon-evolution>
                    </div>

                    <h2 class="text-xl font-serif border-b border-[#aaa] dark:border-slate-700 mb-4 dark:text-gray-100">Statistiques</h2>
                    <div class="mb-6">
                        <table class="w-full border-collapse border border-[#aaa] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                            <thead class="bg-[#cedff2] dark:bg-slate-800">
                                <tr>
                                    <th colspan="3" class="border border-[#aaa] dark:border-slate-700 py-2 text-center dark:text-gray-200">Statistiques de base</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${statsHtml}
                                <tr class="bg-[#e0e0e0] dark:bg-slate-800 font-bold">
                                    <td class="py-1 px-2 border-r border-[#aaa] dark:border-slate-700 border-t dark:text-gray-300">TOTAL</td>
                                    <td class="py-1 px-2 border-t border-[#aaa] dark:border-slate-700 text-right dark:text-gray-100">${p.stats.reduce((acc:number, s:any) => acc + s.base_stat, 0)}</td>
                                    <td class="border-t border-[#aaa] dark:border-slate-700"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 class="text-xl font-serif border-b border-[#aaa] dark:border-slate-700 mb-4 dark:text-gray-100">Sensibilités</h2>
                    <div class="border border-[#aaa] dark:border-slate-700 p-4 bg-white dark:bg-slate-900 mb-6">
                        <div class="flex flex-wrap gap-4 justify-center">
                            ${weaknessesHtml}
                        </div>
                    </div>

                    <h2 class="text-xl font-serif border-b border-[#aaa] dark:border-slate-700 mb-4 dark:text-gray-100">Capacités apprises</h2>
                    
                    <h3 class="font-bold text-sm mb-2 mt-4 dark:text-gray-300">Par montée de niveau</h3>
                    <div class="border border-[#aaa] dark:border-slate-700 mb-6">
                        <table class="w-full text-sm border-collapse bg-white dark:bg-slate-900">
                            <thead class="bg-[#cedff2] dark:bg-slate-800">
                                <tr>
                                    <th class="border border-[#aaa] dark:border-slate-700 py-2 w-16 dark:text-gray-200">Niveau</th>
                                    <th class="border border-[#aaa] dark:border-slate-700 py-2 text-left px-4 dark:text-gray-200">Capacité</th>
                                    <th class="border border-[#aaa] dark:border-slate-700 py-2 w-24 dark:text-gray-200">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${movesLevelUp.map((m, i) => `
                                    <tr class="${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-[#f5f5f5] dark:bg-slate-800'}">
                                        <td class="border border-[#aaa] dark:border-slate-700 py-1 text-center font-bold dark:text-gray-300">${m.level === 0 ? 'Départ' : m.level}</td>
                                        <td class="border border-[#aaa] dark:border-slate-700 py-1 px-4"><span class="text-[#0645ad] dark:text-blue-400 font-bold hover:underline cursor-pointer">${m.name.replace('-', ' ')}</span></td>
                                        <td class="border border-[#aaa] dark:border-slate-700 py-1 text-center text-xs text-gray-500">?</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <h3 class="font-bold text-sm mb-2 mt-4 dark:text-gray-300">Par CT / CS</h3>
                    <div class="border border-[#aaa] dark:border-slate-700 p-2 bg-[#f9f9f9] dark:bg-slate-800">
                        <div class="flex flex-wrap gap-2 text-xs">
                            ${movesTM.map((m, i) => `
                                <span class="px-2 py-1 bg-white dark:bg-slate-900 border border-[#ccc] dark:border-slate-600 rounded text-[#0645ad] dark:text-blue-400 hover:underline cursor-pointer">
                                    ${m.replace('-', ' ')}
                                </span>
                            `).join(' ')}
                        </div>
                    </div>
                </div>

                <div class="w-full lg:w-[320px] shrink-0 order-1 lg:order-2">
                    <table class="w-full border-collapse border border-[#aaa] dark:border-slate-700 bg-[#f9f9f9] dark:bg-slate-900 text-sm shadow-sm sticky top-20">
                        <thead>
                            <tr class="bg-[#cedff2] dark:bg-slate-800">
                                <th colspan="2" class="p-2 border-b border-[#aaa] dark:border-slate-700 text-center">
                                    <span class="text-xl font-serif dark:text-white">${p.name.charAt(0).toUpperCase() + p.name.slice(1)}</span><br>
                                    <span class="text-xs font-normal dark:text-gray-400">Nom anglais : ${p.name.charAt(0).toUpperCase() + p.name.slice(1)}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="2" class="text-center p-4 bg-white dark:bg-slate-900 border-b border-[#aaa] dark:border-slate-700">
                                    <img class="w-48 h-48 object-contain mx-auto rendering-pixelated" 
                                         src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png" 
                                         alt="${p.name}">
                                    <div class="text-xs text-gray-500 mt-2">Artwork officiel</div>
                                </td>
                            </tr>

                            <tr class="bg-[#cedff2] dark:bg-slate-800">
                                <th colspan="2" class="p-1 border-b border-[#aaa] dark:border-slate-700 border-t border-[#aaa] text-center text-xs uppercase dark:text-gray-200">Chromatique (Shiny)</th>
                            </tr>
                            <tr>
                                <td colspan="2" class="text-center p-4 bg-white dark:bg-slate-900 border-b border-[#aaa] dark:border-slate-700">
                                    <img class="w-40 h-40 object-contain mx-auto rendering-pixelated" 
                                         src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${p.id}.png" 
                                         alt="${p.name} Chromatique">
                                    <div class="text-xs text-gray-500 mt-2">✨ Version Chromatique</div>
                                </td>
                            </tr>
                            
                            ${this.renderInfoRow("Numéros de Pokédex", [
                                { label: "National", value: `#${String(p.id).padStart(4, '0')}` }
                            ])}

                            <tr class="bg-[#cedff2] dark:bg-slate-800">
                                <th colspan="2" class="p-1 border-b border-[#aaa] dark:border-slate-700 border-t border-[#aaa] text-center text-xs uppercase dark:text-gray-200">Types</th>
                            </tr>
                            <tr>
                                <td colspan="2" class="p-2 border border-[#aaa] dark:border-slate-700 text-center bg-white dark:bg-slate-900">
                                    <div class="flex justify-center gap-2">
                                         ${p.types.map(t => {
                                             const style = TYPE_COLORS[t.type.name] || "bg-gray-500 border-gray-700";
                                             return `<span class="${style} text-white px-2 py-0.5 rounded border text-[10px] font-bold uppercase shadow-sm" style="text-shadow:1px 1px 0 #000">${t.type.name}</span>`;
                                         }).join('')}
                                    </div>
                                </td>
                            </tr>

                            ${this.renderInfoRow("Physionomie", [
                                { label: "Taille", value: `${p.height / 10} m` },
                                { label: "Poids", value: `${p.weight / 10} kg` }
                            ])}

                            ${this.renderInfoRow("Élevage", [
                                { label: "Groupe", value: speciesData.egg_groups.map((g: any) => g.name).join(', '), capitalize: true },
                                { label: "Sexe", value: genderHtml },
                                { label: "Oeuf", value: "~ 2560 pas" }
                            ])}

                            ${this.renderInfoRow("Capture", [
                                { label: "Taux", value: speciesData.capture_rate },
                                { label: "Exp.", value: p.base_experience }
                            ])}

                            <tr class="bg-[#cedff2] dark:bg-slate-800">
                                <th colspan="2" class="p-1 border-b border-[#aaa] dark:border-slate-700 border-t border-[#aaa] text-center text-xs uppercase dark:text-gray-200">Talents</th>
                            </tr>
                            ${abilityDataList.map((ad: any, i: number) => `
                                <tr>
                                    <td colspan="2" class="p-2 border border-[#aaa] dark:border-slate-700 bg-white dark:bg-slate-900 text-center">
                                        <span class="text-[#0645ad] dark:text-blue-400 font-bold cursor-pointer hover:underline capitalize">${p.abilities[i].ability.name.replace('-', ' ')}</span>
                                        ${p.abilities[i].is_hidden ? '<span class="text-[10px] text-gray-500 italic">(Talent Caché)</span>' : ''}
                                        <div class="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight text-left pl-2 border-l-2 border-[#cedff2] dark:border-slate-600 mx-2">
                                            ${ad.effect_entries.find((e: any) => e.language.name === "en")?.short_effect ?? "..."}
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}

                        </tbody>
                    </table>
                </div>

            </div>
        </div>
      </div>
    `;

    // --- EVENTS ET LOGIQUE DE RECHERCHE ---
    
    // 1. Audio
    const btnSound = this.querySelector("#btn-sound");
    if (btnSound && p.cries.latest) {
      btnSound.addEventListener("click", () => new Audio(p.cries.latest).play().catch(console.error));
    }

    // 2. Recherche Autocomplete
    const searchInput = this.querySelector("#wiki-search") as HTMLInputElement;
    const resultsContainer = this.querySelector("#search-results") as HTMLElement;

    if (searchInput && resultsContainer) {
        searchInput.addEventListener("input", (e: any) => {
            const term = e.target.value.toLowerCase().trim();
            
            if (term.length < 2) {
                resultsContainer.classList.add("hidden");
                return;
            }

            // Filtrage simple (Nom ou ID)
            const matches = PokemonDetails.allPokemonCache.filter(p => 
                p.name.toLowerCase().includes(term) || String(p.id).includes(term)
            ).slice(0, 10); // Limite à 10 résultats pour la perf

            if (matches.length > 0) {
                resultsContainer.innerHTML = matches.map(m => `
                    <div class="p-2 hover:bg-[#cedff2] cursor-pointer border-b border-gray-100 flex justify-between items-center text-sm"
                         data-id="${m.id}">
                        <span class="capitalize font-bold text-[#0645ad]">${m.name}</span>
                        <span class="text-gray-400 text-xs">#${String(m.id).padStart(4, '0')}</span>
                    </div>
                `).join('');
                resultsContainer.classList.remove("hidden");

                // Ajout des events de clic sur les résultats
                resultsContainer.querySelectorAll("div").forEach(div => {
                    div.addEventListener("click", () => {
                        const targetId = div.getAttribute("data-id");
                        window.location.hash = `/pokemon/${targetId}`;
                        resultsContainer.classList.add("hidden");
                        searchInput.value = ""; // Reset champ
                    });
                });
            } else {
                resultsContainer.innerHTML = `<div class="p-2 text-gray-500 italic text-sm">Aucun résultat</div>`;
                resultsContainer.classList.remove("hidden");
            }
        });

        // Fermer si on clique ailleurs
        document.addEventListener("click", (e: any) => {
            if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.classList.add("hidden");
            }
        });
    }
  }
}

customElements.define("pokemon-details", PokemonDetails);