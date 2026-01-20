import './assets/styles.css'
import {getPokemonList, initAllPokemon} from './service/pokemonApi.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class = "grid grid-cols-1 md:grid-cols-3 justify-center text-center p-2 bg-black/10 sticky">
  <div class = "hidden md:block"></div>
    <h1 class = "text-blue-300 text-2xl font-extrabold uppercase tracking-widest animate-pulse">Poke Next</h1>
    <search class = "bg-gray-600/50 rounded-3xl justify-center md:justify-self-end">
        <input class = "outline-none w-full p-0.5 caret-[#ffffff] text-white ">
    </search>
  </header>
  <main>
    <section id = "pokemon-list" class ="grid grid-cols-4">
<!--        Pokémon list-->
    </section>
  </main>
`

const pokemon = await initAllPokemon()
console.log(pokemon)
const pokemonList = await getPokemonList(pokemon,0,20)
console.log(pokemonList)


