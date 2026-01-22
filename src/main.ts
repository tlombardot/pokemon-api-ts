import './assets/styles.css'
import {getPokemonList, initAllPokemon} from './service/pokemonApi.ts'
import {PokemonCard} from './components/pokemonCard.ts'
import {PaginationPokemon} from "./components/paginationPokemon.ts";


let pokemon = await initAllPokemon()
let limit = 20
let index = 0

pokemon ??= {count: 0, next: "", previous:"", results:[]};

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class = "grid grid-cols-1 md:grid-cols-3 justify-center text-center p-2 bg-black/10 sticky">
  <div class = "hidden md:block"></div>
    <h1 class = "text-blue-300 text-2xl font-extrabold uppercase tracking-widest animate-pulse">Poke Next</h1>
    <search class = "bg-gray-600/50 rounded-3xl justify-center md:justify-self-end">
        <input placeholder="Recherchez un Pokémon..." class = "outline-none w-full pl-2.5 pr-2.5 pt-1 caret-[#ffffff] text-white ">
    </search>
  </header>
  <main>
        <pagination-pokemon>
<!--        Pagination-->
        </pagination-pokemon>
        <pokemon-card class ="grid grid-cols-2 md:grid-cols-3 justify-self-center">
<!--        Pokémon list--> 
        </pokemon-card>
  </main>
`

const pagination = document.querySelector('pagination-pokemon') as PaginationPokemon
const card = document.querySelector('pokemon-card') as PokemonCard
const pokemonList = await getPokemonList(pokemon,index, limit)
card.data = pokemonList



pagination.addEventListener('page-changed', async(e:any) => {
    const {offset, limit} = e.detail
    console.log(offset)
    card.data = await getPokemonList(pokemon,offset, limit)
})


