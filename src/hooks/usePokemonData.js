// Global cache + React hook for fetching Pokemon and move data from PokeAPI.

import { useState, useCallback, useRef } from 'react';

// Global cache shared across all hook instances - persists for the session
const pokeCache = {};  // name -> full pokemon data
const moveCache = {};  // moveName -> { type, power, pp, category, effect, flavor }
const abilityCache = {}; // abilityUrl -> { desc }

// Fetch full pokemon data from PokeAPI and cache it globally for the session
export async function fetchPokeData(name) {
  if (pokeCache[name]) return pokeCache[name];
  const res  = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const data = await res.json();

  // Fetch abilities in parallel
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
    sprite:       data.sprites.front_default,  // I am using pixel sprite for consistency but we can change this
    spritePixel:  data.sprites.front_default,
    spriteArt:    data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
    spriteBack:   data.sprites.back_default,
    types:        data.types.map(t => t.type.name),
    stats:        data.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
    moves:        data.moves.map(m => m.move.name.replace(/-/g, ' ')),
    abilities,
  };
  pokeCache[name] = entry;
  return entry;
}

// Fetch a single move's type/power/pp/effect and cache it globally
export async function fetchMoveData(moveName) {
  if (moveCache[moveName]) return moveCache[moveName];
  try {
    const res  = await fetch(`https://pokeapi.co/api/v2/move/${moveName.replace(/ /g, '-')}`);
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
      effect:   (engEffect?.short_effect || '').replace(/\$effect_chance/g, data.effect_chance || ''),
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

// React hook that exposes sprite/data state and fetch helpers to components
export function usePokemonData() {
  const [sprites,  setSprites]  = useState({});
  const [pokeData, setPokeData] = useState({});
  const loading = useRef(new Set());

  const fetchBasic = useCallback(async (name) => {
    if (sprites[name] || loading.current.has(name)) return;
    loading.current.add(name);
    try {
      const data = await fetchPokeData(name);
      setSprites(p  => ({ ...p, [name]: data.sprite }));
      setPokeData(p => ({ ...p, [name]: data }));
    } catch(e) { console.error('Failed fetchBasic', name, e); }
    loading.current.delete(name);
  }, [sprites]);

  // Pre-fetch full data for a pokemon including all move types (first 100 moves)
  // Fetch all data for a pokemon + kick off move type fetches in background
  const prefetchFull = useCallback(async (name) => {
    const data = await fetchPokeData(name);
    setSprites(p  => ({ ...p, [name]: data.sprite }));
    setPokeData(p => ({ ...p, [name]: data }));
    // Kick off move type fetches in background (don't await)
    data.moves.slice(0, 120).forEach(m => fetchMoveData(m));
    return data;
  }, []);

  return { sprites, pokeData, fetchBasic, prefetchFull };
}
