import type {AllPokemon, Pokemon} from "../types/pokemon.ts";


export async function initAllPokemon(){
    try {
        const p = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1350")
        return await p.json() as AllPokemon;
    }catch (error){
        console.log(error)
    }
}

async function getPokemon(id:number){
    try{
        const p = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        return await p.json() as Pokemon;
    }catch (error){
        console.log(error)
    }
}

export async function getPokemonList(request:AllPokemon | undefined, index:number, end:number){
    if (!request) return []
    const limitedRequest = request.results.slice(index,end)
    const results =  await Promise.all(
         limitedRequest.map(async p => {
            const id = p.url.split("/")[6]
            return await getPokemon(Number(id))
    }))
    return results.filter((p): p is Pokemon => p != undefined)
}
