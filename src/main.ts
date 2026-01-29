import './assets/styles.css'
import {
    getPokemon,
    getPokemonList,
    initAllPokemon
} from './service/pokemonApi.ts'
import {PokemonCard} from './components/pokemonCard.ts'
import {PaginationPokemon} from "./components/paginationPokemon.ts";
import "./components/pokemonEvolution.ts";
import {abilitySelector, generationSelector, typesSelector, updateFilter} from "./utils/pokemonFilter.ts";

// #region     --------------       Init Pokémon List & Data        ----------------

const pokemon = await initAllPokemon()
const fullList = pokemon?.results || []
let currentList = [...fullList]
let limit = 20
let index = 0

// #endregion

// #region   ---------------        Struct Website         ----------------

document.querySelector<HTMLDivElement>('#app')!.innerHTML = /*html*/ `
  <div id="view-home">
  <header class = "grid grid-cols-1 md:grid-cols-5 justify-center text-center p-2 bg-black/10 sticky">
    <nav class ="justify-self-start rounded-xl">
        <select id="types" class ="bg-gray-500/20 p-2 text-white">
            <option class ="bg-gray-800" value="all">Types</option>
        </select>
        <select id="generations" class ="bg-gray-500/20 text-white p-2">
            <option class="bg-gray-800" value="all">Generation</option>
        </select>
        <select id="ability" class ="bg-gray-500/20 text-white p-2">
            <option class ="bg-gray-800" value="all">Abilities</option>
        </select>
    </nav>
    <div></div>
    <h1 class = "text-blue-300 text-2xl font-extrabold uppercase tracking-widest animate-pulse">Poke Next</h1>
    <button class ="bg-gray-800 hover:scale-110 active:scale-95 text-white " onclick="window.location.hash ='/party-create'">Créer une équipe</button>
    <search class = "bg-gray-600/50 rounded-3xl justify-center md:justify-self-end">
        <input id="search" placeholder="Pokemon... (Name ou #ID)" class = "outline-none w-full pl-2.5 pr-2.5 pt-1 caret-[#ffffff] text-white ">
    </search>
  </header>
  <main>
        <pagination-pokemon class="flex justify-center gap-4 mt-8">
<!--        Pagination-->
        </pagination-pokemon>
        <pokemon-card class ="grid grid-cols-2 md:grid-cols-3 justify-self-center">
<!--        Pokémon list--> 
        </pokemon-card>
  </main>
</div>

<div id="view-details" class="hidden">
</div>

<div id="party-create" class="hidden">
</div>
`

// #endregion

// #region  -----------              Get Pagination & Pokémon Card ID          ----------------

const pagination = document.querySelector('pagination-pokemon') as PaginationPokemon
const card = document.querySelector('pokemon-card') as PokemonCard
const search = document.querySelector<HTMLInputElement>('#search')

// #endregion

// #region   -----------             Get Select Data           ----------------

await typesSelector(currentList,fullList, index, limit)
await generationSelector(currentList,fullList, index, limit)
await abilitySelector(currentList,fullList, index, limit)

//#endregion

// #region   -----------            Get Pokémon List & Render It           ---------------

const pokemonList = await getPokemonList(currentList,index, limit)
card.data = pokemonList

// #endregion

// #region    ----------           Get Détails & Home ID       ------------

const viewHome = document.getElementById('view-home') as HTMLDivElement;
const viewDetails = document.getElementById('view-details') as HTMLDivElement;
const partyCreate = document.getElementById('party-create') as HTMLDivElement;

// #endregion

// #region Function to Render Create Teams Pokémon

async function displayCreate() {
    partyCreate.innerHTML = /*html*/`
    <p>Bonjour</p>
    `


    
}

// #endregion

// #region   ------------         Function to Render Pokémon Détails

async function renderPokemonDetails(id: number) {
    const p = await getPokemon(id);
    if(!p) return;

    const currentIndex = currentList.findIndex(pokemonItem => {
        const urlId = Number(pokemonItem.url.split('/').at(-2));
        return urlId === id;
    });

    let prevId = null;
    let nextId = null;
    if (currentIndex !== -1) {
        if (currentIndex > 0) {
            const prevPokemon = currentList[currentIndex - 1];
            prevId = Number(prevPokemon.url.split('/').at(-2));
        }
        if (currentIndex < currentList.length - 1) {
            const nextPokemon = currentList[currentIndex + 1];
            nextId = Number(nextPokemon.url.split('/').at(-2));
        }
    }
    const cryUrl = p.cries.latest;
    const typesHtml = p.types.map(t => /*html*/ `<span class="bg-gray-700 px-3 py-1 rounded-full text-sm">${t.type.name}</span>`).join('');
    const statsHtml = p.stats.map(s => /*html*/ `
        <div class="flex justify-between">
            <span class="uppercase text-gray-400">${s.stat.name}:</span>
            <span class="text-white font-bold">${s.base_stat}</span>
        </div>
    `).join('');

    const html = /*html*/ `
        <div class="max-w-5xl mx-auto p-4">
            <nav id="btn-nav" class="flex justify-between items-center mb-6">
                <a href="#" class="flex items-center gap-2 text-white text-lg font-bold hover:text-blue-300 transition-colors bg-gray-800/50 px-4 py-2 rounded-full">
                    <span>←</span> Liste
                </a>
<!---       ------------        Button Nav Next & Previous         ------------        --->
                <div class="flex gap-4">
                    ${prevId ? `
                    <a href="#/pokemon/${prevId}" class="flex items-center gap-2 text-white font-bold hover:text-blue-300 transition-colors bg-gray-800/50 px-4 py-2 rounded-full">
                        <span>❮</span> <span class="hidden sm:inline">Précédent</span>
                    </a>` : '<div></div>'}
                    
                    ${nextId ? `
                    <a href="#/pokemon/${nextId}" class="flex items-center gap-2 text-white font-bold hover:text-blue-300 transition-colors bg-gray-800/50 px-4 py-2 rounded-full">
                        <span class="hidden sm:inline">Suivant</span> <span>❯</span>
                    </a>` : ''}
                </div>
            </nav>
<!---       ------------        Name & Sprites Pokémon         ------------        --->
            <div class="flex flex-col items-center mt-4 text-white animate-fade-in">
                <div class="flex items-center gap-4 mb-4">
                    <h2 class="text-4xl md:text-5xl font-extrabold uppercase text-transparent bg-clip-text bg-linear-to-r from-blue-300 to-purple-400 drop-shadow-sm">
                        ${p.name}
                    </h2>
                    <button id="btn-sound" class="bg-gray-700 hover:bg-blue-500 text-white p-3 rounded-full transition-all active:scale-95 shadow-lg" title="Play Cry">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>
                    </button>
                </div>
                
                <div class="relative group">
                    <div class="absolute inset-0 bg-linear-to-tr from-blue-500/30 to-purple-500/30 blur-3xl rounded-full group-hover:bg-blue-500/40 transition-all duration-500"></div>
                    <img class="relative w-72 h-72 md:w-96 md:h-96 z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png" alt="${p.name}">
                </div>
                
                <div class="flex flex-wrap justify-center gap-3 mt-8 mb-10 uppercase">
                    ${typesHtml}
                </div>
<!---       ------------       Information General Pokémon          ------------        --->
                <div class="grid md:grid-cols-2 gap-6 w-full max-w-5xl ">
                    <div class="bg-gray-800/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-700/50 shadow-xl">
                        <h3 class="text-xl font-bold text-yellow-300 mb-6 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0 1 18 0z"></path></svg>
                            Informations
                        </h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-gray-700/30 p-4 rounded-xl text-center">
                                <p class="text-gray-400 text-sm uppercase">Height</p>
                                <p class="text-2xl font-bold">${p.height / 10} m</p>
                            </div>
                            <div class="bg-gray-700/30 p-4 rounded-xl text-center">
                                <p class="text-gray-400 text-sm uppercase">Weight</p>
                                <p class="text-2xl font-bold">${p.weight / 10} kg</p>
                            </div>
                        </div>
                    </div>
<!---       ------------        Stats Base Pokémon         ------------        --->
                    <div class="bg-gray-800/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-700/50 shadow-xl">
                         <h3 class="text-xl font-bold text-yellow-300 mb-6 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            Stats Base
                         </h3>
                         <div class="space-y-3">
                            ${statsHtml}
                         </div>
                    </div>
<!---       ------------        Evolution Chain Pokémon         ------------        --->
                    <div class="bg-gray-700 rounded-3xl p-6">
                        <h3 class="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            Evolution Chain
                        </h3>
                        
                        <pokemon-evolution src="${p.species.url}"></pokemon-evolution>
                    
                    </div>
                </div>
            </div>
        `;

    const existingContent = viewDetails.querySelector('.pokemon-content');
    if(existingContent) existingContent.remove();

    const contentDiv = document.createElement('div');
    contentDiv.className = 'pokemon-content';
    contentDiv.innerHTML = html;
    viewDetails.appendChild(contentDiv);

//      ------------          Event Sound Cries Pokémon        ----------------

    const btnSound = contentDiv.querySelector('#btn-sound');
    if(btnSound && cryUrl) {
        btnSound.addEventListener('click', () => {
            const audio = new Audio(cryUrl);
            audio.volume = 0.5; // Volume à 50%
            audio.play().catch(e => console.error("Erreur lecture audio:", e));
        });
    }
}

// #endregion

// #region   ------------        Function to Detect Route Path         ----------------

async function router() {
    const hash = globalThis.location.hash;
    if (!hash) {
        history.replaceState(null, '', '#');
    }

    // ROUTE 1 : CRÉATION D'ÉQUIPE
    if (hash.startsWith('#/party-create')){
        // 1. Gestion de l'affichage
        partyCreate.classList.remove('hidden')
        viewDetails.classList.add('hidden')
        viewHome.classList.add('hidden')
        await displayCreate()
    }
    
    // ROUTE 2 : DÉTAIL POKÉMON
    else if (hash.startsWith('#/pokemon/')) {
        const idString = hash.split('/')[2];
        const id = Number(idString);

        if (!Number.isNaN(id)) {
            viewHome.classList.add('hidden');
            partyCreate.classList.add('hidden'); 
            viewDetails.classList.remove('hidden');
            await renderPokemonDetails(id);
        }
    }
    
    // ROUTE 3 : ACCUEIL (Défaut)
    else {
        viewHome.classList.remove('hidden');
        viewDetails.classList.add('hidden');
        partyCreate.classList.add('hidden');
        

        window.scrollTo(0, 0);
        if (card.innerHTML.trim() === "") {
            card.data = await getPokemonList(currentList, index, limit);
        }
    }
}

// #endregion

//  #region    ----------------        Event Pagination & Route Path           ----------------

globalThis.addEventListener('hashchange', router);
await router();

pagination.addEventListener('page-changed', async(e:any) => {
    const {offset, limit} = e.detail
    card.data = await getPokemonList(currentList,offset, limit)
})

// #endregion

// #region     ---------------        Update Filter by Search Input         ---------------

if(search){
    search.addEventListener('input', () => {
                return updateFilter(currentList,fullList, index, limit)
         })
}

// #endregion


