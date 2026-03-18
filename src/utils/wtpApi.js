/*
* wtpApi.js
* API utility functions for the "Who's That Pokémon?" game mode. 
* This module handles fetching Pokémon data from the PokeAPI, selecting random Pokémon based on various criteria, and preparing data for use in the game rounds.
*/

import { LEGENDARY_MYTHIC_POKEMON, STARTER_POKEMON } from '../data/wtpPokemonPools.js';

const API_BASE = 'https://pokeapi.co/api/v2';

const jsonCache = new Map();
let speciesCountPromise = null;

function sanitizeFlavorText(text) {
  return (text || '').replace(/[\n\f]/g, ' ').replace(/\s+/g, ' ').trim();
}

function titleCase(value) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Utility function to pick a random item from an array
function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

// Utility function to pick a random item from an array while excluding certain items
function pickRandomExcluding(items, excluded = []) {
  const excludedSet = new Set(excluded);
  const pool = items.filter((item) => !excludedSet.has(item));
  return pickRandom(pool.length ? pool : items);
}

// Fetch JSON data with caching to avoid redundant requests to the PokeAPI
async function fetchJson(url) {
  if (jsonCache.has(url)) return jsonCache.get(url);

  const promise = fetch(url).then(async (response) => {
    if (!response.ok) {
      throw new Error(`PokeAPI request failed: ${response.status}`);
    }
    return response.json();
  });

  jsonCache.set(url, promise);
  return promise;
}

// Fetch the total count of Pokémon species from the PokeAPI, caching the result for future calls to optimize performance. 
// This is used to determine the range for random species selection.
export async function getSpeciesCount() {
  if (!speciesCountPromise) {
    speciesCountPromise = fetchJson(`${API_BASE}/pokemon-species?limit=1`).then((data) => data.count);
  }

  return speciesCountPromise;
}

function xmur3(value) {
  let hash = 1779033703 ^ value.length;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  return function nextSeed() {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}

// A seeded pseudorandom number generator based on the Mulberry32 algorithm, which provides a good balance of speed and randomness quality for our use case.
function mulberry32(seed) {
  return function nextRandom() {
    let value = (seed += 0x6D2B79F5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Shift a date string in 'YYYY-MM-DD' format by a specified number of days, returning the new date as a string in the same format. 
// This is used to generate consistent daily Pokémon based on the date.
function shiftDateKey(dateKey, dayDelta) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const nextDate = new Date(year, month - 1, day + dayDelta);
  const nextYear = nextDate.getFullYear();
  const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
  const nextDay = String(nextDate.getDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

// Fetch a Pokémon species by its ID from the PokeAPI, utilizing caching to optimize performance for repeated requests.
async function getSpeciesById(speciesId) {
  return fetchJson(`${API_BASE}/pokemon-species/${speciesId}`);
}

// Generate a daily Pokémon species candidate based on a date key and an attempt number, using a seeded random approach 
// to ensure consistency across users while allowing for retries if necessary.
async function getDailySpeciesCandidate(dateKey, attempt = 0) {
  const count = await getSpeciesCount();
  const seededHash = xmur3(`${dateKey}:${attempt}`);
  const random = mulberry32(seededHash());
  const speciesId = Math.floor(random() * count) + 1;
  return getSpeciesById(speciesId);
}

function parseGenerationLabel(generationName) {
  return generationName
    .replace('generation-', 'Generation ')
    .replace(/\bi\b/g, 'I')
    .replace(/\bii\b/g, 'II')
    .replace(/\biii\b/g, 'III')
    .replace(/\biv\b/g, 'IV')
    .replace(/\bv\b/g, 'V')
    .replace(/\bvi\b/g, 'VI')
    .replace(/\bvii\b/g, 'VII')
    .replace(/\bviii\b/g, 'VIII')
    .replace(/\bix\b/g, 'IX');
}

// Resolve the best available artwork for a Pokémon, prioritizing official artwork, then home sprites, and finally default sprites, 
// to ensure the highest quality image is used in the game when available.
function resolveArtwork(pokemon) {
  return (
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.other?.home?.front_default ||
    pokemon.sprites?.front_default ||
    ''
  );
}

// Recursively build a map of Pokémon species names to their evolution stages (base, middle, final, single) based on the structure of the evolution chain data from the PokeAPI.
function buildEvolutionStageMap(chainNode, stageMap = {}, depth = 0) {
  const nextBranches = chainNode.evolves_to || [];
  let stage = 'single';

  if (depth === 0 && nextBranches.length > 0) stage = 'base';
  else if (depth > 0 && nextBranches.length > 0) stage = 'middle';
  else if (depth > 0 && nextBranches.length === 0) stage = 'final';

  stageMap[chainNode.species.name] = stage;
  nextBranches.forEach((branch) => buildEvolutionStageMap(branch, stageMap, depth + 1));
  return stageMap;
}

export function normalizePokemonGuess(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[.'’:%]/g, '')
    .replace(/♀/g, 'f')
    .replace(/♂/g, 'm')
    .replace(/[^a-z0-9]+/g, '');
}

// Build a list of normalized guess aliases for a Pokémon based on its name and species name, ensuring that 
// players can guess using either the Pokémon's name or its species name without worrying about formatting differences.
function buildGuessAliases(pokemonName, speciesName) {
  const names = [pokemonName, speciesName].filter(Boolean);
  return Array.from(new Set(names.map((name) => normalizePokemonGuess(name))));
}

// Fetch and compile all relevant data for a Pokémon given its identifier (name or ID), including its species information, 
// evolution chain, flavor text, and other attributes needed for the game rounds.
export async function getPokemonRoundData(identifier) {
  const pokemon = await fetchJson(`${API_BASE}/pokemon/${identifier}`);
  const species = await fetchJson(pokemon.species.url);
  const evolutionChain = species.evolution_chain?.url ? await fetchJson(species.evolution_chain.url) : null;
  const englishFlavorEntry = species.flavor_text_entries?.find((entry) => entry.language.name === 'en');
  const englishGenus = species.genera?.find((entry) => entry.language.name === 'en');
  const stageMap = evolutionChain?.chain ? buildEvolutionStageMap(evolutionChain.chain) : {};
  const displayName = titleCase(species.name);

  return {
    id: pokemon.id,
    pokemonName: pokemon.name,
    speciesName: species.name,
    displayName,
    guessAliases: buildGuessAliases(pokemon.name, species.name),
    image: resolveArtwork(pokemon),
    sprite: pokemon.sprites?.front_default || '',
    types: pokemon.types.map((entry) => entry.type.name),
    abilities: pokemon.abilities.map((entry) => titleCase(entry.ability.name)),
    height: pokemon.height,
    weight: pokemon.weight,
    color: species.color?.name || 'unknown',
    generation: species.generation?.name || 'generation-i',
    generationLabel: parseGenerationLabel(species.generation?.name || 'generation-i'),
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
    flavorText: sanitizeFlavorText(englishFlavorEntry?.flavor_text),
    genus: englishGenus?.genus || 'Pokemon',
    evolutionStage: stageMap[species.name] || 'single',
  };
}

// get functions to fetch lists of Pokémon species based on different criteria

async function getGenerationSpecies(generationValue) {
  const data = await fetchJson(`${API_BASE}/generation/${generationValue}`);
  return data.pokemon_species.map((entry) => entry.name);
}

async function getTypePokemon(typeValue) {
  const data = await fetchJson(`${API_BASE}/type/${typeValue}`);
  return data.pokemon.map((entry) => entry.pokemon.name);
}

async function getColorSpecies(colorValue) {
  const data = await fetchJson(`${API_BASE}/pokemon-color/${colorValue}`);
  return data.pokemon_species.map((entry) => entry.name);
}

async function getDailyPokemonName(dateKey) {
  const recentChainUrls = new Set();

  for (let dayOffset = 1; dayOffset <= 2; dayOffset += 1) {
    const priorDateKey = shiftDateKey(dateKey, -dayOffset);
    const priorSpecies = await getDailySpeciesCandidate(priorDateKey);
    if (priorSpecies.evolution_chain?.url) {
      recentChainUrls.add(priorSpecies.evolution_chain.url);
    }
  }

  for (let attempt = 0; attempt < 16; attempt += 1) {
    const species = await getDailySpeciesCandidate(dateKey, attempt);
    const evolutionChainUrl = species.evolution_chain?.url || null;

    if (!evolutionChainUrl || !recentChainUrls.has(evolutionChainUrl)) {
      return species.name;
    }
  }

  const fallbackSpecies = await getDailySpeciesCandidate(dateKey);
  return fallbackSpecies.name;
}

async function getRandomPokemonByEvolutionStage(stage, excluded = []) {
  const count = await getSpeciesCount();
  const excludedSet = new Set(excluded);

  for (let attempts = 0; attempts < 48; attempts += 1) {
    const candidateId = Math.floor(Math.random() * count) + 1;
    const candidate = await getPokemonRoundData(candidateId);
    if (candidate.evolutionStage === stage && !excludedSet.has(candidate.speciesName)) {
      return candidate.speciesName;
    }
  }

  throw new Error(`Could not find an evolution-stage Pokemon for ${stage}.`);
}

async function getRandomSpeciesName(excluded = []) {
  const count = await getSpeciesCount();
  const excludedSet = new Set(excluded);

  for (let attempts = 0; attempts < 64; attempts += 1) {
    const randomId = Math.floor(Math.random() * count) + 1;
    const species = await fetchJson(`${API_BASE}/pokemon-species/${randomId}`);
    if (!excludedSet.has(species.name)) {
      return species.name;
    }
  }

  const fallbackId = Math.floor(Math.random() * count) + 1;
  const fallbackSpecies = await fetchJson(`${API_BASE}/pokemon-species/${fallbackId}`);
  return fallbackSpecies.name;
}

// Main function to get a Pokémon name based on the selected game mode and setup options, utilizing 
// the appropriate helper functions to fetch and filter Pokémon species according to the criteria defined by each mode.
export async function getModePokemonName(modeKey, setup, dateKey, excluded = []) {
  switch (modeKey) {
    case 'daily':
      return getDailyPokemonName(dateKey);
    case 'generation':
      return pickRandomExcluding(await getGenerationSpecies(setup?.value), excluded);
    case 'type':
      return pickRandomExcluding(await getTypePokemon(setup?.value), excluded);
    case 'starters':
      return pickRandomExcluding(STARTER_POKEMON, excluded);
    case 'legendary':
      return pickRandomExcluding(LEGENDARY_MYTHIC_POKEMON, excluded);
    case 'color':
      return pickRandomExcluding(await getColorSpecies(setup?.value), excluded);
    case 'evolution':
      return getRandomPokemonByEvolutionStage(setup?.value, excluded);
    case 'hard':
    case 'classic':
    default: {
      return getRandomSpeciesName(excluded);
    }
  }
}
