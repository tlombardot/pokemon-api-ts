import './assets/styles.css'
import {
    fetchPokemonByCategories,
    getPokemon,
    getPokemonList,
    initAllAbility,
    initAllGeneration,
    initAllPokemon,
    initAllTypes
} from './service/pokemonApi.ts'
import {PokemonCard} from './components/pokemonCard.ts'
import {PaginationPokemon} from "./components/paginationPokemon.ts";


const pokemon = await initAllPokemon()
const types = await initAllTypes()
const generation = await initAllGeneration()
const ability = await initAllAbility()
const fullList = pokemon.results || []
let currentList = [...fullList]
let limit = 20
let index = 0


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="view-home">
  <header class = "grid grid-cols-1 md:grid-cols-3 justify-center text-center p-2 bg-black/10 sticky">
    <nav>
        <select id="types" class ="rounded-2xl bg-gray-500/20 p-2">
            <option class ="bg-gray-800" value="all">Types</option>
        </select>
        <select id="generations" class ="rounded-2xl bg-gray-500/20 p-2">
            <option class="bg-gray-800" value="all">Generation</option>
        </select>
        <select id="ability" class ="rounded-2xl bg-gray-500/20 p-2">
            <option class ="bg-gray-800" value="all">Abilities</option>
        </select>
    </nav>
    <h1 class = "text-blue-300 text-2xl font-extrabold uppercase tracking-widest animate-pulse">Poke Next</h1>
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
`

const pagination = document.querySelector('pagination-pokemon') as PaginationPokemon
const card = document.querySelector('pokemon-card') as PokemonCard
const search = document.querySelector<HTMLInputElement>('#search')
typesSelector()
generationSelector()
abilitySelector()
const pokemonList = await getPokemonList(currentList,index, limit)
card.data = pokemonList

const viewHome = document.getElementById('view-home') as HTMLDivElement;
const viewDetails = document.getElementById('view-details') as HTMLDivElement;

async function renderPokemonDetails(id: number) {
    const p = await getPokemon(id);
    if(!p) return;
    const typesHtml = p.types.map(t => `<span class="bg-gray-700 px-3 py-1 rounded-full text-sm">${t.type.name}</span>`).join('');
    const statsHtml = p.stats.map(s => `
        <div class="flex justify-between">
            <span class="uppercase text-gray-400">${s.stat.name}:</span>
            <span class="text-white font-bold">${s.base_stat}</span>
        </div>
    `).join('');

    const html = `
    <div class="max-w-5xl mx-auto p-4">
        <nav id= "btn-nav" class="flex justify-between">
            <a href="#" class="inline-block text-white text-lg font-bold hover:text-blue-300 mb-4 transition-colors">
                ← Retour à la liste
            </a>
        </nav>
        <div class="flex flex-col items-center mt-10 text-white animate-fade-in">
            <h2 class="text-4xl font-extrabold uppercase text-blue-300 mb-4">${p.name}</h2>
            <div class="relative">
                <div class="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                <img class="relative w-96 h-96 z-10" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png" alt="${p.name}">
            </div>
            
            <div class="flex gap-4 mt-6 mb-8 uppercase">
                ${typesHtml}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl bg-gray-800/50 p-8 rounded-3xl">
                <div>
                    <h3 class="text-xl font-bold text-yellow-200 mb-4">Informations</h3>
                    <p>Height: ${p.height / 10} m</p>
                    <p>Weight: ${p.weight / 10} kg</p>
                </div>
                <div>
                     <h3 class="text-xl font-bold text-yellow-200 mb-4">Stats Base</h3>
                     <div class="space-y-2">
                        ${statsHtml}
                     </div>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-amber-200 mb-4">Evolutions</h3>
                    <div class="space-y-2">
                    <!-- Evolutions -->
                    </div>
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
}
async function router() {
    const hash = globalThis.location.hash;
    if (!hash) {
        history.replaceState(null, '', '#');
    }

    if (hash.startsWith('#/pokemon/')) {
        const idString = hash.split('/')[2];
        const id = Number(idString);

        if (!Number.isNaN(id)) {
            viewHome.classList.add('hidden');
            viewDetails.classList.remove('hidden');

            await renderPokemonDetails(id);
        }
    }
    else {
        viewHome.classList.remove('hidden');
        viewDetails.classList.add('hidden');
        window.scrollTo(0, 0);

        if (card.innerHTML.trim() === "") {
            card.data = await getPokemonList(currentList, index, limit);
        }
    }
}

globalThis.addEventListener('hashchange', router);
await router();

function typesSelector() {
    const selectTypes = document.querySelector<HTMLSelectElement>('#types')
    selectTypes?.addEventListener('change', updateFilter);
    if(selectTypes) {
        const defaultOption = `<option value="all">Types</option>`;
        const optionsTypes = types.map(t => {
            if (t.name === "stellar" || t.name === `unknown` || t.name === "shadow") return
            return `<option value="${t.name}">${t.name.toUpperCase()}</option>`
        })
        selectTypes.innerHTML = defaultOption+optionsTypes
    }
}
function generationSelector() {
    const selectGeneration = document.querySelector<HTMLSelectElement>('#generations')
    selectGeneration?.addEventListener('change', updateFilter);
    if(!generation) return
    if(selectGeneration) {
        const defaultOption = `<option value="all">Generations</option>`
        const optionsGenerations = generation.map(g => {
            const id = g.url.split('/').at(-2);
            return `<option value="${id}">${g.name.toUpperCase()}</option>`
        })
        selectGeneration.innerHTML = defaultOption+optionsGenerations
    }
}

function abilitySelector() {
    const selectAbility = document.querySelector<HTMLSelectElement>('#ability')
    selectAbility?.addEventListener('change', updateFilter);
    if (!ability) return
    if(selectAbility) {
        const defaultOption = `<option value="all">Abilities</option>`
        const optionsAbilities = ability.map(a => {
            return `<option value="${a.name}">${a.name.toUpperCase()}</option>`
        })
        selectAbility.innerHTML = defaultOption+optionsAbilities
    }
}




pagination.addEventListener('page-changed', async(e:any) => {
    const {offset, limit} = e.detail
    card.data = await getPokemonList(currentList,offset, limit)
})

if(search){
    search.addEventListener('input', () => {
                return updateFilter()
         })
}

async function updateFilter(){
    const selectTypes = document.querySelector<HTMLSelectElement>('#types')
    const selectGeneration = document.querySelector<HTMLSelectElement>('#generations')
    const selectAbility = document.querySelector<HTMLSelectElement>('#ability')
    const searchValue = search?.value.toLowerCase() || "";
    const typeValue = selectTypes?.value || "all";
    const generationValue = selectGeneration?.value || "all";
    const abilitiesValue = selectAbility?.value || "all";
    if(!search)return
    if (searchValue === ""){
        currentList = [...fullList]
    }
    if(searchValue != "") {
        currentList = fullList.filter((p)=> {
            return  p.name.toLowerCase().includes(search.value.toLowerCase())
            || (p.url.split('/')).at(-2)?.includes(search.value.toLowerCase())

        })

    }
    if(typeValue != "all") {
        const pokemonInType = await fetchPokemonByCategories('type',typeValue)
        const typeSet = new Set(pokemonInType)
        currentList = currentList.filter(p => typeSet.has(p.name.toLowerCase()))
    }
    if(generationValue != "all"){
        const pokemonInGeneration = await fetchPokemonByCategories('generation',generationValue)
        const generationSet = new Set(pokemonInGeneration)
        currentList = currentList.filter(p => generationSet.has(p.name.toLowerCase()))
    }
    if (abilitiesValue != "all"){
        const pokemonInAbility = await fetchPokemonByCategories('ability',abilitiesValue)
        const abilitiesSet = new Set(pokemonInAbility)
        currentList = currentList.filter(p => abilitiesSet.has(p.name.toLowerCase()))
    }


    index = 0;
    pagination.dataCount = {
        count: currentList.length,
        offset: 0
    }
    card.data = await getPokemonList(currentList,index, limit)

}


