import "./assets/styles.css";
import {
  getPokemonList,
  initAllPokemon,
} from "./service/pokemonApi.ts";
import { PokemonCard } from "./components/pokemonCard.ts";
import { PaginationPokemon } from "./components/paginationPokemon.ts";
import "./components/pokemonEvolution.ts";
import "./components/pokemonDetails.ts";
import {
  abilitySelector,
  generationSelector,
  typesSelector,
  updateFilter,
} from "./utils/pokemonFilter.ts";

// #region     --------------       Init Pokémon List & Data        ----------------

const pokemon = await initAllPokemon();
const fullList = pokemon?.results || [];
let currentList = [...fullList];
let limit = 20;
let index = 0;

// #endregion

// #region   ---------------       Struct Website        ----------------

document.querySelector<HTMLDivElement>("#app")!.innerHTML = /*html*/ `
  <div id="view-home" class="min-h-screen">
    
    <header class="sticky top-0 z-50 shadow-md transition-colors duration-300">
        
        <div class="bg-white dark:bg-slate-800 border-b border-[#a7d7f9] dark:border-slate-700 px-4 py-3 transition-colors">
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                
                <div class="flex items-center gap-2 cursor-pointer group" onclick="window.location.hash='#'">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" class="w-8 h-8" alt="Logo">
                    <h1 class="text-2xl font-serif font-bold text-[#222] dark:text-white tracking-wide group-hover:text-[#0645ad] dark:group-hover:text-blue-400 transition-colors">
                        Poke Next
                    </h1>
                </div>

                <div class="flex items-center gap-3 w-full md:w-auto">
                    <search class="relative w-full md:w-64">
                        <input id="search" 
                               placeholder="Rechercher..." 
                               class="w-full border border-[#aaa] dark:border-slate-600 px-2 py-1 text-sm outline-none focus:border-[#0645ad] dark:focus:border-blue-400 focus:ring-1 focus:ring-[#0645ad] placeholder-gray-500 bg-[#f9f9f9] dark:bg-slate-700 dark:text-white transition-colors">
                        <button class="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-[#0645ad] dark:hover:text-blue-300">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>
                    </search>

                    <button id="theme-toggle" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-yellow-400 border border-transparent dark:border-slate-600">
                        <svg id="theme-toggle-light-icon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                        <svg id="theme-toggle-dark-icon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                    </button>

                    <button class="bg-[#f0f0f0] dark:bg-slate-700 border border-[#aaa] dark:border-slate-500 px-3 py-1 text-sm font-bold text-[#0645ad] dark:text-blue-300 hover:bg-white dark:hover:bg-slate-600 transition-all whitespace-nowrap" 
                            onclick="window.location.hash ='/party-create'">
                        + Équipe
                    </button>
                </div>
            </div>
        </div>

        <div class="bg-[#cedff2] dark:bg-slate-900 border-b border-[#a7d7f9] dark:border-slate-700 px-4 py-2 transition-colors">
            <div class="max-w-7xl mx-auto">
                <nav class="flex flex-wrap gap-2 items-center justify-center md:justify-start">
                    <span class="text-xs font-bold text-[#0645ad] dark:text-blue-400 uppercase mr-2">Filtres :</span>
                    
                    <select id="types" class="bg-white dark:bg-slate-800 border border-[#aaa] dark:border-slate-600 text-sm px-2 py-1 cursor-pointer hover:border-[#0645ad] focus:outline-none text-[#222] dark:text-gray-200">
                        <option value="all">Tous les Types</option>
                    </select>

                    <select id="generations" class="bg-white dark:bg-slate-800 border border-[#aaa] dark:border-slate-600 text-sm px-2 py-1 cursor-pointer hover:border-[#0645ad] focus:outline-none text-[#222] dark:text-gray-200">
                        <option value="all">Toutes Générations</option>
                    </select>

                    <select id="ability" class="bg-white dark:bg-slate-800 border border-[#aaa] dark:border-slate-600 text-sm px-2 py-1 cursor-pointer hover:border-[#0645ad] focus:outline-none text-[#222] dark:text-gray-200 max-w-[150px] truncate">
                        <option value="all">Tous Talents</option>
                    </select>
                </nav>
            </div>
        </div>

    </header>

    <main class="max-w-7xl mx-auto p-4">
        <pagination-pokemon class="flex justify-center mb-6"></pagination-pokemon>
        
        <pokemon-card class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
        </pokemon-card>
    </main>
  </div>

  <div id="view-details" class="hidden">
      <pokemon-details></pokemon-details>
  </div>

  <div id="party-create" class="hidden">
      <div class="text-center mt-10 dark:text-white">Page de création d'équipe</div>
  </div>
`;

// #endregion

// #region  -----------              Get Pagination & Pokémon Card ID          ----------------

const pagination = document.querySelector(
  "pagination-pokemon",
) as PaginationPokemon;
const card = document.querySelector("pokemon-card") as PokemonCard;
const search = document.querySelector<HTMLInputElement>("#search");

// #endregion

// #region   -----------             Get Select Data           ----------------

await typesSelector(currentList, fullList, index, limit);
await generationSelector(currentList, fullList, index, limit);
await abilitySelector(currentList, fullList, index, limit);

//#endregion

// #region   -----------            Get Pokémon List & Render It           ---------------

const pokemonList = await getPokemonList(currentList, index, limit);
card.data = pokemonList;

// #endregion

// Dans main.ts
pagination.total = currentList.length; // Important pour l'init
pagination.currentList = currentList; // Pour que la pagination connaisse la liste

// #region    ----------           Get Détails & Home ID       ------------

const viewHome = document.getElementById("view-home") as HTMLDivElement;
const viewDetails = document.getElementById("view-details") as HTMLDivElement;
const partyCreate = document.getElementById("party-create") as HTMLDivElement;
const pokemonDetails = document.querySelector("pokemon-details") as HTMLElement; // Selecteur du nouveau composant

// #endregion

// #region    ----------        Function to Render Create Teams Pokémon       ------------

async function displayCreate() {
  partyCreate.innerHTML = /*html*/ `
    <div class ="justify-self-center">
      <a href="#" class="flex gap-2 text-white text-lg font-bold hover:text-blue-300 transition-colors bg-gray-800/50 px-4 py-2 rounded-full">
                      <h1>
      </a>
      <p>Bonjour</p>
    </div>
    `;
}

// #endregion

// #region   ------------         Function to Render Pokémon Détails      --------------



// #endregion

// #region   ------------        Function to Detect Route Path         ----------------

async function router() {
  const hash = globalThis.location.hash;
  if (!hash) {
    history.replaceState(null, "", "#");
  }

  // ROUTE 1 : CRÉATION D'ÉQUIPE
  if (hash.startsWith("#/party-create")) {
    partyCreate.classList.remove("hidden");
    viewDetails.classList.add("hidden");
    viewHome.classList.add("hidden");
    await displayCreate();
  }

  // ROUTE 2 : DÉTAIL POKÉMON
  else if (hash.startsWith("#/pokemon/")) {
    const idString = hash.split("/")[2];
    const id = Number(idString);

    if (!Number.isNaN(id)) {
      viewHome.classList.add("hidden");
      partyCreate.classList.add("hidden");
      viewDetails.classList.remove("hidden");

      // LOGIQUE DE NAVIGATION PRÉCÉDENT / SUIVANT
      const currentIndex = currentList.findIndex((item) => {
        const urlId = Number(item.url.split("/").at(-2));
        return urlId === id;
      });

      let prevId = null;
      let nextId = null;
      if (currentIndex !== -1) {
        if (currentIndex > 0) {
          prevId = Number(currentList[currentIndex - 1].url.split("/").at(-2));
        }
        if (currentIndex < currentList.length - 1) {
          nextId = Number(currentList[currentIndex + 1].url.split("/").at(-2));
        }
      }

      pokemonDetails.setAttribute("pokemon-id", String(id));
      pokemonDetails.setAttribute("prev-id", String(prevId));
      pokemonDetails.setAttribute("next-id", String(nextId));
    }
  }

  // ROUTE 3 : ACCUEIL (Défaut)
  else {
    viewHome.classList.remove("hidden");
    viewDetails.classList.add("hidden");
    partyCreate.classList.add("hidden");

    window.scrollTo(0, 0);
    if (card.innerHTML.trim() === "") {
      card.data = await getPokemonList(currentList, index, limit);
    }
  }
}

// #endregion

//  #region    ----------------        Event Pagination & Route Path           ----------------

globalThis.addEventListener("hashchange", router);
await router();

pagination.addEventListener("page-changed", async (e: any) => {
  const { offset, limit, currentList } = e.detail;
  card.data = await getPokemonList(currentList, offset, limit);
});

// #endregion

// #region     ---------------        Update Filter by Search Input         ---------------

if (search) {
  search.addEventListener("input", () => {
    return updateFilter(currentList, fullList, index, limit);
  });
}

// #endregion
