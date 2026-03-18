/*
 * ChangeMovePopup.jsx Full screen modal for editing a Pokémon's four moves.
 * Contains the three sub components it owns exclusively:
 *   CompactDropSlot  compact single row slot used on mobile
 *   DropSlot         full height slot used on desktop
 *   MoveCard         draggable and clickable card in the move browser grid
 */

import React, { useState, useEffect } from 'react';
import useIsMobile from '../hooks/useIsMobile.js';
import { fetchMoveData } from '../hooks/usePokemonData.js';
import { TYPE_BG, TYPE_ACCENT } from '../utils/constants.js';

/* Compact single-row slot used on mobile */
function CompactDropSlot({ move, idx, onDrop, onRemove, dragOver, onDragOver, onDragLeave, isSelected, onClick }) {
  const [data, setData] = useState(null);
  useEffect(() => { if (!move) { setData(null); return; } fetchMoveData(move).then(setData); }, [move]);
  const type      = data?.type || null;
  const accent    = move && type ? TYPE_ACCENT[type] : dragOver ? '#c0a820' : 'var(--border)';
  const bg        = move && type ? TYPE_BG[type] : dragOver ? 'rgba(192,168,32,0.08)' : 'var(--grey-900)';
  const catColor  = { physical:'#e07040', special:'#4090d0', status:'#aaa' }[data?.category] || '#888';
  const borderColor = isSelected ? 'var(--white)' : dragOver ? '#c0a820' : 'var(--border)';

  return (
    <div
      onDragOver={e => { e.preventDefault(); onDragOver(idx); }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop(idx); }}
      onClick={onClick}
      style={{ background: isSelected ? 'rgba(255,255,255,0.08)' : bg, borderTop:`1px solid ${borderColor}`, borderRight:`1px solid ${borderColor}`, borderBottom:`1px solid ${borderColor}`, borderLeft:`3px solid ${isSelected ? 'var(--white)' : accent}`, padding:'8px 10px', display:'flex', alignItems:'center', gap:'8px', cursor: move ? 'pointer' : 'default', minHeight:'38px', transition:'all 0.15s' }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-500)', flexShrink:0, width:'12px' }}>{idx + 1}</span>
      {move ? (
        <>
          {type && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:accent, textTransform:'uppercase', flexShrink:0 }}>{type}</span>}
          <span style={{ fontFamily:'var(--font-ui)', fontWeight:700, fontSize:'13px', textTransform:'capitalize', color:'var(--white)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{move}</span>
          {data?.power > 0 && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-400)', flexShrink:0 }}>{data.power}</span>}
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:catColor, flexShrink:0 }}>{data?.category?.[0]?.toUpperCase()}</span>
          <button onClick={e => { e.stopPropagation(); onRemove(idx); }} style={{ background:'none', border:'none', color:'var(--grey-600)', cursor:'pointer', fontSize:'16px', padding:'0 2px', lineHeight:1 }}>×</button>
        </>
      ) : (
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color: dragOver ? '#c0a820' : 'var(--grey-600)', fontStyle:'italic' }}>{dragOver ? 'Drop here' : 'empty'}</span>
      )}
    </div>
  );
}

/* Full-height slot used on desktop */
function DropSlot({ move, idx, onDrop, onRemove, dragOver, onDragOver, onDragLeave, isSelected, onClick }) {
  const [data, setData] = useState(null);
  useEffect(() => { if (!move) { setData(null); return; } fetchMoveData(move).then(setData); }, [move]);
  const type        = data?.type || null;
  const bg          = move && type ? TYPE_BG[type] : dragOver ? 'rgba(192,168,32,0.08)' : 'var(--grey-900)';
  const accent      = move && type ? TYPE_ACCENT[type] : dragOver ? '#c0a820' : 'var(--border)';
  const catLabel    = { physical:'Physical', special:'Special', status:'Status' }[data?.category] || '';
  const catColor    = { physical:'#e07040', special:'#4090d0', status:'#aaa' }[data?.category] || '#888';
  const catBg       = { physical:'rgba(224,112,64,0.18)', special:'rgba(64,144,208,0.18)', status:'rgba(170,170,170,0.12)' }[data?.category] || '';
  const borderColor = isSelected ? 'var(--white)' : dragOver ? '#c0a820' : 'rgba(255,255,255,0.07)';

  return (
    <div
      onDragOver={e => { e.preventDefault(); onDragOver(idx); }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop(idx); }}
      onClick={onClick}
      style={{ background: isSelected ? 'rgba(255,255,255,0.08)' : dragOver ? 'rgba(192,168,32,0.08)' : bg, borderTop:`2px solid ${borderColor}`, borderRight:`2px solid ${borderColor}`, borderBottom:`2px solid ${borderColor}`, borderLeft:`5px solid ${isSelected ? 'var(--white)' : accent}`, padding:'12px 16px', minHeight: move ? '110px' : '72px', display:'flex', flexDirection:'column', gap:'6px', transition:'background 0.15s, border-color 0.15s', flex:1, cursor: move ? 'pointer' : 'default', boxShadow: isSelected ? '0 0 14px rgba(255,255,255,0.15)' : 'none' }}>
      {move ? (
        <>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', minWidth:0 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-500)', flexShrink:0 }}>{idx + 1}</span>
              {type && <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', textTransform:'uppercase', color:accent, background:'rgba(0,0,0,0.35)', padding:'2px 7px', flexShrink:0, fontWeight:700 }}>{type}</span>}
              <span style={{ fontFamily:'var(--font-ui)', fontWeight:700, fontSize:'16px', textTransform:'capitalize', color:'var(--white)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{move}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
              {catLabel && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', fontWeight:700, color:catColor, background:catBg, border:`1px solid ${catColor}55`, padding:'2px 6px', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{catLabel}</span>}
              <button onClick={e => { e.stopPropagation(); onRemove(idx); }} style={{ background:'none', border:'none', color:'var(--grey-600)', cursor:'pointer', fontSize:'18px', padding:'0 2px', lineHeight:1, transition:'color 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--grey-600)'}>×</button>
            </div>
          </div>
          <div style={{ display:'flex', gap:'8px', paddingLeft:'28px' }}>
            {data?.power > 0    && <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-300)' }}>PWR {data.power}</span>}
            {data?.accuracy > 0 && <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-300)' }}>ACC {data.accuracy}%</span>}
            {data?.pp           && <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-300)' }}>PP {data.pp}</span>}
          </div>
          {data?.effect && <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-400)', lineHeight:1.45, paddingLeft:'28px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{data.effect}</div>}
        </>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-600)', flexShrink:0 }}>{idx + 1}</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color: dragOver ? '#c0a820' : 'var(--grey-600)', fontStyle:'italic' }}>{dragOver ? 'Drop here' : 'empty'}</span>
        </div>
      )}
    </div>
  );
}

/* Draggable/clickable move card in the move browser grid */
function MoveCard({ move, onDragStart, onDragEnd, isDragging, isSelected, onClick, showDesc }) {
  const [data, setData] = useState(null);
  useEffect(() => { fetchMoveData(move).then(setData); }, [move]);
  const type     = data?.type || null;
  const bg       = type ? TYPE_BG[type]     : '#1e1e1e';
  const accent   = type ? TYPE_ACCENT[type] : '#555';
  const catLabel = { physical:'Physical', special:'Special', status:'Status' }[data?.category] || '';
  const catColor = { physical:'#e07040', special:'#4090d0', status:'#aaa' }[data?.category] || '#888';
  const catBg    = { physical:'rgba(224,112,64,0.18)', special:'rgba(64,144,208,0.18)', status:'rgba(170,170,170,0.12)' }[data?.category] || 'rgba(100,100,100,0.12)';

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(move); }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{ background:bg, borderTop:`2px solid ${isSelected?'#4ade80':'rgba(255,255,255,0.05)'}`, borderRight:`2px solid ${isSelected?'#4ade80':'rgba(255,255,255,0.05)'}`, borderBottom:`2px solid ${isSelected?'#4ade80':'rgba(255,255,255,0.05)'}`, borderLeft: isSelected ? '4px solid #4ade80' : `4px solid ${accent}`, padding:'10px 12px', cursor:'pointer', opacity: isDragging ? 0.4 : 1, transition:'opacity 0.15s, border-color 0.1s', userSelect:'none', display:'flex', flexDirection:'column', gap:'5px', boxShadow: isSelected ? '0 0 0 1px #4ade80' : 'none' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        {type
          ? <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:accent, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:700 }}>{type}</span>
          : <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-600)' }}>…</span>}
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'8px', fontWeight:700, color:catColor, background:catBg, border:`1px solid ${catColor}55`, padding:'1px 5px', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{catLabel}</span>
      </div>
      <div style={{ fontFamily:'var(--font-ui)', fontWeight:700, fontSize:'13px', textTransform:'capitalize', color:'var(--white)', lineHeight:1.2 }}>{move}</div>
      <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
        {data?.power > 0    && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--white)', background:'rgba(0,0,0,0.4)', padding:'1px 5px' }}>PWR {data.power}</span>}
        {data?.accuracy > 0 && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--white)', background:'rgba(0,0,0,0.4)', padding:'1px 5px' }}>ACC {data.accuracy}%</span>}
        {data?.pp           && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--white)', background:'rgba(0,0,0,0.4)', padding:'1px 5px' }}>PP {data.pp}</span>}
      </div>
      {showDesc && data?.effect && (
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-400)', lineHeight:1.45, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', marginTop:'2px' }}>
          {data.effect}
        </div>
      )}
    </div>
  );
}

/* Main modal: lets the user pick, drag, and assign up to 4 moves from the
   Pokémon's full learnable move list. Responsive: slots on top on mobile,
   slots on the left panel on desktop. */
export default function ChangeMovePopup({ pokemon, currentMoves: initMoves, onSave, onClose }) {
  const isMobile  = useIsMobile();
  const allMoves  = pokemon.cachedData?.moves || [];

  const [moves,        setMoves]        = useState(() => [...initMoves, null, null, null, null].slice(0, 4));
  const [search,       setSearch]       = useState('');
  const [filterCat,    setFilterCat]    = useState('all');
  const [filterType,   setFilterType]   = useState('all');
  const [filterPower,  setFilterPower]  = useState('all');
  const [draggedMove,  setDraggedMove]  = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [moveData,     setMoveData]     = useState({});
  const [filterOpen,   setFilterOpen]   = useState(false);

  // Pre-fetch move metadata for all learnable moves.
  useEffect(() => {
    allMoves.forEach(m => {
      if (!moveData[m]) fetchMoveData(m).then(d => setMoveData(prev => ({ ...prev, [m]: d })));
    });
  }, []);

  // Exclude moves already assigned to a slot.
  const assignedMoves = new Set(moves.filter(Boolean));

  const filtered = allMoves.filter(m => {
    if (assignedMoves.has(m)) return false;
    if (!m.toLowerCase().includes(search.toLowerCase())) return false;
    const d = moveData[m];
    if (filterCat   !== 'all' && d?.category !== filterCat)  return false;
    if (filterPower === 'has' && !(d?.power > 0))             return false;
    if (filterPower === 'none' && d?.power > 0)               return false;
    if (filterType  !== 'all' && d?.type !== filterType)      return false;
    return true;
  });

  const presentTypes = [...new Set(allMoves.map(m => moveData[m]?.type).filter(Boolean))].sort();

  const handleDrop = (slotIdx) => {
    if (!draggedMove) return;
    const next = [...moves]; next[slotIdx] = draggedMove; setMoves(next);
    setDragOverSlot(null); setSelectedCard(null); setSelectedSlot(null);
  };

  const handleCardClick = (moveName) => {
    if (selectedSlot !== null) {
      const next = [...moves]; next[selectedSlot] = moveName; setMoves(next);
      setSelectedSlot(null); setSelectedCard(null);
    } else {
      setSelectedCard(prev => prev === moveName ? null : moveName);
    }
  };

  const handleSlotClick = (slotIdx) => {
    if (selectedCard !== null) {
      const next = [...moves]; next[slotIdx] = selectedCard; setMoves(next);
      setSelectedCard(null); setSelectedSlot(null);
    } else if (selectedSlot !== null && selectedSlot !== slotIdx) {
      const next = [...moves]; [next[selectedSlot], next[slotIdx]] = [next[slotIdx], next[selectedSlot]]; setMoves(next);
      setSelectedSlot(null);
    } else if (moves[slotIdx]) {
      setSelectedSlot(prev => prev === slotIdx ? null : slotIdx);
    }
  };

  const handleRemove = (idx) => {
    const next = [...moves]; next[idx] = null; setMoves(next);
    if (selectedSlot === idx) setSelectedSlot(null);
  };

  const hintText = selectedCard
    ? `"${selectedCard}" — tap a slot`
    : selectedSlot !== null ? `Slot ${selectedSlot + 1} — tap a move`
    : 'Tap a move to assign it';

  const SlotComponent = isMobile ? CompactDropSlot : DropSlot;

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:400, padding: isMobile ? '0' : '12px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--grey-900)', border:'1px solid var(--border-lt)', width: isMobile ? '100%' : '95vw', height: isMobile ? '100%' : '95vh', display:'flex', flexDirection:'column', animation:'popIn 0.2s ease both', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ background:'var(--grey-800)', borderBottom:'1px solid var(--border)', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0, gap:'8px' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize: isMobile ? '14px' : '18px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--white)' }}>Change Moves</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color: (selectedCard || selectedSlot !== null) ? '#c0a820' : 'var(--grey-400)', flex:1, textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{hintText}</span>
          <div style={{ display:'flex', gap:'6px', alignItems:'center', flexShrink:0 }}>
            <button onClick={() => { onSave(moves); onClose(); }} style={{ background:'var(--white)', border:'none', color:'var(--black)', padding: isMobile ? '7px 12px' : '9px 20px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'13px', letterSpacing:'0.08em', textTransform:'uppercase' }}>Confirm</button>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--grey-400)', cursor:'pointer', fontSize:'22px', lineHeight:1, padding:'0 4px' }}>×</button>
          </div>
        </div>

        {isMobile ? (
          /* Mobile layout: compact slots on top, collapsible filter, 2-col grid */
          <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
            <div style={{ padding:'8px', borderBottom:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:'4px', flexShrink:0, background:'var(--grey-800)' }}>
              {[0, 1, 2, 3].map(idx => (
                <SlotComponent key={idx} move={moves[idx]} idx={idx} onDrop={handleDrop} onRemove={handleRemove}
                  dragOver={dragOverSlot === idx} onDragOver={setDragOverSlot} onDragLeave={() => setDragOverSlot(null)}
                  isSelected={selectedSlot === idx} onClick={() => handleSlotClick(idx)} />
              ))}
            </div>
            <div style={{ padding:'6px 8px', borderBottom:'1px solid var(--border)', background:'var(--grey-900)', display:'flex', gap:'6px', alignItems:'center', flexShrink:0 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                style={{ flex:1, background:'var(--grey-800)', border:'1px solid var(--border-mid)', padding:'5px 8px', color:'var(--white)', fontSize:'11px', fontFamily:'var(--font-mono)', outline:'none', minWidth:0 }}
                onFocus={e => e.target.style.borderColor = 'var(--border-lt)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-mid)'} />
              <button onClick={() => setFilterOpen(o => !o)} style={{ background: filterCat !== 'all' || filterType !== 'all' ? 'var(--grey-600)' : 'var(--grey-800)', border:'1px solid var(--border-mid)', color:'var(--white)', padding:'5px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', flexShrink:0 }}>
                Filter {filterOpen ? '▲' : '▼'}
              </button>
            </div>
            {filterOpen && (
              <div style={{ padding:'8px', borderBottom:'1px solid var(--border)', background:'var(--grey-900)', display:'flex', flexDirection:'column', gap:'6px', flexShrink:0 }}>
                <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                  {[['all','All'],['physical','Phys'],['special','Spec'],['status','Stat']].map(([v, l]) => {
                    const c = v === 'physical' ? '#e07040' : v === 'special' ? '#4090d0' : v === 'status' ? '#aaa' : 'var(--white)';
                    return <button key={v} onClick={() => setFilterCat(v)} style={{ padding:'4px 8px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', background:filterCat===v?'var(--grey-600)':'var(--grey-800)', border:`1px solid ${filterCat===v?'var(--border-lt)':'var(--border-mid)'}`, color:filterCat===v&&v!=='all'?c:'var(--white)' }}>{l}</button>;
                  })}
                  {[['all','Any PWR'],['has','Has PWR'],['none','No PWR']].map(([v, l]) => (
                    <button key={v} onClick={() => setFilterPower(v)} style={{ padding:'4px 8px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', background:filterPower===v?'var(--grey-600)':'var(--grey-800)', border:`1px solid ${filterPower===v?'var(--border-lt)':'var(--border-mid)'}`, color:'var(--white)' }}>{l}</button>
                  ))}
                </div>
                <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                  <button onClick={() => setFilterType('all')} style={{ padding:'3px 7px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', background:filterType==='all'?'var(--grey-500)':'var(--grey-800)', border:`1px solid ${filterType==='all'?'var(--border-lt)':'var(--border-mid)'}`, color:'var(--white)' }}>All</button>
                  {presentTypes.map(t => (
                    <button key={t} onClick={() => setFilterType(filterType === t ? 'all' : t)} style={{ padding:'3px 7px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', background:filterType===t?(TYPE_BG[t]||'#333'):'var(--grey-800)', border:`1px solid ${filterType===t?(TYPE_ACCENT[t]||'#555'):'var(--border-mid)'}`, color:TYPE_ACCENT[t]||'var(--white)' }}>{t}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ flex:1, overflowY:'auto', padding:'8px' }}>
              {filtered.length === 0
                ? <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-500)', textAlign:'center', paddingTop:'40px' }}>No moves match</div>
                : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                    {filtered.map(m => (
                      <MoveCard key={m} move={m} isDragging={draggedMove === m} isSelected={selectedCard === m}
                        onDragStart={setDraggedMove} onDragEnd={() => setDraggedMove(null)} onClick={() => handleCardClick(m)} showDesc={false} />
                    ))}
                  </div>
              }
            </div>
            <div style={{ padding:'4px 8px', borderTop:'1px solid var(--border)', fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-600)', flexShrink:0 }}>{filtered.length} moves</div>
          </div>
        ) : (
          /* Desktop layout: 340px slot panel on left, filter bar + 3-col grid on right */
          <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
            <div style={{ width:'340px', minWidth:'340px', borderRight:'1px solid var(--border)', padding:'16px', display:'flex', flexDirection:'column', gap:'10px', flexShrink:0, overflowY:'auto' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'12px', letterSpacing:'0.14em', color:'var(--grey-400)', textTransform:'uppercase', paddingBottom:'10px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>Current Moves</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', flex:1 }}>
                {[0, 1, 2, 3].map(idx => (
                  <SlotComponent key={idx} move={moves[idx]} idx={idx} onDrop={handleDrop} onRemove={handleRemove}
                    dragOver={dragOverSlot === idx} onDragOver={setDragOverSlot} onDragLeave={() => setDragOverSlot(null)}
                    isSelected={selectedSlot === idx} onClick={() => handleSlotClick(idx)} />
                ))}
              </div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-500)', textAlign:'center', paddingTop:'8px', borderTop:'1px solid var(--border)', flexShrink:0 }}>{moves.filter(Boolean).length} / 4 slots filled</div>
            </div>
            <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center', flexShrink:0, background:'var(--grey-800)' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search moves…"
                  style={{ background:'var(--grey-900)', border:'1px solid var(--border-mid)', padding:'7px 12px', color:'var(--white)', fontSize:'13px', fontFamily:'var(--font-mono)', outline:'none', width:'180px', flexShrink:0 }}
                  onFocus={e => e.target.style.borderColor = 'var(--border-lt)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-mid)'} />
                <div style={{ display:'flex', gap:'4px' }}>
                  {[['all','All'],['physical','Physical'],['special','Special'],['status','Status']].map(([v, l]) => {
                    const btnColor = v==='physical'?'#e07040':v==='special'?'#4090d0':v==='status'?'#aaa':'var(--white)';
                    const btnBg    = v==='physical'?'rgba(224,112,64,0.18)':v==='special'?'rgba(64,144,208,0.18)':v==='status'?'rgba(170,170,170,0.12)':'';
                    return <button key={v} onClick={() => setFilterCat(v)} style={{ padding:'6px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.04em', background:filterCat===v?(btnBg||'var(--grey-600)'):'var(--grey-900)', border:`1px solid ${filterCat===v?(v!=='all'?btnColor:'var(--border-lt)'):'var(--border-mid)'}`, color:filterCat===v&&v!=='all'?btnColor:'var(--white)', transition:'all 0.1s' }}>{l}</button>;
                  })}
                </div>
                <div style={{ display:'flex', gap:'4px' }}>
                  {[['all','Any PWR'],['has','Has PWR'],['none','No PWR']].map(([v, l]) => (
                    <button key={v} onClick={() => setFilterPower(v)} style={{ padding:'6px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.04em', background:filterPower===v?'var(--grey-600)':'var(--grey-900)', border:`1px solid ${filterPower===v?'var(--border-lt)':'var(--border-mid)'}`, color:'var(--white)', transition:'all 0.1s' }}>{l}</button>
                  ))}
                </div>
                <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                  <button onClick={() => setFilterType('all')} style={{ padding:'4px 9px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', background:filterType==='all'?'var(--grey-500)':'var(--grey-900)', border:`1px solid ${filterType==='all'?'var(--border-lt)':'var(--border-mid)'}`, color:'var(--white)', transition:'all 0.1s' }}>All Types</button>
                  {presentTypes.map(t => (
                    <button key={t} onClick={() => setFilterType(filterType === t ? 'all' : t)} style={{ padding:'4px 9px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', background:filterType===t?(TYPE_BG[t]||'#333'):'var(--grey-900)', border:`1px solid ${filterType===t?(TYPE_ACCENT[t]||'#555'):'var(--border-mid)'}`, color:'var(--white)', transition:'all 0.1s' }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex:1, overflowY:'auto', padding:'14px 16px' }}>
                {filtered.length === 0
                  ? <div style={{ fontFamily:'var(--font-mono)', fontSize:'14px', color:'var(--grey-500)', textAlign:'center', paddingTop:'60px' }}>No moves match your filters</div>
                  : <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px' }}>
                      {filtered.map(m => (
                        <MoveCard key={m} move={m} isDragging={draggedMove === m} isSelected={selectedCard === m}
                          onDragStart={setDraggedMove} onDragEnd={() => setDraggedMove(null)} onClick={() => handleCardClick(m)} showDesc={true} />
                      ))}
                    </div>
                }
              </div>
              <div style={{ padding:'8px 16px', borderTop:'1px solid var(--border)', fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-500)', flexShrink:0 }}>{filtered.length} move{filtered.length !== 1 ? 's' : ''} available</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
