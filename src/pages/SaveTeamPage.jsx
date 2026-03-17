/*
 * SaveTeamPage.jsx Team builder. Players drag/click Pokémon into
 * party slots, customise them, then save to one of 10 Supabase slots.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GEN1_POKEMON, GEN2_POKEMON, GEN3_POKEMON, GEN4_POKEMON, GEN5_POKEMON, TYPE_COLORS, TYPE_BG} from '../utils/constants.js';
import { usePokemonData, fetchPokeData } from '../hooks/usePokemonData.js';
import CustomizePopup from '../components/CustomizePopup.jsx';
import { ALL_MOVES, getOperationalMoves } from '../utils/moveEffects.js';
import { supabase } from '../utils/supabaseClient.js';

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

// Sidebar listing all 10 save slots with load, overwrite, and delete actions.
function SaveSlotPanel({ slots, currentTeam, onSave, onLoad, onDelete, saving, teamName, onTeamNameChange }) {
  const canSave = currentTeam.length === 6;
  const [confirmDelete, setConfirmDelete] = useState(null);

  return (
    <div style={{ width:'260px', minWidth:'260px', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0, background:'var(--grey-900)' }}>
      <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--grey-400)', marginBottom:'8px' }}>Save Slots</div>
        {/* Team name input */}
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-600)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'4px' }}>Team Name</div>
        <input
          value={teamName}
          onChange={e => onTeamNameChange(e.target.value)}
          placeholder="My Team"
          maxLength={24}
          style={{ width:'100%', background:'var(--grey-800)', border:'1px solid var(--border-mid)', color:'var(--white)', fontFamily:'var(--font-display)', fontSize:'12px', letterSpacing:'0.06em', padding:'6px 8px', outline:'none', textTransform:'uppercase' }}
          onFocus={e => e.target.style.borderColor = 'var(--border-lt)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
        />
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color: canSave ? 'var(--grey-500)' : 'var(--grey-700)', marginTop:'6px' }}>
          {canSave ? '6/6 Pokémon pick a slot to save' : `${currentTeam.length}/6 Pokémon needed`}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'10px 12px', display:'flex', flexDirection:'column', gap:'6px' }}>
        {Array.from({ length: 10 }, (_, i) => {
          const slot = slots[i];
          const hasData = slot && slot.pokemon && slot.pokemon.length > 0;
          return (
            <div key={i} style={{ background: hasData ? 'var(--grey-800)' : 'var(--grey-900)', border:'1px solid var(--border)', padding:'10px 12px', display:'flex', flexDirection:'column', gap:'6px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-400)', letterSpacing:'0.1em' }}>
                  SLOT {String(i + 1).padStart(2, '0')}
                </span>
                {hasData && (
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-600)' }}>
                    {slot.pokemon.length}/6
                  </span>
                )}
              </div>

              {hasData ? (
                <>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'12px', color:'var(--white)', letterSpacing:'0.06em', textTransform:'uppercase', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {slot.name || `Team ${i + 1}`}
                  </div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-500)' }}>
                    {slot.pokemon.map(p => p.name.replace(/-/g,' ')).join(', ')}
                  </div>
                  <div style={{ display:'flex', gap:'5px', marginTop:'2px' }}>
                    <button onClick={() => onLoad(i)} style={{ flex:1, background:'transparent', border:'1px solid var(--border-lt)', color:'var(--grey-200)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.08em', textTransform:'uppercase', padding:'4px 0', transition:'all 0.1s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      Load
                    </button>
                    <button onClick={() => canSave && onSave(i)} disabled={!canSave || saving} style={{ flex:1, background: canSave ? 'rgba(64,144,208,0.15)' : 'transparent', border:`1px solid ${canSave ? '#4090d0' : 'var(--border)'}`, color: canSave ? '#4090d0' : 'var(--grey-700)', cursor: canSave ? 'pointer' : 'not-allowed', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.08em', textTransform:'uppercase', padding:'4px 0', transition:'all 0.1s' }}
                      onMouseEnter={e=>{ if(canSave) e.currentTarget.style.background='rgba(64,144,208,0.25)'; }}
                      onMouseLeave={e=>{ if(canSave) e.currentTarget.style.background='rgba(64,144,208,0.15)'; }}>
                      {saving ? '…' : 'Overwrite'}
                    </button>
                    {confirmDelete === i ? (
                      <>
                        <button onClick={() => { onDelete(i); setConfirmDelete(null); }} style={{ flex:1, background:'rgba(200,50,50,0.25)', border:'1px solid #c03030', color:'#ff6060', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.08em', textTransform:'uppercase', padding:'4px 0', transition:'all 0.1s' }}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(200,50,50,0.45)'}
                          onMouseLeave={e=>e.currentTarget.style.background='rgba(200,50,50,0.25)'}>
                          Sure?
                        </button>
                        <button onClick={() => setConfirmDelete(null)} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--grey-500)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', padding:'4px 6px', transition:'all 0.1s' }}
                          onMouseEnter={e=>e.currentTarget.style.color='var(--white)'}
                          onMouseLeave={e=>e.currentTarget.style.color='var(--grey-500)'}>
                          ✕
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(i)} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--grey-600)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.08em', textTransform:'uppercase', padding:'4px 6px', transition:'all 0.1s' }}
                        onMouseEnter={e=>{ e.currentTarget.style.borderColor='#c03030'; e.currentTarget.style.color='#ff6060'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--grey-600)'; }}>
                        Del
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <button onClick={() => canSave && onSave(i)} disabled={!canSave || saving} style={{ background: canSave ? 'rgba(64,144,208,0.12)' : 'transparent', border:`1px solid ${canSave ? '#4090d0' : 'var(--border)'}`, color: canSave ? '#4090d0' : 'var(--grey-700)', cursor: canSave ? 'pointer' : 'not-allowed', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.08em', textTransform:'uppercase', padding:'5px', transition:'all 0.1s' }}>
                  {saving ? 'Saving…' : canSave ? '+ Save Here' : 'Empty'}
                </button>
              )}
            </div>
          );
        })}
      </div>
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

function PokemonCard({ name, pokeData, teamFull, isDragging, isSelected, onDragStart, onDragEnd, onClick, onAdd }) {
  const data  = pokeData[name];
  const type1 = data?.types?.[0];
  const type2 = data?.types?.[1];
  const id    = ALL_POKEMON.indexOf(name) + 1;
  const accent = type1 ? (TYPE_COLORS[type1] || '#888') : 'var(--border)';
  const cardBg = type1 ? TYPE_BG[type1] : 'var(--grey-900)';

  return (
    <div draggable={!isDragging && !teamFull} onDragStart={e => { e.dataTransfer.effectAllowed='move'; onDragStart(name); }} onDragEnd={onDragEnd} onClick={onClick}
      style={{ background:cardBg, borderTop:`2px solid ${isSelected ? '#4ade80' : 'rgba(255,255,255,0.06)'}`, borderRight:`2px solid ${isSelected ? '#4ade80' : 'rgba(255,255,255,0.06)'}`, borderBottom:`2px solid ${isSelected ? '#4ade80' : 'rgba(255,255,255,0.06)'}`, borderLeft:`4px solid ${isSelected ? '#4ade80' : accent}`, padding:'14px 12px', cursor:'pointer', opacity: isDragging ? 0.4 : 1, display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', minHeight:'180px', transition:'opacity 0.15s, filter 0.15s, border-color 0.1s', userSelect:'none', boxShadow: isSelected ? '0 0 12px rgba(74,222,128,0.3)' : 'none', position:'relative' }}
      onMouseEnter={e=>{ if(!teamFull && !isDragging) e.currentTarget.style.filter='brightness(1.25)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.filter='none'; }}>
      <span style={{ position:'absolute', top:'7px', right:'9px', fontFamily:'var(--font-mono)', fontSize:'10px', color:accent, opacity:0.7 }}>#{id}</span>
      {data?.sprite ? <img src={data.sprite} alt={name} style={{ width:'96px', height:'96px', imageRendering:'pixelated' }} /> : <div style={{ width:'96px', height:'96px', background:'var(--grey-700)', opacity:0.4 }} />}
      <div style={{ fontFamily:'var(--font-display)', fontSize:'13px', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--white)', textAlign:'center', lineHeight:1.2 }}>{name.replace(/-/g,' ')}</div>
      <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', justifyContent:'center' }}>
        {type1 && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', color:TYPE_COLORS[type1]||'#888', letterSpacing:'0.06em', border:`1px solid ${TYPE_COLORS[type1]||'#888'}`, padding:'1px 6px', background:`${TYPE_BG[type1]||'#222'}` }}>{type1}</span>}
        {type2 && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', color:TYPE_COLORS[type2]||'#888', letterSpacing:'0.06em', border:`1px solid ${TYPE_COLORS[type2]||'#888'}`, padding:'1px 6px', background:`${TYPE_BG[type2]||'#222'}` }}>{type2}</span>}
      </div>
      <button onClick={e=>{ e.stopPropagation(); onAdd && onAdd(); }} disabled={teamFull} style={{ width:'100%', background:'none', border:'1px solid var(--white)', color:'var(--white)', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', padding:'5px 0', marginTop:'2px', transition:'all 0.1s', opacity: teamFull ? 0.3 : 1 }} onMouseEnter={e=>{ if(!teamFull) e.currentTarget.style.background='rgba(255,255,255,0.12)'; }} onMouseLeave={e=>e.currentTarget.style.background='none'}>Add</button>
    </div>
  );
}

// Main builder: Pokémon grid on the left, party slots on the right.
export default function SaveTeamPage({ setPage, user, initialTeam }) {
  const [team,            setTeam]            = useState(initialTeam || []); // Initialize with passed team
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
    if (_bulkLoaded.done) { batchRegisterAll(ALL_POKEMON); setLoadProgress(1); setAllLoaded(true); return; }
    bulkLoadAll(ALL_POKEMON, p => setLoadProgress(p)).then(() => { batchRegisterAll(ALL_POKEMON); setAllLoaded(true); });
  }, []);

  // Fetch missing cachedData for team members
  useEffect(() => {
    team.forEach(p => { if (!p.cachedData && !pokeData[p.name]) fetchBasic(p.name); });
  }, [team]);

  // ===== FIX: Automatically populate team from initialTeam =====
  // This ensures that when we arrive from the quiz, the team is already in the party slots
  useEffect(() => {
    if (initialTeam && initialTeam.length > 0) {
      setTeam(initialTeam);
    }
  }, [initialTeam]);

  const filtered = ALL_POKEMON.filter(n => {
    if (teamNames.has(n)) return false;
    if (!n.replace(/-/g,' ').toLowerCase().includes(search.toLowerCase().trim())) return false;
    if (n === 'testmon') return filterType === 'all' || filterType === 'normal';
    if (filterType === 'all') return true;
    return (pokeData[n]?.types || []).includes(filterType);
  });

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
    <div style={{ height:'calc(100vh - var(--nav-h))', background:'var(--black)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ background:'var(--grey-900)', borderBottom:'1px solid var(--border)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <button onClick={() => setPage('battlemode')} style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>← Back</button>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'20px', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--white)' }}>Save Team</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:(selectedCard || selectedSlot !== null) ? '#c0a820' : 'var(--grey-500)', transition:'color 0.2s', marginTop:'2px' }}>{saveMsg || hintText}</div>
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color: team.length === 6 ? '#4ade80' : 'var(--grey-500)' }}>
          {team.length} / 6 {team.length === 6 ? ' Ready to save' : ''}
        </div>
      </div>

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* Left: Party */}
        <div style={{ width:'300px', minWidth:'300px', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
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
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'8px' }}>
                  {filtered.map(name => (
                    <PokemonCard key={name} name={name} pokeData={pokeData} teamFull={teamFull}
                      isDragging={draggedName===name} isSelected={selectedCard===name}
                      onDragStart={setDraggedName} onDragEnd={()=>setDraggedName(null)}
                      onClick={()=>handleCardClick(name)} onAdd={()=>addToTeam(name)} />
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

      {customizeTarget && (
        <CustomizePopup pokemon={customizeTarget} onClose={()=>setCustomizeTarget(null)} onSave={handleSave} />
      )}
    </div>
  );
}