import type {AllPokemon, Pokemon, PokemonURL} from "../types/pokemon.ts";


export async function initAllPokemon(){
    try {
        const p = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1350")
        return await p.json() as AllPokemon;
    }catch (error){
        console.log(error)
    }
}

export async function getPokemon(id:number){
    try{
        const p = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        return await p.json() as Pokemon;
    }catch (error){
        console.log(error)
    }
}



export async function getPokemonList(request:PokemonURL[], index:number, end:number){
    if (!request) return []
    const limitedRequest = request.slice(index,index+end)
    const results =  await Promise.all(
         limitedRequest.map(async p => {
             const parts = p.url.split("/");
             const id = parts.at(-2);
             return await getPokemon(Number(id))
    }))
    return results.filter((p): p is Pokemon => p != undefined)
}


export async function initAllTypes(){
    try{
        const t = await fetch("https://pokeapi.co/api/v2/type?limit=1000")
        const tson = await t.json() as AllPokemon
        return tson.results
    }catch (error){
        console.log(error)
    }
}

export async function initAllGeneration(){
    try{
        const g = await fetch("https://pokeapi.co/api/v2/generation?limit=1000")
        const gson = await g.json() as AllPokemon
        return gson.results
    }catch (error){
        console.log(error)
    }
}

export async function initAllAbility(){
    try{
        const a = await fetch("https://pokeapi.co/api/v2/ability?limit=1000")
        const ason = await a.json() as AllPokemon
        return ason.results
    }catch (error){
        console.log(error)
    }
}

export async function fetchPokemonByCategories(category:string, value:string){
    try{
        const response = await fetch(`https://pokeapi.co/api/v2/${category}/${value}`)
        const data = await response.json();

        if(category === "generation") return data.pokemon_species.map((p:any) => p.name)
        else return data.pokemon.map((p:any) => p.pokemon.name)
    }catch (error){
        console.log(error)
    }

}

export async function getDataFromURL(url: string) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}