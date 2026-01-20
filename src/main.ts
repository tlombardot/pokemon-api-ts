import './assets/styles.css'
import {getPokemonList, initAllPokemon} from './service/pokemonApi.ts'
import {PokemonCard} from './components/pokemonCard.ts'


const pokemon = await initAllPokemon()
const BATCH_SIZE = 20
let limit = 20
let index = 0

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class = "grid grid-cols-1 md:grid-cols-3 justify-center text-center p-2 bg-black/10 sticky">
  <div class = "hidden md:block"></div>
    <h1 class = "text-blue-300 text-2xl font-extrabold uppercase tracking-widest animate-pulse">Poke Next</h1>
    <search class = "bg-gray-600/50 rounded-3xl justify-center md:justify-self-end">
        <input placeholder="Recherchez un pokémon..." class = "outline-none w-full pl-2.5 pr-2.5 pt-1 caret-[#ffffff] text-white ">
    </search>
  </header>
  <main>
        <section class="grid grid-cols-3 mt-5 mb-5 justify-center">
            <button class="bg-white/20 p-4 rounded-3xl w-20 justify-self-end hover:scale-110 text-white active:scale-95"><</button>
            <div class="">
                <input class ="">
                <p class =""">/${Math.floor(pokemon.count/BATCH_SIZE)}</p>
            </div>
            <button class="bg-white/20 p-4 rounded-3xl w-20 justify-self-start hover:scale-110 text-white active:scale-95">></button>
        </section>
        <pokemon-card class ="grid grid-cols-2 md:grid-cols-3 justify-self-center">
<!--        Pokémon list--> 
        </pokemon-card>
  </main>
`

const card = document.querySelector('pokemon-card') as PokemonCard

const pokemonList = await getPokemonList(pokemon,index, limit)

card.data = pokemonList
