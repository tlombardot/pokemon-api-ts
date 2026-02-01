import {
  fetchPokemonByCategories,
  getPokemonList,
  initAllAbility,
  initAllGeneration,
  initAllTypes,
} from "../service/pokemonApi.ts";
import { PokemonCard } from "../components/pokemonCard.ts";
import { PaginationPokemon } from "../components/paginationPokemon.ts";
import type { PokemonURL } from "../types/pokemon.ts";

export async function updateFilter(
  currentList: PokemonURL[],
  fullList: PokemonURL[],
  index: number,
  limit: number,
) {
  const pagination = document.querySelector(
    "pagination-pokemon",
  ) as PaginationPokemon;
  const card = document.querySelector("pokemon-card") as PokemonCard;
  const selectTypes = document.querySelector<HTMLSelectElement>("#types");
  const selectGeneration =
    document.querySelector<HTMLSelectElement>("#generations");
  const selectAbility = document.querySelector<HTMLSelectElement>("#ability");
  const search = document.querySelector<HTMLInputElement>("#search");
  const searchValue = search?.value.toLowerCase() || "";
  const typeValue = selectTypes?.value || "all";
  const generationValue = selectGeneration?.value || "all";
  const abilitiesValue = selectAbility?.value || "all";
  let indexValue = index;
  if (!search) return;
  if (searchValue === "") {
    currentList = [...fullList];
  }
  if (searchValue != "") {
    currentList = fullList.filter((p: PokemonURL) => {
      return (
        p.name.toLowerCase().includes(search.value.toLowerCase()) ||
        p.url.split("/").at(-2)?.includes(search.value.toLowerCase())
      );
    });
  }
  if (typeValue != "all") {
    const pokemonInType = await fetchPokemonByCategories("type", typeValue);
    const typeSet = new Set(pokemonInType);
    console.log(typeSet)
    currentList = currentList.filter((p: PokemonURL) => {
      const id = p.url.split("/").at(-2);
      return typeSet.has(id)
    });
  }
  if (generationValue != "all") {
    const pokemonInGeneration = await fetchPokemonByCategories(
      "generation",
      generationValue,
    );
    const generationSet = new Set(pokemonInGeneration);
    currentList = currentList.filter((p: PokemonURL) =>{
      const id = p.url.split("/").at(-2);
      return generationSet.has(id);
  });
  }
  if (abilitiesValue != "all") {
    const pokemonInAbility = await fetchPokemonByCategories(
      "ability",
      abilitiesValue,
    );
    const abilitiesSet = new Set(pokemonInAbility);
    currentList = currentList.filter((p: PokemonURL) => {
      const id = p.url.split("/").at(-2);
      return abilitiesSet.has(id)
  });
  }
  indexValue = 0;
  pagination.dataCount = {
    count: currentList.length,
    offset: 0,
    list: currentList
  };
  card.data = await getPokemonList(currentList, indexValue, limit);
}

export async function typesSelector(
  currentList: PokemonURL[],
  fullList: PokemonURL[],
  index: number,
  limit: number,
) {
  const types = await initAllTypes();
  const selectTypes = document.querySelector<HTMLSelectElement>("#types");
  selectTypes?.addEventListener("change", async () => {
    await updateFilter(currentList, fullList, index, limit);
  });
  if (selectTypes) {
    const defaultOption = `<option value="all">Types</option>`;
    const optionsTypes = types?.map((t) => {
      if (t.name === "stellar" || t.name === `unknown` || t.name === "shadow")
        return;
      return `<option value="${t.name}">${t.name.toUpperCase()}</option>`;
    });
    selectTypes.innerHTML = defaultOption + optionsTypes;
  }
}

export async function generationSelector(
  currentList: PokemonURL[],
  fullList: PokemonURL[],
  index: number,
  limit: number,
) {
  const generation = await initAllGeneration();
  const selectGeneration =
    document.querySelector<HTMLSelectElement>("#generations");
  selectGeneration?.addEventListener("change", async () => {
    await updateFilter(currentList, fullList, index, limit);
  });
  if (!generation) return;
  if (selectGeneration) {
    const defaultOption = `<option value="all">Generations</option>`;
    const optionsGenerations = generation.map((g) => {
      const id = g.url.split("/").at(-2);
      return `<option value="${id}">${g.name.toUpperCase()}</option>`;
    });
    selectGeneration.innerHTML = defaultOption + optionsGenerations;
  }
}

export async function abilitySelector(
  currentList: PokemonURL[],
  fullList: PokemonURL[],
  index: number,
  limit: number,
) {
  const ability = await initAllAbility();
  const selectAbility = document.querySelector<HTMLSelectElement>("#ability");
  selectAbility?.addEventListener("change", async () => {
    await updateFilter(currentList, fullList, index, limit);
  });
  if (!ability) return;
  if (selectAbility) {
    const defaultOption = `<option value="all">Abilities</option>`;
    const optionsAbilities = ability.map((a) => {
      return `<option value="${a.name}">${a.name.toUpperCase()}</option>`;
    });
    selectAbility.innerHTML = defaultOption + optionsAbilities;
  }
}
