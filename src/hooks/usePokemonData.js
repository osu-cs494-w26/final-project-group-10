/*
 * usePokemonData.js Module-level cache and React hook for Pokémon and move data.
 * fetchPokeData / fetchMoveData hit PokeAPI once then serve from cache forever.
 * Now uses animated sprites from Generation V as the primary sprite.
 */

import { useState, useCallback, useRef } from 'react';

// Global cache shared across all hook instances. Persists for the entire session.
export const pokeCache = {};  /* name -> full pokemon data */
const moveCache = {};  /* moveName -> { type, power, pp, category, effect, flavor } */
const abilityCache = {}; /* abilityUrl -> { desc } */

/* Fetch full pokemon data from PokeAPI and cache it globally for the session */
export async function fetchPokeData(name) {
  if (pokeCache[name]) return pokeCache[name];

  // Testmon is a local dummy and never hits the API.
  if (name.startsWith('testmon')) {
    const entry = {
      id: 0, name,
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png', // static fallback
      spriteBack: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/132.png',
      types: ['normal'], abilities: [],
      stats: [
        { name:'hp', value:255 }, { name:'attack', value:255 },
        { name:'defense', value:255 }, { name:'special-attack', value:255 },
        { name:'special-defense', value:255 }, { name:'speed', value:255 },
      ],
      moves: [],
    };
    pokeCache[name] = entry;
    return entry;
  }

  const res  = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const data = await res.json();

  // Fetches all abilities in parallel and attaches descriptions.
  const abilities = await Promise.all(data.abilities.map(async a => {
    try {
      if (abilityCache[a.ability.url]) return { name: a.ability.name, isHidden: a.is_hidden, desc: abilityCache[a.ability.url] };
      const r = await fetch(a.ability.url);
      const d = await r.json();
      const eng = d.effect_entries?.find(e => e.language.name === 'en');
      const desc = eng?.short_effect || '';
      abilityCache[a.ability.url] = desc;
      return { name: a.ability.name, isHidden: a.is_hidden, desc };
    } catch { return { name: a.ability.name, isHidden: a.is_hidden, desc: '' }; }
  }));

  const entry = {
    id:           data.id,
    name:         data.name,
    sprite:       primarySprite, // This will be animated if available
    spriteBack:   data.sprites.back_default,
    types:        data.types.map(t => t.type.name),
    stats:        data.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
    moves:        data.moves.map(m => m.move.name.replace(/-/g, ' ')),
    abilities,
    // Keep these for reference if needed
    animatedSprite,
    staticSprite,
    height:       data.height,   
    weight:       data.weight
  };
  pokeCache[name] = entry;
  return entry;
}

/* Custom effect descriptions that override PokeAPI text */
const MOVE_EFFECT_OVERRIDES = {
  'moonlight':   'Heal the user for 25% of max health or 50% if a weather effect is in play.',
  'autotomize':  'Raises the user\'s speed by two stages.',
};

/* Move name overrides: PokeAPI uses different slugs for some moves */
const MOVE_NAME_OVERRIDES = {
  "land's wrath":  'lands-wrath',
  "forest's curse":'forests-curse',
  'hi jump kick':  'high-jump-kick',
  'softboiled':    'soft-boiled',
  'thundershock':  'thunder-shock',
  'vicegrip':      'vise-grip',
};

/* Fetches a move's type, power, PP, and effect text, then caches it. */
export async function fetchMoveData(moveName) {
  if (moveCache[moveName]) return moveCache[moveName];
  try {
    const slug = MOVE_NAME_OVERRIDES[moveName] || moveName.replace(/ /g, '-');
    const res  = await fetch(`https://pokeapi.co/api/v2/move/${slug}`);
    const data = await res.json();
    const engEffect = data.effect_entries?.find(e => e.language.name === 'en');
    const engFlavor = data.flavor_text_entries?.find(e => e.language.name === 'en');
    const entry = {
      name:     data.name.replace(/-/g, ' '),
      type:     data.type?.name || 'normal',
      power:    data.power || 0,
      pp:       data.pp || 10,
      accuracy: data.accuracy || 100,
      priority: data.priority || 0,
      category: data.damage_class?.name || 'physical',
      effect:   MOVE_EFFECT_OVERRIDES[moveName] || (engEffect?.short_effect || '').replace(/\$effect_chance/g, data.effect_chance || ''),
      flavor:   (engFlavor?.flavor_text || '').replace(/[\n\f]/g, ' '),
    };
    moveCache[moveName] = entry;
    return entry;
  } catch {
    const fallback = { name: moveName, type:'normal', power:0, pp:10, accuracy:100, priority:0, category:'physical', effect:'', flavor:'' };
    moveCache[moveName] = fallback;
    return fallback;
  }
}

/*
 * React hook exposing a lightweight tick-based update signal.
 * Components read directly from pokeCache (module level) so React state
 * never holds a 600-entry object. Only a counter triggers re-renders.
 */
export function usePokemonData() {
  // Single integer tick. Incrementing it forces a re-render to pick up new cache entries.
  const [tick, setTick] = useState(0);
  const loading = useRef(new Set());

  const bumpTick = useCallback(() => setTick(t => t + 1), []);

  const fetchBasic = useCallback(async (name) => {
    if (pokeCache[name]) return;
    if (loading.current.has(name)) return;
    loading.current.add(name);
    try {
      await fetchPokeData(name);
      bumpTick();
    } catch(e) { console.error('Failed fetchBasic', name, e); }
    loading.current.delete(name);
  }, [bumpTick]);

  // Prefetches full data for a Pokémon including all move types.
  const prefetchFull = useCallback(async (name) => {
    const data = await fetchPokeData(name);
    data.moves.slice(0, 120).forEach(m => fetchMoveData(m));
    bumpTick();
    return data;
  }, []);

  // Push all globally-cached pokemon into React state in one batch
  const batchRegisterAll = useCallback((names) => {
    setSprites(prev => {
      const newSprites = { ...prev };
      names.forEach(n => { if (pokeCache[n]) newSprites[n] = pokeCache[n].sprite; });
      return newSprites;
    });
    setPokeData(prev => {
      const newData = { ...prev };
      names.forEach(n => { if (pokeCache[n]) newData[n] = pokeCache[n]; });
      return newData;
    });
  }, []);

  return { sprites, pokeData, fetchBasic, prefetchFull, batchRegisterAll };
}
