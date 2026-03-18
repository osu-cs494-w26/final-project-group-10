/*
 * SelectPage.jsx Pokémon picker used before a custom battle.
 * Bulk-loads all Gen 1–5 Pokémon, supports drag-and-drop and click-to-add.
 *
 * PokemonCard is imported from components/PokemonCard.jsx (shared with SaveTeamPage).
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GEN1_POKEMON, GEN2_POKEMON, GEN3_POKEMON, GEN4_POKEMON, GEN5_POKEMON, TYPE_COLORS, TYPE_BG } from '../utils/constants.js';
import { usePokemonData, fetchPokeData } from '../hooks/usePokemonData.js';
import CustomizePopup from '../components/CustomizePopup.jsx';
import PokemonCard    from '../components/PokemonCard.jsx';
import { ALL_MOVES, getOperationalMoves } from '../utils/moveEffects.js';


// pokeCache in usePokemonData is module-level, so this only ever hits the API once
// per session. The cache is module-level so it persists across page visits.
const _bulkLoaded = { done: false, promise: null };

async function bulkLoadAll(names, onProgress) {
  if (_bulkLoaded.done) { onProgress(1); return; }
  if (_bulkLoaded.promise) { await _bulkLoaded.promise; onProgress(1); return; }

  _bulkLoaded.promise = (async () => {
    const CONCURRENCY = 8; // stay well within PokeAPI rate limits
    let completed = 0;
    const total = names.length;

    async function worker(queue) {
      while (queue.length) {
        const name = queue.shift();
        try { if (name !== 'testmon') await fetchPokeData(name); } catch {}
        completed++;
        onProgress(completed / total);
      }
    }

    const queue = [...names];
    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
    _bulkLoaded.done = true;
  })();

  await _bulkLoaded.promise;
}

const ALL_POKEMON = ['testmon', ...GEN1_POKEMON, ...GEN2_POKEMON, ...GEN3_POKEMON, ...GEN4_POKEMON, ...GEN5_POKEMON];


const ALL_TYPES = [
  'normal','fire','water','grass','electric','ice','fighting','poison',
  'ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy',
];

// type → dark background

function makeTestMon() {
  return {
    name: 'testmon', id: 0,
    moves: ALL_MOVES.slice(0, 4), item: null, ability: null, friendship: 255, gender: 'm',
    cachedData: {
      id: 0,
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png',
      spriteBack: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/132.png',
      types: ['normal'], abilities: [], moves: ALL_MOVES,
      stats: [
        { name:'hp', value:125 }, { name:'attack', value:125 }, { name:'defense', value:125 },
        { name:'special-attack', value:125 }, { name:'special-defense', value:125 }, { name:'speed', value:125 },
      ],
    },
  };
}

function PartySlot({ pokemon, idx, isSelected, onClick, onDrop, onRemove, dragOver, onDragOver, onDragLeave, onCustomize }) {
  const filled = !!pokemon;
  const type   = pokemon?.cachedData?.types?.[0];
  const bg     = isSelected ? 'rgba(255,255,255,0.08)' : dragOver ? 'rgba(192,168,32,0.1)' : filled ? (TYPE_BG[type] || 'var(--grey-800)') : 'var(--grey-900)';
  const borderColor = isSelected ? '#4ade80' : dragOver ? '#c0a820' : filled ? 'var(--border-lt)' : 'var(--border)';
  const accentColor = type ? (TYPE_COLORS[type] || '#888') : 'var(--border)';

  return (
    <div
      onClick={onClick}
      onDragOver={e => { e.preventDefault(); onDragOver(idx); }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop(idx); }}
      style={{
        background: bg,
        borderTop: `1px solid ${borderColor}`,
        borderRight: `1px solid ${borderColor}`,
        borderBottom: `1px solid ${borderColor}`,
        borderLeft: `4px solid ${filled ? accentColor : (dragOver ? '#c0a820' : 'var(--border)')}`,
        padding: '10px 12px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '10px',
        transition: 'background 0.15s, border-color 0.15s',
        minHeight: '64px',
        position: 'relative',
        boxShadow: isSelected ? '0 0 0 1px var(--white)' : 'none',
      }}
    >
      {filled ? (
        <>
          {pokemon.cachedData?.sprite
            ? <img src={pokemon.cachedData.sprite} alt={pokemon.name} style={{ width:'40px', height:'40px', imageRendering:'pixelated', flexShrink:0 }} />
            : <div style={{ width:'40px', height:'40px', background:'var(--grey-700)', flexShrink:0 }} />
          }
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'13px', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--white)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {pokemon.name.replace(/-/g,' ')}
            </div>
            <div style={{ display:'flex', gap:'4px', marginTop:'3px', flexWrap:'wrap' }}>
              {pokemon.cachedData?.types?.map(t => (
                <span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', color: TYPE_COLORS[t] || '#888', letterSpacing:'0.06em', border:`1px solid ${TYPE_COLORS[t] || '#888'}`, padding:'1px 5px', background: TYPE_BG[t] || '#222' }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'4px', flexShrink:0 }}>
            <button onClick={e => { e.stopPropagation(); onCustomize(pokemon); }}
              style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', cursor:'pointer', fontSize:'13px', fontFamily:'var(--font-mono)', padding:'5px 12px', textTransform:'uppercase', transition:'all 0.1s', letterSpacing:'0.06em' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.12)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='none';}}>
              Edit
            </button>
            <button onClick={e => { e.stopPropagation(); onRemove(idx); }}
              style={{ background:'none', border:'1px solid var(--black)', color:'var(--white)', cursor:'pointer', fontSize:'22px', padding:'2px 8px', lineHeight:1, transition:'all 0.1s', fontWeight:300 }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='none';}}>
              ×
            </button>
          </div>
        </>
      ) : (
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color: dragOver ? '#c0a820' : 'var(--grey-600)', fontStyle:'italic' }}>
          {dragOver ? 'Drop here' : ' empty'}
        </span>
      )}
    </div>
  );
}

// Full-screen picker with party slots on the left and card grid on the right.
export default function SelectPage({ setPage, team, setTeam }) {
  const [search,          setSearch]          = useState('');
  const [filterType,      setFilterType]      = useState('all');
  const [customizeTarget, setCustomizeTarget] = useState(null);
  const [draggedName,     setDraggedName]     = useState(null);
  const [dragOverSlot,    setDragOverSlot]    = useState(null);
  const [selectedCard,    setSelectedCard]    = useState(null); // pokemon name from grid
  const [selectedSlot,    setSelectedSlot]    = useState(null); // party slot index

  const { pokeData, fetchBasic, batchRegisterAll } = usePokemonData();

  const teamNames = new Set(team.map(p => p.name));
  const teamFull  = team.length >= 6;

  /* Memoized filtered list so typing doesn't recompute 600 items every render */
  const filtered = React.useMemo(() => ALL_POKEMON.filter(n => {
    if (teamNames.has(n)) return false;
    const matchName = n.replace(/-/g,' ').toLowerCase().includes(search.toLowerCase().trim());
    if (!matchName) return false;
    if (n === 'testmon') return filterType === 'all' || filterType === 'normal';
    if (filterType === 'all') return true;
    const types = pokeData[n]?.types || [];
    return types.includes(filterType);
  }), [search, filterType, pokeData, team]);

  // Bulk-load all Pokemon on mount; show loading screen until done
  const [loadProgress, setLoadProgress] = useState(_bulkLoaded.done ? 1 : 0);
  const [allLoaded,    setAllLoaded]    = useState(_bulkLoaded.done);

  useEffect(() => {
    if (_bulkLoaded.done) {
      // Cache already populated just push it into this component's React state
      batchRegisterAll();
      setLoadProgress(1);
      setAllLoaded(true);
      return;
    }
    bulkLoadAll(ALL_POKEMON, (p) => setLoadProgress(p)).then(() => {
      batchRegisterAll();
      setAllLoaded(true);
    });
  }, []);


  useEffect(() => {
    team.forEach(p => { if (!p.cachedData && !pokeData[p.name]) fetchBasic(p.name); });
  }, [team]);

    const addToTeam = useCallback(async (name, slotIdx = null) => {
    if (teamNames.has(name)) return;
    if (name === 'testmon') {
      const newPoke = makeTestMon();
      setTeam(prev => {
        if (slotIdx !== null && slotIdx < 6) {
          const next = [...prev];
          if (next[slotIdx]) { next[slotIdx] = newPoke; } else { next.splice(slotIdx, 0, newPoke); }
          return next;
        }
        return prev.length < 6 ? [...prev, newPoke] : prev;
      });
      return;
    }
    const data = pokeData[name] || await fetchBasic(name) || {};
    const fullData = await fetchPokeData(name);
    const opMoves = getOperationalMoves(fullData.moves);
    const defaultMoves = opMoves.length >= 2 ? opMoves : (fullData.moves || []).slice(0, 4);
    const newPoke = {
      name, id: fullData.id,
      moves: defaultMoves, item: null,
      ability: fullData.abilities?.[0] || null,
      cachedData: fullData,
    };
    setTeam(prev => {
      if (slotIdx !== null && slotIdx < 6) {
        const next = [...prev];
        // If slot occupied, replace; otherwise insert
        if (next[slotIdx]) {
          next[slotIdx] = newPoke;
        } else {
          // Fill empty slot at that index
          while (next.length <= slotIdx) next.push(null);
          next[slotIdx] = newPoke;
          return next.filter(Boolean);
        }
        return next;
      }
      if (prev.length >= 6) return prev;
      return [...prev, newPoke];
    });
  }, [pokeData, teamNames]);

    const handleDrop = useCallback(async (slotIdx) => {
    if (!draggedName) return;
    if (!teamNames.has(draggedName)) {
      await addToTeam(draggedName, slotIdx);
    }
    setDraggedName(null);
    setDragOverSlot(null);
    setSelectedCard(null);
    setSelectedSlot(null);
  }, [draggedName, teamNames, addToTeam]);

    const handleCardClick = useCallback(async (name) => {
    if (teamNames.has(name)) return; // already in team
    if (selectedSlot !== null) {
      // Place into selected slot
      await addToTeam(name, selectedSlot);
      setSelectedSlot(null);
      setSelectedCard(null);
    } else {
      setSelectedCard(prev => prev === name ? null : name);
    }
  }, [selectedSlot, teamNames, addToTeam]);

  const handleSlotClick = useCallback(async (slotIdx) => {
    if (selectedCard !== null) {
      await addToTeam(selectedCard, slotIdx);
      setSelectedCard(null);
      setSelectedSlot(null);
    } else if (selectedSlot !== null && selectedSlot !== slotIdx) {
      // Swap two party slots
      setTeam(prev => {
        const next = [...prev];
        [next[selectedSlot], next[slotIdx]] = [next[slotIdx], next[selectedSlot]];
        return next.filter(Boolean);
      });
      setSelectedSlot(null);
    } else {
      setSelectedSlot(prev => prev === slotIdx ? null : slotIdx);
    }
  }, [selectedCard, selectedSlot, addToTeam]);

  const handleRemove = useCallback((idx) => {
    setTeam(prev => { const next = [...prev]; next.splice(idx, 1); return next; });
    if (selectedSlot === idx) setSelectedSlot(null);
  }, [selectedSlot]);

  const handleSave = (updated) =>
    setTeam(prev => prev.map(p => p.name === updated.name ? updated : p));

  /* Stable ref callbacks so PokemonCard memo is never busted by inline arrow functions */
  const cardClickRef = useRef(null);
  const cardAddRef   = useRef(null);
  const dragStartRef = useRef(null);
  const dragEndRef   = useRef(null);
  cardClickRef.current = handleCardClick;
  cardAddRef.current   = (name) => addToTeam(name);
  dragStartRef.current = setDraggedName;
  dragEndRef.current   = () => setDraggedName(null);

  const stableCardClick  = useCallback((name) => cardClickRef.current(name),  []);
  const stableCardAdd    = useCallback((name) => cardAddRef.current(name),    []);
  const stableDragStart  = useCallback((name) => dragStartRef.current(name),  []);
  const stableDragEnd    = useCallback(() => dragEndRef.current(),            []);

  const canStart = team.length === 6;

  const hintText = selectedCard
    ? `"${selectedCard.replace(/-/g,' ')}" selected click a party slot to place it`
    : selectedSlot !== null
    ? `Slot ${selectedSlot + 1} selected click another slot to swap, or click a Pokemon to add`
    : 'Click or drag a Pokemon to add it to your party';

    if (!allLoaded) {
    const pct = Math.round(loadProgress * 100);
    const loaded = Math.round(loadProgress * ALL_POKEMON.length);
    return (
      <div style={{ height:'calc(100vh - var(--nav-h))', background:'var(--black)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'32px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'28px', letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--white)' }}>Loading Pokédex</div>
        <div style={{ width:'360px', display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ background:'var(--grey-800)', height:'6px', width:'100%' }}>
            <div style={{ background:'#4ade80', height:'100%', width:`${pct}%`, transition:'width 0.1s' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-400)' }}>
            <span>{loaded} / {ALL_POKEMON.length} Pokemon</span>
            <span>{pct}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-page-scroll" style={{ height:'calc(100vh - var(--nav-h))', background:'var(--black)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ background:'var(--grey-900)', borderBottom:'1px solid var(--border)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <button onClick={() => setPage('battlemode')}
          style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='none';}}>
          &larr; Back
        </button>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'20px', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--white)' }}>Build Your Team</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color: (selectedCard || selectedSlot !== null) ? '#c0a820' : 'var(--grey-500)', transition:'color 0.2s', marginTop:'2px' }}>{hintText}</div>
        </div>
        <button disabled={!canStart} onClick={() => canStart && setPage('battle')}
          style={{ background: canStart ? 'var(--white)' : 'var(--grey-900)', border:`1px solid ${canStart ? 'var(--white)' : 'var(--border)'}`, color: canStart ? 'var(--black)' : 'var(--grey-600)', padding:'8px 24px', cursor: canStart ? 'pointer' : 'not-allowed', fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s' }}
          onMouseEnter={e=>{if(canStart)e.currentTarget.style.background='var(--grey-100)';}}
          onMouseLeave={e=>{if(canStart)e.currentTarget.style.background='var(--white)';}}>
          {canStart ? 'Start Battle' : `${team.length} / 6`}
        </button>
      </div>

      {/* Three panel layout: party | grid. Stacks vertically on mobile via CSS class. */}
      <div className="battle-builder-layout">

        {/* Left: Party */}
        <div className="battle-builder-party">
          <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--grey-400)' }}>Your Party</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-500)' }}>{team.length} / 6</span>
          </div>

          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'6px', padding:'12px', overflowY:'auto' }}>
            {[0,1,2,3,4,5].map(idx => (
              <PartySlot
                key={idx}
                pokemon={team[idx] || null}
                idx={idx}
                isSelected={selectedSlot === idx}
                dragOver={dragOverSlot === idx}
                onClick={() => handleSlotClick(idx)}
                onDrop={handleDrop}
                onRemove={handleRemove}
                onDragOver={setDragOverSlot}
                onDragLeave={() => setDragOverSlot(null)}
                onCustomize={setCustomizeTarget}
              />
            ))}
          </div>

          {/* Dev button */}
          <div style={{ padding:'10px 12px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
            <button onClick={() => {
              const slots = 6 - team.length;
              if (slots <= 0) return;
              const newMons = Array.from({ length: slots }, (_, i) => ({
                ...makeTestMon(),
                name: i === 0 && !teamNames.has('testmon') ? 'testmon' : `testmon-${team.length + i + 1}`,
              }));
              setTeam(prev => [...prev, ...newMons]);
            }} disabled={teamFull}
              style={{ width:'100%', background:'transparent', border:'1px solid var(--border-mid)', color: teamFull ? 'var(--grey-700)' : 'var(--grey-400)', padding:'8px', cursor: teamFull ? 'not-allowed' : 'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase' }}>
              Fill with Test Mons
            </button>
          </div>
        </div>

        {/* ── Right: Pokemon grid ──────────────────────────────────────────── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Filter bar */}
          <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', background:'var(--grey-900)', display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center', flexShrink:0 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Pokemon..."
              style={{ background:'var(--grey-800)', border:'1px solid var(--border-mid)', padding:'6px 12px', color:'var(--white)', fontSize:'12px', fontFamily:'var(--font-mono)', outline:'none', width:'160px', flexShrink:0 }}
              onFocus={e=>e.target.style.borderColor='var(--border-lt)'}
              onBlur={e=>e.target.style.borderColor='var(--border-mid)'} />

            <button onClick={() => setFilterType('all')}
              style={{ padding:'5px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.04em', background: filterType==='all' ? 'var(--grey-600)' : 'var(--grey-900)', border:`1px solid ${filterType==='all' ? 'var(--border-lt)' : 'var(--border-mid)'}`, color:'var(--white)', transition:'all 0.1s' }}>
              All
            </button>
            {ALL_TYPES.map(t => (
              <button key={t} onClick={() => setFilterType(filterType === t ? 'all' : t)}
                style={{ padding:'5px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.04em', background: filterType===t ? (TYPE_BG[t]||'#333') : 'var(--grey-900)', border:`1px solid ${filterType===t ? (TYPE_COLORS[t]||'#555') : 'var(--border-mid)'}`, color:'var(--white)', transition:'all 0.1s' }}>
                {t}
              </button>
            ))}
          </div>

          {/* Card grid */}
          <div style={{ flex:1, overflowY:'auto', padding:'12px 14px' }}>
            {filtered.length === 0 ? (
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-500)', textAlign:'center', paddingTop:'60px' }}>No Pokemon match your filters</div>
            ) : (
              <div className={`grid-5col${teamFull ? " team-full" : ""}`}>
                {filtered.map(name => (
                  <PokemonCard
                    key={name}
                    name={name}
                    cardData={pokeData[name]}
                    isDragging={draggedName === name}
                    isSelected={selectedCard === name}
                    onDragStart={stableDragStart}
                    onDragEnd={stableDragEnd}
                    onClick={stableCardClick}
                    onAdd={stableCardAdd}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={{ padding:'6px 14px', borderTop:'1px solid var(--border)', fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-600)', flexShrink:0 }}>
            {filtered.length} Pokemon
            {(selectedCard || selectedSlot !== null) && (
              <button onClick={() => { setSelectedCard(null); setSelectedSlot(null); }}
                style={{ marginLeft:'16px', background:'none', border:'1px solid var(--border-mid)', color:'var(--grey-400)', padding:'2px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase' }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {customizeTarget && (
        <CustomizePopup pokemon={customizeTarget} onClose={() => setCustomizeTarget(null)} onSave={handleSave} />
      )}
    </div>
  );
}
