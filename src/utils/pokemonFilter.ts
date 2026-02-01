import {
  fetchPokemonByCategories,
  initAllAbility,
  initAllGeneration,
  initAllTypes,
} from "../service/pokemonApi.ts";
import type { PokemonURL } from "../types/pokemon.ts";

export async function getFilteredList(
  fullList: PokemonURL[]
): Promise<PokemonURL[]> {
  const selectTypes = document.querySelector<HTMLSelectElement>("#types");
  const selectGeneration = document.querySelector<HTMLSelectElement>("#generations");
  const selectAbility = document.querySelector<HTMLSelectElement>("#ability");
  const search = document.querySelector<HTMLInputElement>("#search");

  const searchValue = search?.value.toLowerCase() || "";
  const typeValue = selectTypes?.value || "all";
  const generationValue = selectGeneration?.value || "all";
  const abilitiesValue = selectAbility?.value || "all";
  let filteredList = [...fullList];

  // Filtre Recherche
  if (searchValue !== "") {
    filteredList = filteredList.filter((p: PokemonURL) => {
      return (
        p.name.toLowerCase().includes(searchValue) ||
        p.url.split("/").at(-2)?.includes(searchValue)
      );
    });
  }

  // Filtre Type
  if (typeValue !== "all") {
    const pokemonInType = await fetchPokemonByCategories("type", typeValue);
    const typeSet = new Set(pokemonInType);
    filteredList = filteredList.filter((p: PokemonURL) => {
      const id = p.url.split("/").at(-2);
      return typeSet.has(id);
    });
  }

  // Filtre Génération
  if (generationValue !== "all") {
    const pokemonInGeneration = await fetchPokemonByCategories(
      "generation",
      generationValue,
    );
    const generationSet = new Set(pokemonInGeneration);
    filteredList = filteredList.filter((p: PokemonURL) => {
      const id = p.url.split("/").at(-2);
      return generationSet.has(id);
    });
  }

  // Filtre Abilité
  if (abilitiesValue !== "all") {
    const pokemonInAbility = await fetchPokemonByCategories(
      "ability",
      abilitiesValue,
    );
    const abilitiesSet = new Set(pokemonInAbility);
    filteredList = filteredList.filter((p: PokemonURL) => {
      const id = p.url.split("/").at(-2);
      return abilitiesSet.has(id);
    });
  }
  return filteredList;
}


//#region ----------------------- Fonctions d'initialisation -----------------------------

export async function typesSelector() {
  const types = await initAllTypes();
  const selectTypes = document.querySelector<HTMLSelectElement>("#types");
  
  if (selectTypes) {
    const defaultOption = `<option value="all">Types</option>`;
    const optionsTypes = types?.map((t) => {
      if (t.name === "stellar" || t.name === `unknown` || t.name === "shadow") return;
      return `<option value="${t.name}">${t.name.toUpperCase()}</option>`;
    }).join("");
    selectTypes.innerHTML = defaultOption + optionsTypes;
  }
}

export async function generationSelector() {
  const generation = await initAllGeneration();
  const selectGeneration = document.querySelector<HTMLSelectElement>("#generations");
  
  if (selectGeneration && generation) {
    const defaultOption = `<option value="all">Generations</option>`;
    const optionsGenerations = generation.map((g) => {
      const id = g.url.split("/").at(-2);
      return `<option value="${id}">${g.name.toUpperCase()}</option>`;
    }).join("");
    selectGeneration.innerHTML = defaultOption + optionsGenerations;
  }
}

export async function abilitySelector() {
  const ability = await initAllAbility();
  const selectAbility = document.querySelector<HTMLSelectElement>("#ability");
  
  if (selectAbility && ability) {
    const defaultOption = `<option value="all">Abilities</option>`;
    const optionsAbilities = ability.map((a) => {
      return `<option value="${a.name}">${a.name.toUpperCase()}</option>`;
    }).join("");
    selectAbility.innerHTML = defaultOption + optionsAbilities;
  }
}

//#endregion