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

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

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

export async function getSpeciesCount() {
  if (!speciesCountPromise) {
    speciesCountPromise = fetchJson(`${API_BASE}/pokemon-species?limit=1`).then((data) => data.count);
  }

  return speciesCountPromise;
}

function hashDailyString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
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

function resolveArtwork(pokemon) {
  return (
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.other?.home?.front_default ||
    pokemon.sprites?.front_default ||
    ''
  );
}

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

function buildGuessAliases(pokemonName, speciesName) {
  const names = [pokemonName, speciesName].filter(Boolean);
  return Array.from(new Set(names.map((name) => normalizePokemonGuess(name))));
}

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
  const count = await getSpeciesCount();
  const speciesId = (hashDailyString(dateKey) % count) + 1;
  const species = await fetchJson(`${API_BASE}/pokemon-species/${speciesId}`);
  return species.name;
}

async function getRandomPokemonByEvolutionStage(stage) {
  const count = await getSpeciesCount();

  for (let attempts = 0; attempts < 48; attempts += 1) {
    const candidateId = Math.floor(Math.random() * count) + 1;
    const candidate = await getPokemonRoundData(candidateId);
    if (candidate.evolutionStage === stage) {
      return candidate.speciesName;
    }
  }

  throw new Error(`Could not find an evolution-stage Pokemon for ${stage}.`);
}

export async function getModePokemonName(modeKey, setup, dateKey) {
  switch (modeKey) {
    case 'daily':
      return getDailyPokemonName(dateKey);
    case 'generation':
      return pickRandom(await getGenerationSpecies(setup?.value));
    case 'type':
      return pickRandom(await getTypePokemon(setup?.value));
    case 'starters':
      return pickRandom(STARTER_POKEMON);
    case 'legendary':
      return pickRandom(LEGENDARY_MYTHIC_POKEMON);
    case 'color':
      return pickRandom(await getColorSpecies(setup?.value));
    case 'evolution':
      return getRandomPokemonByEvolutionStage(setup?.value);
    case 'hard':
    case 'classic':
    default: {
      const count = await getSpeciesCount();
      const randomId = Math.floor(Math.random() * count) + 1;
      const species = await fetchJson(`${API_BASE}/pokemon-species/${randomId}`);
      return species.name;
    }
  }
}
