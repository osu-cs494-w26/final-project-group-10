/*
 * SaveTeamPage.jsx Team builder. Players drag/click Pokémon into
 * party slots, customise them, then save to one of 10 Supabase slots.
 *
 * Extracted into their own files:
 *   SaveSlotPanel  → components/SaveSlotPanel.jsx
 *   PokemonCard    → components/PokemonCard.jsx
 *   VirtualGrid    → components/VirtualGrid.jsx
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GEN1_POKEMON, GEN2_POKEMON, GEN3_POKEMON, GEN4_POKEMON, GEN5_POKEMON, TYPE_COLORS, TYPE_BG } from '../utils/constants.js';
import { usePokemonData, fetchPokeData } from '../hooks/usePokemonData.js';
import useIsMobile    from '../hooks/useIsMobile.js';
import CustomizePopup from '../components/CustomizePopup.jsx';
import SaveSlotPanel  from '../components/SaveSlotPanel.jsx';
import PokemonCard    from '../components/PokemonCard.jsx';
import VirtualGrid    from '../components/VirtualGrid.jsx';
import { ALL_MOVES, getOperationalMoves } from '../utils/moveEffects.js';
import { supabase }   from '../utils/supabaseClient.js';

const _bulkLoaded = { done: false, promise: null };
async function bulkLoadAll(names, onProgress) {
  if (_bulkLoaded.done) { onProgress(1); return; }
  if (_bulkLoaded.promise) { await _bulkLoaded.promise; onProgress(1); return; }
  _bulkLoaded.promise = (async () => {
    const CONCURRENCY = 8;
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
const ALL_TYPES   = ['normal','fire','water','grass','electric','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];

function makeTestMon() {
  return {
    name: 'testmon', id: 0, moves: ALL_MOVES.slice(0, 4), item: null, ability: null, friendship: 255, gender: 'm',
    cachedData: {
      id: 0, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png',
      spriteBack: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/132.png',
      types: ['normal'], abilities: [], moves: ALL_MOVES,
      stats: [
        { name:'hp', value:125 }, { name:'attack', value:125 }, { name:'defense', value:125 },
        { name:'special-attack', value:125 }, { name:'special-defense', value:125 }, { name:'speed', value:125 },
      ],
    },
  };
}

function MiniPartySlot({ pokemon, idx, isSelected, onClick }) {
  const type = pokemon?.cachedData?.types?.[0];
  const bg   = isSelected ? 'rgba(255,255,255,0.12)' : pokemon ? (TYPE_BG[type] || 'var(--grey-800)') : 'var(--grey-900)';
  const border = isSelected ? '#4ade80' : pokemon ? (TYPE_COLORS[type] || 'var(--border-lt)') : 'var(--border)';
  return (
    <div onClick={onClick} style={{ background:bg, border:`1px solid ${border}`, borderLeft:`3px solid ${border}`, width:'52px', height:'52px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, position:'relative', transition:'all 0.15s' }}>
      {pokemon?.cachedData?.sprite
        ? <img src={pokemon.cachedData.sprite} alt={pokemon.name} style={{ width:'40px', height:'40px', imageRendering:'pixelated' }} />
        : <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-600)' }}>{idx + 1}</span>}
      {isSelected && <div style={{ position:'absolute', inset:0, boxShadow:'0 0 0 2px #4ade80 inset', pointerEvents:'none' }} />}
    </div>
  );
}

// Single party slot showing sprite, types, and an Edit button.
function PartySlot({ pokemon, idx, isSelected, onClick, onDrop, onRemove, dragOver, onDragOver, onDragLeave, onCustomize }) {
  const filled = !!pokemon;
  const type   = pokemon?.cachedData?.types?.[0];
  const bg     = isSelected ? 'rgba(255,255,255,0.08)' : dragOver ? 'rgba(192,168,32,0.1)' : filled ? (TYPE_BG[type] || 'var(--grey-800)') : 'var(--grey-900)';
  const borderColor = isSelected ? '#4ade80' : dragOver ? '#c0a820' : filled ? 'var(--border-lt)' : 'var(--border)';
  const accentColor = type ? (TYPE_COLORS[type] || '#888') : 'var(--border)';

  return (
    <div onClick={onClick} onDragOver={e => { e.preventDefault(); onDragOver(idx); }} onDragLeave={onDragLeave} onDrop={e => { e.preventDefault(); onDrop(idx); }}
      style={{ background:bg, borderTop:`1px solid ${borderColor}`, borderRight:`1px solid ${borderColor}`, borderBottom:`1px solid ${borderColor}`, borderLeft:`4px solid ${filled ? accentColor : (dragOver ? '#c0a820' : 'var(--border)')}`, padding:'10px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', transition:'background 0.15s, border-color 0.15s', minHeight:'64px', position:'relative', boxShadow: isSelected ? '0 0 0 1px var(--white)' : 'none' }}>
      {filled ? (
        <>
          {pokemon.cachedData?.sprite
            ? <img src={pokemon.cachedData.sprite} alt={pokemon.name} style={{ width:'40px', height:'40px', imageRendering:'pixelated', flexShrink:0 }} />
            : <div style={{ width:'40px', height:'40px', background:'var(--grey-700)', flexShrink:0 }} />}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'13px', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--white)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pokemon.name.replace(/-/g,' ')}</div>
            <div style={{ display:'flex', gap:'4px', marginTop:'3px', flexWrap:'wrap' }}>
              {pokemon.cachedData?.types?.map(t => (
                <span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', color: TYPE_COLORS[t] || '#888', letterSpacing:'0.06em', border:`1px solid ${TYPE_COLORS[t] || '#888'}`, padding:'1px 5px', background: TYPE_BG[t] || '#222' }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'4px', flexShrink:0 }}>
            <button onClick={e => { e.stopPropagation(); onCustomize(pokemon); }} style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', cursor:'pointer', fontSize:'13px', fontFamily:'var(--font-mono)', padding:'5px 12px', textTransform:'uppercase', transition:'all 0.1s', letterSpacing:'0.06em' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>Edit</button>
            <button onClick={e => { e.stopPropagation(); onRemove(idx); }} style={{ background:'none', border:'1px solid var(--black)', color:'var(--white)', cursor:'pointer', fontSize:'22px', padding:'2px 8px', lineHeight:1, transition:'all 0.1s', fontWeight:300 }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>×</button>
          </div>
        </>
      ) : (
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color: dragOver ? '#c0a820' : 'var(--grey-600)', fontStyle:'italic' }}>{dragOver ? 'Drop here' : ' empty'}</span>
      )}
    </div>
  );
}

/* Main builder: Pokémon grid on the left, party slots on the right. */
export default function SaveTeamPage({ setPage, user }) {
  const [team,            setTeam]            = useState([]);
  const [search,          setSearch]          = useState('');
  const [filterType,      setFilterType]      = useState('all');
  const [customizeTarget, setCustomizeTarget] = useState(null);
  const [draggedName,     setDraggedName]     = useState(null);
  const [dragOverSlot,    setDragOverSlot]    = useState(null);
  const [selectedCard,    setSelectedCard]    = useState(null);
  const [selectedSlot,    setSelectedSlot]    = useState(null);
  const [loadProgress,    setLoadProgress]    = useState(_bulkLoaded.done ? 1 : 0);
  const [allLoaded,       setAllLoaded]       = useState(_bulkLoaded.done);
  const [slots,           setSlots]           = useState(Array(10).fill(null));
  const [saving,          setSaving]          = useState(false);
  const [saveMsg,         setSaveMsg]         = useState('');
  const [teamName,        setTeamName]        = useState('');

  const { pokeData, fetchBasic, batchRegisterAll } = usePokemonData();
  const teamNames = new Set(team.map(p => p.name));
  const teamFull  = team.length >= 6;
  const isMobile  = useIsMobile();

  const [filterOpen,    setFilterOpen]    = useState(false);
  const [saveSlotOpen,  setSaveSlotOpen]  = useState(false);

  // Load saved slots from Supabase
  useEffect(() => {
    if (!user) return;
    supabase
      .from('team_slots')
      .select('*')
      .eq('user_id', user.id)
      .order('slot_index')
      .then(({ data, error }) => {
        if (error) { console.error(error); return; }
        const filled = Array(10).fill(null);
        (data || []).forEach(row => {
          if (row.slot_index >= 0 && row.slot_index < 10) filled[row.slot_index] = row;
        });
        setSlots(filled);
      });
  }, [user]);

  // Bulk load Pokédex
  useEffect(() => {
    if (_bulkLoaded.done) { batchRegisterAll(); setLoadProgress(1); setAllLoaded(true); return; }
    bulkLoadAll(ALL_POKEMON, p => setLoadProgress(p)).then(() => { batchRegisterAll(); setAllLoaded(true); });
  }, []);

  useEffect(() => {
    team.forEach(p => { if (!p.cachedData && !pokeData[p.name]) fetchBasic(p.name); });
  }, [team]);

  /* Memoized filtered list so typing/clicking doesn't recompute 600 items every render */
  const filtered = React.useMemo(() => ALL_POKEMON.filter(n => {
    if (teamNames.has(n)) return false;
    if (!n.replace(/-/g,' ').toLowerCase().includes(search.toLowerCase().trim())) return false;
    if (n === 'testmon') return filterType === 'all' || filterType === 'normal';
    if (filterType === 'all') return true;
    return (pokeData[n]?.types || []).includes(filterType);
  }), [search, filterType, pokeData, team]);

  const addToTeam = useCallback(async (name, slotIdx = null) => {
    if (teamNames.has(name)) return;
    if (name === 'testmon') {
      const newPoke = makeTestMon();
      setTeam(prev => { if (prev.length < 6) return [...prev, newPoke]; return prev; });
      return;
    }
    const fullData = await fetchPokeData(name);
    const opMoves  = getOperationalMoves(fullData.moves);
    const newPoke  = { name, id: fullData.id, moves: opMoves.length >= 2 ? opMoves : (fullData.moves || []).slice(0, 4), item: null, ability: fullData.abilities?.[0] || null, cachedData: fullData, evs: { hp:0, attack:0, defense:0, 'special-attack':0, 'special-defense':0, speed:0 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } };
    setTeam(prev => {
      if (slotIdx !== null && slotIdx < 6) { const next = [...prev]; if (next[slotIdx]) { next[slotIdx] = newPoke; } else { while (next.length <= slotIdx) next.push(null); next[slotIdx] = newPoke; return next.filter(Boolean); } return next; }
      if (prev.length >= 6) return prev;
      return [...prev, newPoke];
    });
  }, [pokeData, teamNames]);

  const handleDrop = useCallback(async (slotIdx) => {
    if (!draggedName || teamNames.has(draggedName)) return;
    await addToTeam(draggedName, slotIdx);
    setDraggedName(null); setDragOverSlot(null); setSelectedCard(null); setSelectedSlot(null);
  }, [draggedName, teamNames, addToTeam]);

  const handleCardClick = useCallback(async (name) => {
    if (teamNames.has(name)) return;
    if (selectedSlot !== null) { await addToTeam(name, selectedSlot); setSelectedSlot(null); setSelectedCard(null); }
    else { setSelectedCard(prev => prev === name ? null : name); }
  }, [selectedSlot, teamNames, addToTeam]);

  const handleSlotClick = useCallback(async (slotIdx) => {
    if (selectedCard !== null) { await addToTeam(selectedCard, slotIdx); setSelectedCard(null); setSelectedSlot(null); }
    else if (selectedSlot !== null && selectedSlot !== slotIdx) { setTeam(prev => { const next=[...prev]; [next[selectedSlot],next[slotIdx]]=[next[slotIdx],next[selectedSlot]]; return next.filter(Boolean); }); setSelectedSlot(null); }
    else { setSelectedSlot(prev => prev === slotIdx ? null : slotIdx); }
  }, [selectedCard, selectedSlot, addToTeam]);

  const handleRemove = useCallback((idx) => {
    setTeam(prev => { const next=[...prev]; next.splice(idx,1); return next; });
    if (selectedSlot === idx) setSelectedSlot(null);
  }, [selectedSlot]);

  const handleSave = (updated) => setTeam(prev => prev.map(p => p.name === updated.name ? updated : p));

  /* Stable ref callbacks so PokemonCard memo is never busted by inline arrow functions.
     The ref holds the latest version of handleCardClick and addToTeam without
     causing child re-renders when the parent state changes. */
  const cardClickRef = useRef(null);
  const cardAddRef   = useRef(null);
  const dragStartRef = useRef(null);
  const dragEndRef   = useRef(null);
  cardClickRef.current = handleCardClick;
  cardAddRef.current   = (name) => addToTeam(name);
  dragStartRef.current = setDraggedName;
  dragEndRef.current   = () => setDraggedName(null);

  /* These stable wrappers never change identity so memo stays intact */
  const stableCardClick  = useCallback((name) => cardClickRef.current(name),  []);
  const stableCardAdd    = useCallback((name) => cardAddRef.current(name),    []);
  const stableDragStart  = useCallback((name) => dragStartRef.current(name),  []);
  const stableDragEnd    = useCallback(() => dragEndRef.current(),            []);

  // Save team to a slot
  const saveToSlot = async (slotIdx) => {
    if (team.length !== 6 || !user) return;
    setSaving(true);
    setSaveMsg('');

    // Serialize strip cachedData sprites to keep payload light, keep moves/item/ability
    const pokemon = team.map(p => ({
      name: p.name,
      id: p.id,
      moves: p.moves,
      item: p.item,
      ability: p.ability,
      types: p.cachedData?.types || [],
      sprite: p.cachedData?.sprite || null,
      evs: p.evs || { hp:0, attack:0, defense:0, 'special-attack':0, 'special-defense':0, speed:0 },
      ivs: p.ivs || { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 },
    }));

    const payload = {
      user_id: user.id,
      slot_index: slotIdx,
      name: teamName.trim() || `Team ${slotIdx + 1}`,
      pokemon,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('team_slots')
      .upsert(payload, { onConflict: 'user_id,slot_index' });

    if (error) {
      setSaveMsg(`Error: ${error.message}`);
    } else {
      setSaveMsg(`Saved to Slot ${slotIdx + 1}!`);
      setSlots(prev => { const next = [...prev]; next[slotIdx] = payload; return next; });
      setTimeout(() => setSaveMsg(''), 2500);
    }
    setSaving(false);
  };

  // Load a slot into the builder
  const loadFromSlot = async (slotIdx) => {
    const slot = slots[slotIdx];
    if (!slot?.pokemon) return;

    const rehydrated = await Promise.all(slot.pokemon.map(async p => {
      try {
        const full = await fetchPokeData(p.name);
        return { ...p, cachedData: full };
      } catch {
        return { ...p, cachedData: { sprite: p.sprite, types: p.types || [], moves: p.moves || [] } };
      }
    }));
    setTeam(rehydrated);
    setSaveMsg(`Loaded Slot ${slotIdx + 1}`);
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const deleteSlot = async (slotIdx) => {
    if (!user) return;
    const { error } = await supabase
      .from('team_slots')
      .delete()
      .eq('user_id', user.id)
      .eq('slot_index', slotIdx);
    if (!error) {
      setSlots(prev => { const next = [...prev]; next[slotIdx] = null; return next; });
      setSaveMsg(`Slot ${slotIdx + 1} deleted`);
      setTimeout(() => setSaveMsg(''), 2000);
    }
  };

  const hintText = selectedCard
    ? `"${selectedCard.replace(/-/g,' ')}" selected click a party slot`
    : selectedSlot !== null
    ? `Slot ${selectedSlot + 1} selected click slot to swap or Pokémon to add`
    : 'Click or drag a Pokémon to add it to your party';

    if (!allLoaded) {
    const pct    = Math.round(loadProgress * 100);
    const loaded = Math.round(loadProgress * ALL_POKEMON.length);
    return (
      <div style={{ height:'calc(100vh - var(--nav-h))', background:'var(--black)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'32px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'28px', letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--white)' }}>Loading Pokédex</div>
        <div style={{ width:'360px', display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ background:'var(--grey-800)', height:'6px', width:'100%' }}>
            <div style={{ background:'#4ade80', height:'100%', width:`${pct}%`, transition:'width 0.1s' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-400)' }}>
            <span>{loaded} / {ALL_POKEMON.length} Pokémon</span>
            <span>{pct}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-page-scroll" style={{ height:'calc(100vh - var(--nav-h))', background:'var(--black)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ background:'var(--grey-900)', borderBottom:'1px solid var(--border)', padding:'8px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, gap:'8px' }}>
        <button onClick={() => setPage('battlemode')} style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', padding:'8px 14px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'12px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s', flexShrink:0 }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>← Back</button>
        <div style={{ textAlign:'center', flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'16px', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--white)' }}>Save Team</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:(selectedCard || selectedSlot !== null) ? '#c0a820' : 'var(--grey-500)', transition:'color 0.2s', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{saveMsg || hintText}</div>
        </div>
        {/* Save Slots button: mobile shows a dropdown trigger */}
        {isMobile ? (
          <button onClick={() => setSaveSlotOpen(o => !o)} style={{ background: saveSlotOpen ? 'rgba(64,144,208,0.2)' : 'none', border:'1px solid #4090d0', color:'#4090d0', padding:'8px 12px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', flexShrink:0 }}>
            Save {saveSlotOpen ? '▲' : '▼'}
          </button>
        ) : (
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color: team.length === 6 ? '#4ade80' : 'var(--grey-500)', flexShrink:0 }}>
            {team.length} / 6 {team.length === 6 ? ' Ready' : ''}
          </div>
        )}
      </div>

      {/* Mobile save slot dropdown overlay */}
      {isMobile && saveSlotOpen && (
        <SaveSlotPanel slots={slots} currentTeam={team} onSave={saveToSlot} onLoad={loadFromSlot} onDelete={deleteSlot} saving={saving} teamName={teamName} onTeamNameChange={setTeamName} isMobileDropdown={true} onClose={() => setSaveSlotOpen(false)} />
      )}

      {isMobile ? (
        /* Mobile layout: narrow party column on left, Pokémon grid on right */
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

          {/* Left: compact mini party column */}
          <div style={{ width:'60px', flexShrink:0, borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', padding:'6px 4px', overflowY:'auto', background:'var(--grey-900)' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'8px', color:'var(--grey-600)', textTransform:'uppercase', marginBottom:'2px', letterSpacing:'0.08em' }}>{team.length}/6</div>
            {[0,1,2,3,4,5].map(idx => (
              <MiniPartySlot key={idx} pokemon={team[idx]||null} idx={idx} isSelected={selectedSlot===idx} onClick={() => handleSlotClick(idx)} />
            ))}
            {/* Edit and Delete buttons when a filled slot is selected */}
            {selectedSlot !== null && team[selectedSlot] && (
              <>
                <button onClick={() => setCustomizeTarget(team[selectedSlot])} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid var(--border-lt)', color:'var(--white)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', padding:'3px 6px', marginTop:'4px', width:'52px', textTransform:'uppercase' }}>Edit</button>
                <button onClick={() => { handleRemove(selectedSlot); setSelectedSlot(null); }} style={{ background:'rgba(200,50,50,0.2)', border:'1px solid #c03030', color:'#ff6060', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', padding:'3px 6px', marginTop:'2px', width:'52px', textTransform:'uppercase' }}>Del</button>
              </>
            )}
          </div>

          {/* Right: Pokémon grid with filter bar */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

            {/* Filter bar: search + dropdown trigger */}
            <div style={{ padding:'6px 8px', borderBottom:'1px solid var(--border)', background:'var(--grey-900)', display:'flex', gap:'6px', alignItems:'center', flexShrink:0 }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ flex:1, background:'var(--grey-800)', border:'1px solid var(--border-mid)', padding:'5px 8px', color:'var(--white)', fontSize:'11px', fontFamily:'var(--font-mono)', outline:'none', minWidth:0 }} onFocus={e=>e.target.style.borderColor='var(--border-lt)'} onBlur={e=>e.target.style.borderColor='var(--border-mid)'} />
              <button onClick={() => setFilterOpen(o => !o)} style={{ background: filterType !== 'all' ? (TYPE_BG[filterType]||'var(--grey-700)') : 'var(--grey-800)', border:`1px solid ${filterType !== 'all' ? (TYPE_COLORS[filterType]||'var(--border-lt)') : 'var(--border-mid)'}`, color: filterType !== 'all' ? (TYPE_COLORS[filterType]||'var(--white)') : 'var(--grey-300)', padding:'5px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', flexShrink:0 }}>
                {filterType === 'all' ? `Filter ${filterOpen ? '▲' : '▼'}` : `${filterType} ${filterOpen ? '▲' : '▼'}`}
              </button>
            </div>

            {/* Filter dropdown panel */}
            {filterOpen && (
              <div style={{ background:'var(--grey-900)', borderBottom:'1px solid var(--border)', padding:'8px', display:'flex', flexWrap:'wrap', gap:'5px', flexShrink:0 }}>
                <button onClick={()=>{setFilterType('all'); setFilterOpen(false);}} style={{ padding:'4px 8px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', background: filterType==='all' ? 'var(--grey-600)' : 'var(--grey-800)', border:`1px solid ${filterType==='all' ? 'var(--border-lt)' : 'var(--border-mid)'}`, color:'var(--white)' }}>All</button>
                {ALL_TYPES.map(t => (
                  <button key={t} onClick={()=>{setFilterType(filterType===t?'all':t); setFilterOpen(false);}} style={{ padding:'4px 8px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', background: filterType===t ? (TYPE_BG[t]||'#333') : 'var(--grey-800)', border:`1px solid ${filterType===t ? (TYPE_COLORS[t]||'#555') : 'var(--border-mid)'}`, color: TYPE_COLORS[t]||'var(--white)' }}>{t}</button>
                ))}
              </div>
            )}

            {/* 2-column Pokémon grid: virtualised so only ~20 rows render at once */}
            <VirtualGrid
              items={filtered}
              pokeData={pokeData}
              teamFull={teamFull}
              draggedName={draggedName}
              selectedCard={selectedCard}
              onDragStart={stableDragStart}
              onDragEnd={stableDragEnd}
              onClick={stableCardClick}
              onAdd={stableCardAdd}
            />

            {/* Footer count */}
            <div style={{ padding:'4px 10px', borderTop:'1px solid var(--border)', fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-600)', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>{filtered.length} Pokémon</span>
              {(selectedCard || selectedSlot !== null) && (
                <button onClick={()=>{setSelectedCard(null);setSelectedSlot(null);}} style={{ background:'none', border:'1px solid var(--border-mid)', color:'var(--grey-400)', padding:'2px 8px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase' }}>Cancel</button>
              )}
            </div>
          </div>
        </div>

      ) : (
        /* Desktop layout: party | grid | save slots */
        <div className="battle-builder-layout">

          {/* Left: Party */}
          <div className="battle-builder-party">
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--grey-400)' }}>Your Party</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-500)' }}>{team.length} / 6</span>
            </div>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'6px', padding:'12px', overflowY:'auto' }}>
              {[0,1,2,3,4,5].map(idx => (
                <PartySlot key={idx} pokemon={team[idx]||null} idx={idx} isSelected={selectedSlot===idx} dragOver={dragOverSlot===idx}
                  onClick={() => handleSlotClick(idx)} onDrop={handleDrop} onRemove={handleRemove}
                  onDragOver={setDragOverSlot} onDragLeave={() => setDragOverSlot(null)} onCustomize={setCustomizeTarget} />
              ))}
            </div>
            <div style={{ padding:'10px 12px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
              <button onClick={() => { const slots2=6-team.length; if(slots2<=0) return; const newMons=Array.from({length:slots2},(_,i)=>({...makeTestMon(),name:i===0&&!teamNames.has('testmon')?'testmon':`testmon-${team.length+i+1}`})); setTeam(prev=>[...prev,...newMons]); }} disabled={teamFull}
                style={{ width:'100%', background:'transparent', border:'1px solid var(--border-mid)', color: teamFull ? 'var(--grey-700)' : 'var(--grey-400)', padding:'8px', cursor: teamFull ? 'not-allowed' : 'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                Fill with Test Mons
              </button>
            </div>
          </div>

          {/* Center: Pokémon grid */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', background:'var(--grey-900)', display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center', flexShrink:0 }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Pokémon..." style={{ background:'var(--grey-800)', border:'1px solid var(--border-mid)', padding:'6px 12px', color:'var(--white)', fontSize:'12px', fontFamily:'var(--font-mono)', outline:'none', width:'160px', flexShrink:0 }} onFocus={e=>e.target.style.borderColor='var(--border-lt)'} onBlur={e=>e.target.style.borderColor='var(--border-mid)'} />
              <button onClick={()=>setFilterType('all')} style={{ padding:'5px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.04em', background: filterType==='all' ? 'var(--grey-600)' : 'var(--grey-900)', border:`1px solid ${filterType==='all' ? 'var(--border-lt)' : 'var(--border-mid)'}`, color:'var(--white)', transition:'all 0.1s' }}>All</button>
              {ALL_TYPES.map(t => (
                <button key={t} onClick={()=>setFilterType(filterType===t?'all':t)} style={{ padding:'5px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.04em', background: filterType===t ? (TYPE_BG[t]||'#333') : 'var(--grey-900)', border:`1px solid ${filterType===t ? (TYPE_COLORS[t]||'#555') : 'var(--border-mid)'}`, color:'var(--white)', transition:'all 0.1s' }}>{t}</button>
              ))}
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'12px 14px' }}>
              {filtered.length === 0
                ? <div style={{ fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-500)', textAlign:'center', paddingTop:'60px' }}>No Pokémon match your filters</div>
                : <div className="grid-5col">
                    {filtered.map(name => (
                      <PokemonCard key={name} name={name} cardData={pokeData[name]}
                        isDragging={draggedName===name} isSelected={selectedCard===name}
                        onDragStart={stableDragStart} onDragEnd={stableDragEnd}
                        onClick={stableCardClick} onAdd={stableCardAdd} />
                    ))}
                  </div>
              }
            </div>
            <div style={{ padding:'6px 14px', borderTop:'1px solid var(--border)', fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-600)', flexShrink:0 }}>
              {filtered.length} Pokémon
              {(selectedCard || selectedSlot !== null) && (
                <button onClick={()=>{setSelectedCard(null);setSelectedSlot(null);}} style={{ marginLeft:'16px', background:'none', border:'1px solid var(--border-mid)', color:'var(--grey-400)', padding:'2px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase' }}>Cancel</button>
              )}
            </div>
          </div>

          {/* Right: Save slots */}
          <SaveSlotPanel slots={slots} currentTeam={team} onSave={saveToSlot} onLoad={loadFromSlot} onDelete={deleteSlot} saving={saving} teamName={teamName} onTeamNameChange={setTeamName} />
        </div>
      )}

      {customizeTarget && (
        <CustomizePopup pokemon={customizeTarget} onClose={()=>setCustomizeTarget(null)} onSave={handleSave} />
      )}
    </div>
  );
}
