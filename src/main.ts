import './assets/styles.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class = "grid justify-center text-center grid-cols-3 p-2 bg-black/10 sticky">
  <div></div>
    <h1 class = "text-blue-300 text-2xl font-extrabold uppercase tracking-widest animate-pulse">Poke Next</h1>
    <search class = "bg-gray-600/50 rounded-3xl justify-self-end">
        <input class = "outline-none pl-2.5 p-0.5 caret-[#ffffff] text-white ">
    </search>
  </header>
  <main>
    <section id = "pokemon-list" class ="grid grid-cols-4">
<!--        Pokémon list-->
    </section>
  </main>
`



