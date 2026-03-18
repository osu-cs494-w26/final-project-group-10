/**
 * personalityUtils.js
 * Utility functions for personality quiz and team building.
 * Fetches natures, scores Pokémon against a nature, and selects a team with randomness.
 * Limited to Generation 1–5 Pokémon (imported from constants).
 */

// Import Gen 1–5 Pokémon lists
import { GEN1_POKEMON, GEN2_POKEMON, GEN3_POKEMON, GEN4_POKEMON, GEN5_POKEMON } from './constants';

// Base URL for PokeAPI
const API_BASE = 'https://pokeapi.co/api/v2';

// Combined list of all Gen 1–5 Pokémon
const ALL_POKEMON_GEN1_5 = [
  ...GEN1_POKEMON,
  ...GEN2_POKEMON,
  ...GEN3_POKEMON,
  ...GEN4_POKEMON,
  ...GEN5_POKEMON
];

let allNaturesCache = null;

/**
 * Get the list of all Generation 1–5 Pokémon names.
 */
export function getAllPokemonList() {
  return ALL_POKEMON_GEN1_5;
}

/**
 * Fetch details for a single Pokémon (stats, types, sprites).
 * Includes animated sprite from Generation V if available.
 */
export async function fetchPokemonDetail(pokemonName) {
  // Handle testmon dummy data
  if (pokemonName.startsWith('testmon')) {
    return {
      id: 0,
      name: pokemonName,
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png',
      spriteBack: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/132.png',
      animatedSprite: null,
      types: ['normal'],
      stats: [
        { name: 'hp', base_stat: 125 },
        { name: 'attack', base_stat: 125 },
        { name: 'defense', base_stat: 125 },
        { name: 'special-attack', base_stat: 125 },
        { name: 'special-defense', base_stat: 125 },
        { name: 'speed', base_stat: 125 }
      ],
      abilities: [],
      moves: []
    };
  }

  const response = await fetch(`${API_BASE}/pokemon/${pokemonName}`);
  const data = await response.json();

  // Extract animated sprite from Generation V (black-white animated)
  const animatedSprite = data.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default || null;

  return {
    id: data.id,
    name: data.name,
    sprite: data.sprites.front_default,
    spriteBack: data.sprites.back_default,
    animatedSprite, // GIF if available, otherwise null
    types: data.types.map(t => t.type.name),
    stats: data.stats.map(s => ({ name: s.stat.name, base_stat: s.base_stat })),
    abilities: data.abilities.map(a => a.ability.name),
    moves: data.moves.map(m => m.move.name)
  };
}

/**
 * Fetch all natures from PokeAPI.
 */
export async function fetchAllNatures() {
  if (allNaturesCache) return allNaturesCache;
  const response = await fetch(`${API_BASE}/nature?limit=30`);
  const data = await response.json();
  const natureDetails = await Promise.all(
    data.results.map(async (nature) => {
      const res = await fetch(nature.url);
      return res.json();
    })
  );
  allNaturesCache = natureDetails;
  return allNaturesCache;
}

/**
 * Find the nature that best matches preferred and least preferred stats.
 */
export function findMatchingNature(natures, preferredStat, leastStat) {
  // Exact match
  let exact = natures.find(
    (n) => n.increased_stat?.name === preferredStat && n.decreased_stat?.name === leastStat
  );
  if (exact) return exact;

  // Fallback to any nature that increases preferred stat
  let fallback = natures.find((n) => n.increased_stat?.name === preferredStat);
  if (fallback) return fallback;

  // Last resort
  return natures[0];
}
/**
 * Generate three team variants (balanced, offensive, defensive) for a given nature.
 */
export async function generateTeamVariants(nature, allPokemonList) {
  console.log(`Generating team variants for nature: ${nature.name}`);

  const balancedTeam = await selectTeamForNature(nature, allPokemonList);

  // Offensive variant: boost attacking stats, penalize defense
  const offensiveNature = {
    ...nature,
    increased_stat: nature.increased_stat, 
    decreased_stat: { name: nature.increased_stat?.name === 'attack' ? 'defense' : 'special-defense' } 
  };
  const offensiveTeam = await selectTeamForNature(offensiveNature, allPokemonList);

  // Defensive variant: boost defensive stats, penalize offense
  const defensiveNature = {
    ...nature,
    increased_stat: { name: nature.increased_stat?.name === 'attack' ? 'defense' : 'special-defense' },
    decreased_stat: nature.increased_stat 
  };
  const defensiveTeam = await selectTeamForNature(defensiveNature, allPokemonList);

  return {
    balanced: balancedTeam,
    offensive: offensiveTeam,
    defensive: defensiveTeam,
  };
}

/**
 * Compute preferred and least preferred stat from accumulated scores.
 */
export function computePreferredStats(statScores) {
  const stats = ['attack', 'defense', 'special-attack', 'special-defense', 'speed'];
  let maxStat = stats[0];
  let minStat = stats[0];

  for (const stat of stats) {
    if (statScores[stat] > statScores[maxStat]) maxStat = stat;
    if (statScores[stat] < statScores[minStat]) minStat = stat;
  }

  if (maxStat === minStat) {
    const otherStats = stats.filter(s => s !== maxStat);
    minStat = otherStats[Math.floor(Math.random() * otherStats.length)];
  }

  return { preferred: maxStat, least: minStat };
}

/**
 * Score a Pokémon based on how well its stats match a given nature.
 */
export function calculateNatureScore(pokemonStats, nature) {
  if (!nature.increased_stat || !nature.decreased_stat) {
    return 50; // neutral nature baseline
  }

  const incStatName = nature.increased_stat.name;
  const decStatName = nature.decreased_stat.name;

  const incStat = pokemonStats.find((s) => s.name === incStatName)?.base_stat || 0;
  const decStat = pokemonStats.find((s) => s.name === decStatName)?.base_stat || 0;

  const incRatio = incStat / 255;
  const decPenalty = decStat / 255;

  let score = (incRatio * 70) - (decPenalty * 30) + 30;
  score += (Math.random() * 20) - 10; // randomness

  return Math.max(0, Math.min(100, score));
}

// Cache for Pokémon details
const pokemonDetailsCache = {};

async function getCachedPokemonDetail(name) {
  if (pokemonDetailsCache[name]) return pokemonDetailsCache[name];
  const detail = await fetchPokemonDetail(name);
  pokemonDetailsCache[name] = detail;
  return detail;
}

/**
 * Select a team of 6 Pokémon from the Gen 1–5 list based on nature scores.
 */
export async function selectTeamForNature(nature, allPokemonList) {
  console.log(`Selecting team for nature: ${nature.name}`);

  const shuffled = [...allPokemonList].sort(() => Math.random() - 0.5);
  const sampleSize = Math.min(500, shuffled.length);
  const sample = shuffled.slice(0, sampleSize);

  const batchSize = 50;
  const scored = [];

  for (let i = 0; i < sample.length; i += batchSize) {
    const batch = sample.slice(i, i + batchSize);
    const batchDetails = await Promise.all(batch.map(name => getCachedPokemonDetail(name)));

    batchDetails.forEach(detail => {
      const baseScore = calculateNatureScore(detail.stats, nature);
      const finalScore = baseScore + (Math.random() * 15) + (Math.random() * 10);
      scored.push({
        ...detail,
        name: detail.name,
        score: finalScore,
        baseScore,
      });
    });
  }

  scored.sort((a, b) => b.score - a.score);

  const poolSize = Math.max(30, Math.floor(scored.length * 0.2));
  const topPool = scored.slice(0, poolSize);

  const team = [];
  const typeCount = {};
  let attempts = 0;
  const maxAttempts = 50;

  while (team.length < 6 && topPool.length > 0) {
    const totalScore = topPool.reduce((sum, p) => sum + p.score, 0);
    let random = Math.random() * totalScore;
    let selectedIndex = 0;
    let cumulative = 0;

    for (let i = 0; i < topPool.length; i++) {
      cumulative += topPool[i].score;
      if (random <= cumulative) {
        selectedIndex = i;
        break;
      }
    }

    const selected = topPool[selectedIndex];
    const types = selected.types;
    const tooManyOfType = types.some(t => (typeCount[t] || 0) >= 2);

    if (!tooManyOfType) {
      team.push(selected);
      types.forEach(t => { typeCount[t] = (typeCount[t] || 0) + 1; });
      topPool.splice(selectedIndex, 1);
    } else {
      topPool.splice(selectedIndex, 1);
    }

    attempts++;
    if (attempts > maxAttempts) break;
  }

  if (team.length < 6) {
    for (const pokemon of scored) {
      if (!team.includes(pokemon) && team.length < 6) team.push(pokemon);
    }
  }

  console.log(`Final team has ${team.length} Pokémon`);
  return team;
}