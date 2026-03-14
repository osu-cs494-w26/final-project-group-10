/*
 * CustomizePopup.jsx Modal for editing a party member's moves, ability,
 * item, EVs, gender, and friendship before saving to a team slot.
 */
import React, { useState, useEffect } from 'react';
import ItemPopup from './ItemPopup.jsx';
import MoveTooltip from './MoveTooltip.jsx';
import { fetchMoveData } from '../hooks/usePokemonData.js';
import { calcHPStat, calcBattleStat } from '../utils/battleEngine.js';
import { MOVE_EFFECTS } from '../utils/moveEffects.js';
import { TYPE_BG } from '../utils/constants.js';

const TYPE_ACCENT = {
  fire:'#e06030',water:'#4090d0',grass:'#50a030',electric:'#c0a820',
  psychic:'#d03060',ice:'#30a0b0',dragon:'#6030c0',dark:'#706040',
  fairy:'#c05070',normal:'#888',fighting:'#b03020',flying:'#6080a0',
  poison:'#8030a0',ground:'#a07820',rock:'#908020',bug:'#60902a',
  ghost:'#503088',steel:'#507088',
};

const STAT_LABELS = {
  hp:'HP', attack:'ATK', defense:'DEF',
  'special-attack':'SATK', 'special-defense':'SDEF', speed:'SPD'
};

const HP_STAT_MAX = 370;  // max realistic lv50 HP stat
const OTHER_STAT_MAX = 310; // max realistic lv50 non-HP stat

// Stat row showing the lv50 value with an EV slider and +/− buttons.
function EVStatRow({ statKey, label, base, ev, onEVChange, totalEVs, iv }) {
  const lv50 = statKey === 'hp'
    ? calcHPStat(base, ev, iv)
    : calcBattleStat(base, ev, iv);
  const maxForScale = statKey === 'hp' ? HP_STAT_MAX : OTHER_STAT_MAX;
  const pct = Math.min(100, (lv50 / maxForScale) * 100);
  const color = pct > 60 ? 'var(--hp-green)' : pct > 30 ? 'var(--hp-yellow)' : 'var(--hp-red)';
  const remaining = 510 - totalEVs;
  const maxAdd = Math.min(252 - ev, remaining);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'2px', marginBottom:'6px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', fontFamily:'var(--font-mono)' }}>
        <span style={{ color:'var(--grey-400)', width:'36px', textAlign:'right', flexShrink:0 }}>{label}</span>
        <div style={{ flex:1, height:'5px', background:'var(--grey-700)' }}>
          <div style={{ width:`${pct}%`, height:'100%', background:color, transition:'width 0.3s ease' }} />
        </div>
        <span style={{ width:'28px', color:'var(--white)', fontSize:'11px', textAlign:'right', flexShrink:0 }}>{lv50}</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'4px', paddingLeft:'42px' }}>
        <button
          onClick={() => onEVChange(statKey, Math.max(0, ev - 4))}
          disabled={ev <= 0}
          style={{ background:'transparent', border:'1px solid var(--border)', color: ev > 0 ? 'var(--white)' : 'var(--grey-700)', width:'16px', height:'16px', cursor: ev > 0 ? 'pointer' : 'not-allowed', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, lineHeight:1 }}>
          −
        </button>
        <input
          type="range" min="0" max="252" step="4"
          value={ev}
          onChange={e => {
            const newVal = parseInt(e.target.value);
            const delta = newVal - ev;
            if (delta > 0 && delta > remaining) return;
            onEVChange(statKey, newVal);
          }}
          style={{ flex:1, accentColor:'#4090d0', height:'4px', cursor:'pointer' }}
        />
        <button
          onClick={() => onEVChange(statKey, Math.min(252, ev + 4))}
          disabled={maxAdd <= 0}
          style={{ background:'transparent', border:'1px solid var(--border)', color: maxAdd > 0 ? 'var(--white)' : 'var(--grey-700)', width:'16px', height:'16px', cursor: maxAdd > 0 ? 'pointer' : 'not-allowed', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, lineHeight:1 }}>
          +
        </button>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-500)', width:'24px', textAlign:'right', flexShrink:0 }}>{ev}</span>
      </div>
    </div>
  );
}

// Dropdown for selecting one of a Pokémon's available abilities.
function AbilityPanel({ abilityList, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  if (!abilityList || abilityList.length === 0) return null;
  const current = abilityList.find(a => a.name === selected?.name) || abilityList[0];
  return (
    <div style={{ width:'100%' }}>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.12em', color:'var(--grey-400)', textTransform:'uppercase', marginBottom:'4px' }}>Ability</div>
      <div onClick={() => setOpen(o=>!o)} style={{ background:'var(--grey-800)', border:'1px solid var(--border-mid)', padding:'8px 10px', cursor:'pointer', transition:'border-color 0.15s' }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-lt)'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-mid)'}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:'var(--font-ui)', fontWeight:600, fontSize:'13px', textTransform:'capitalize', color:'var(--white)' }}>
            {current.name.replace(/-/g,' ')}
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-400)' }}>{open ? '▲' : '▼'}</span>
        </div>
        {current.isHidden && <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-500)', marginTop:'1px' }}>Hidden Ability</div>}
        {current.desc && <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-300)', marginTop:'3px', lineHeight:1.4 }}>{current.desc}</div>}
      </div>
      {open && (
        <div style={{ border:'1px solid var(--border-mid)', borderTop:'none', background:'var(--grey-900)' }}>
          {abilityList.filter(a=>a.name!==current.name).map(ab => (
            <div key={ab.name} onClick={() => { onSelect(ab); setOpen(false); }}
              style={{ padding:'8px 10px', cursor:'pointer', borderBottom:'1px solid var(--border)', transition:'background 0.1s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--grey-800)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ fontFamily:'var(--font-ui)', fontWeight:600, fontSize:'13px', textTransform:'capitalize', color:'var(--white)' }}>
                {ab.name.replace(/-/g,' ')}
                {ab.isHidden && <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-500)', marginLeft:'6px' }}>Hidden</span>}
              </div>
              {ab.desc && <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-300)', marginTop:'2px', lineHeight:1.4 }}>{ab.desc}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Overlay showing detailed info for a single move.
function MoveInfoPopup({ moveName, onClose }) {
  const [data, setData] = useState(null);
  useEffect(() => { fetchMoveData(moveName).then(setData); }, [moveName]);
  const accent = data ? (TYPE_ACCENT[data.type] || '#888') : '#888';
  const bg     = data ? (TYPE_BG[data.type]     || '#222') : '#222';
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:600 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'var(--grey-900)', border:`1px solid ${accent}`, width:'380px', animation:'popIn 0.2s ease both', overflow:'hidden' }}>
        <div style={{ background:bg, borderBottom:`1px solid ${accent}`, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'18px', letterSpacing:'0.08em', textTransform:'capitalize', color:'var(--white)' }}>
              {data ? data.name : '...'}
            </div>
            {data && (
              <div style={{ display:'flex', gap:'5px', marginTop:'6px', flexWrap:'wrap' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--white)', background:accent, padding:'2px 7px', textTransform:'uppercase' }}>{data.type}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--white)', border:'1px solid var(--border-lt)', padding:'2px 7px', textTransform:'uppercase' }}>{data.category}</span>
                {data.power>0  && <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--white)', border:'1px solid var(--border-lt)', padding:'2px 7px' }}>PWR {data.power}</span>}
                {data.pp       && <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--white)', border:'1px solid var(--border-lt)', padding:'2px 7px' }}>PP {data.pp}</span>}
                {data.accuracy && <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--white)', border:'1px solid var(--border-lt)', padding:'2px 7px' }}>ACC {data.accuracy}%</span>}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'20px', marginLeft:'8px' }}>×</button>
        </div>
        <div style={{ padding:'16px 18px' }}>
          {!data
            ? <div style={{ fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-400)' }}>Loading...</div>
            : <>
                {data.effect && <p style={{ fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--white)', lineHeight:1.65, marginBottom: data.flavor ? '12px' : 0 }}>{data.effect}</p>}
                {data.flavor && <p style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-400)', lineHeight:1.6, borderTop:'1px solid var(--border)', paddingTop:'12px', fontStyle:'italic' }}>{data.flavor}</p>}
              </>
          }
        </div>
      </div>
    </div>
  );
}

// Draggable/clickable move card in the move browser.
function MoveCard({ move, onDragStart, onDragEnd, isDragging, isSelected, onClick }) {
  const [data, setData] = useState(null);
  useEffect(() => { fetchMoveData(move).then(setData); }, [move]);

  const type   = data?.type || null;
  const bg     = type ? TYPE_BG[type]     : '#1e1e1e';
  const accent = type ? TYPE_ACCENT[type] : '#555';

  const catLabel = { physical:'Physical', special:'Special', status:'Status' }[data?.category] || '';
  const catColor = { physical:'#e07040', special:'#4090d0', status:'#aaa' }[data?.category] || '#888';
  const catBg    = { physical:'rgba(224,112,64,0.18)', special:'rgba(64,144,208,0.18)', status:'rgba(170,170,170,0.12)' }[data?.category] || 'rgba(100,100,100,0.12)';

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(move); }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{
        background: bg,
        borderTop: `2px solid ${isSelected ? '#4ade80' : 'rgba(255,255,255,0.05)'}`,
        borderRight: `2px solid ${isSelected ? '#4ade80' : 'rgba(255,255,255,0.05)'}`,
        borderBottom: `2px solid ${isSelected ? '#4ade80' : 'rgba(255,255,255,0.05)'}`,
        borderLeft: isSelected ? '4px solid #4ade80' : `4px solid ${accent}`,
        padding: '14px 16px',
        cursor: 'pointer',
        opacity: isDragging ? 0.4 : 1,
        transition: 'opacity 0.15s, filter 0.15s, border-color 0.1s',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
        minHeight: '130px',
        boxShadow: isSelected ? '0 0 0 1px #4ade80' : 'none',
      }}
      onMouseEnter={e => { if (!isDragging) e.currentTarget.style.filter = 'brightness(1.25)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
    >
      {/* Top row: type badge + category icon */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        {type
          ? <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color: accent, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:700 }}>{type}</span>
          : <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-600)' }}>…</span>
        }
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', fontWeight:700, color: catColor, background: catBg, border:`1px solid ${catColor}55`, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' }} title={data?.category}>{catLabel}</span>
      </div>

      {/* Move name */}
      <div style={{ fontFamily:'var(--font-ui)', fontWeight:700, fontSize:'16px', textTransform:'capitalize', color:'var(--white)', lineHeight:1.2 }}>
        {move}
      </div>

      {/* Stats row */}
      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
        {data?.power > 0 && (
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--white)', background:'rgba(0,0,0,0.4)', padding:'2px 6px' }}>
            PWR {data.power}
          </span>
        )}
        {data?.accuracy > 0 && (
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--white)', background:'rgba(0,0,0,0.4)', padding:'2px 6px' }}>
            ACC {data.accuracy}%
          </span>
        )}
        {data?.pp && (
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--white)', background:'rgba(0,0,0,0.4)', padding:'2px 6px' }}>
            PP {data.pp}
          </span>
        )}
      </div>

      {/* Effect description full white text */}
      {data?.effect && (
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--white)', lineHeight:1.55, opacity: 0.85 }}>
          {data.effect}
        </div>
      )}
    </div>
  );
}

// Party move slot that accepts drops and shows the assigned move.
function DropSlot({ move, idx, onDrop, onRemove, dragOver, onDragOver, onDragLeave, isSelected, onClick }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!move) { setData(null); return; }
    fetchMoveData(move).then(setData);
  }, [move]);

  const type   = data?.type || null;
  const bg     = move && type ? TYPE_BG[type]    : dragOver ? 'rgba(192,168,32,0.08)' : 'var(--grey-900)';
  const accent = move && type ? TYPE_ACCENT[type] : dragOver ? '#c0a820' : 'var(--border)';
  const catLabel = { physical:'Physical', special:'Special', status:'Status' }[data?.category] || '';
  const catColor = { physical:'#e07040', special:'#4090d0', status:'#aaa' }[data?.category] || '#888';
  const catBg    = { physical:'rgba(224,112,64,0.18)', special:'rgba(64,144,208,0.18)', status:'rgba(170,170,170,0.12)' }[data?.category] || '';

  const borderColor = isSelected ? 'var(--white)' : dragOver ? '#c0a820' : 'rgba(255,255,255,0.07)';

  return (
    <div
      onDragOver={e => { e.preventDefault(); onDragOver(idx); }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop(idx); }}
      onClick={onClick}
      style={{
        background: isSelected ? 'rgba(255,255,255,0.08)' : dragOver ? 'rgba(192,168,32,0.08)' : bg,
        borderTop: `2px solid ${borderColor}`,
        borderRight: `2px solid ${borderColor}`,
        borderBottom: `2px solid ${borderColor}`,
        borderLeft: `5px solid ${isSelected ? 'var(--white)' : accent}`,
        padding: '12px 16px',
        minHeight: move ? '110px' : '72px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        transition: 'background 0.15s, border-color 0.15s',
        flex: 1,
        cursor: move ? 'pointer' : 'default',
        boxShadow: isSelected ? '0 0 14px rgba(255,255,255,0.15)' : 'none',
      }}
    >
      {move ? (
        <>
          {/* Header row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', minWidth:0 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-500)', flexShrink:0 }}>{idx+1}</span>
              {type && (
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', textTransform:'uppercase', color: accent, background:'rgba(0,0,0,0.35)', padding:'2px 7px', flexShrink:0, fontWeight:700 }}>
                  {type}
                </span>
              )}
              <span style={{ fontFamily:'var(--font-ui)', fontWeight:700, fontSize:'16px', textTransform:'capitalize', color:'var(--white)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {move}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
              {catLabel && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', fontWeight:700, color: catColor, background: catBg, border:`1px solid ${catColor}55`, padding:'2px 6px', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{catLabel}</span>}
              <button onClick={e => { e.stopPropagation(); onRemove(idx); }}
                style={{ background:'none', border:'none', color:'var(--grey-600)', cursor:'pointer', fontSize:'18px', padding:'0 2px', lineHeight:1, transition:'color 0.1s' }}
                onMouseEnter={e=>e.currentTarget.style.color='var(--white)'}
                onMouseLeave={e=>e.currentTarget.style.color='var(--grey-600)'}>
                ×
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {data?.power > 0 && <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--white)', background:'rgba(0,0,0,0.35)', padding:'2px 6px' }}>PWR {data.power}</span>}
            {data?.accuracy > 0 && <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--white)', background:'rgba(0,0,0,0.35)', padding:'2px 6px' }}>ACC {data.accuracy}%</span>}
            {data?.pp && <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--white)', background:'rgba(0,0,0,0.35)', padding:'2px 6px' }}>PP {data.pp}</span>}
          </div>

          {/* Description white */}
          {data?.effect && (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--white)', lineHeight:1.55, opacity: 0.85 }}>
              {data.effect}
            </div>
          )}
        </>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:'12px', flex:1 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-600)', flexShrink:0 }}>{idx+1}</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'14px', color: dragOver ? '#c0a820' : 'var(--grey-600)', fontStyle:'italic' }}>
            {dragOver ? 'Drop here' : ' empty slot'}
          </span>
        </div>
      )}
    </div>
  );
}

// Full move-browser overlay for replacing one of the four party moves.
function ChangeMovePopup({ pokemon, currentMoves, onSave, onClose }) {
  const allMoves = (pokemon.cachedData?.moves || []).filter(m => MOVE_EFFECTS[m]?.operational);

  const [moves, setMoves] = useState(() => [...currentMoves]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [filterPower, setFilterPower] = useState('all');
  const [draggedMove, setDraggedMove] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [moveData, setMoveData] = useState({});
  // Click-to-select state:
  // selectedCard = move name from grid (pending placement)
  // selectedSlot = slot index from left panel (pending replacement)
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    allMoves.forEach(m => {
      fetchMoveData(m).then(d => setMoveData(prev => ({ ...prev, [m]: d })));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const equippedSet = new Set(moves.filter(Boolean));

  // Exclude equipped moves from available list
  const filtered = allMoves.filter(m => {
    if (equippedSet.has(m)) return false;
    if (!m.toLowerCase().includes(search.toLowerCase())) return false;
    const d = moveData[m];
    if (filterType !== 'all' && d?.type !== filterType) return false;
    if (filterCat !== 'all' && d?.category !== filterCat) return false;
    if (filterPower === 'has' && !(d?.power > 0)) return false;
    if (filterPower === 'none' && d?.power > 0) return false;
    return true;
  });

    const handleDrop = (slotIdx) => {
    if (!draggedMove) return;
    const next = [...moves];
    const existingIdx = next.indexOf(draggedMove);
    if (existingIdx !== -1) next[existingIdx] = null;
    next[slotIdx] = draggedMove;
    setMoves(next);
    setDraggedMove(null);
    setDragOverSlot(null);
    setSelectedCard(null);
    setSelectedSlot(null);
  };

    // Clicking a grid card:
  //   - If a slot is already selected → place card into that slot
  //   - Otherwise → select this card (highlight it)
  //   - If this card is already selected → deselect
  const handleCardClick = (moveName) => {
    if (selectedSlot !== null) {
      // Slot was waiting → place card there
      const next = [...moves];
      next[selectedSlot] = moveName;
      setMoves(next);
      setSelectedSlot(null);
      setSelectedCard(null);
    } else {
      setSelectedCard(prev => prev === moveName ? null : moveName);
    }
  };

  // Clicking a drop slot:
  //   - If a card is selected → place it in this slot
  //   - If a slot move is selected and this slot has a move → swap them
  //   - If this slot has a move and nothing else selected → select this slot
  //   - If this slot is already selected → deselect
  const handleSlotClick = (slotIdx) => {
    if (selectedCard !== null) {
      // Place selected card into this slot
      const next = [...moves];
      next[slotIdx] = selectedCard;
      setMoves(next);
      setSelectedCard(null);
      setSelectedSlot(null);
    } else if (selectedSlot !== null && selectedSlot !== slotIdx) {
      // Swap two equipped slots
      const next = [...moves];
      [next[selectedSlot], next[slotIdx]] = [next[slotIdx], next[selectedSlot]];
      setMoves(next);
      setSelectedSlot(null);
    } else if (moves[slotIdx]) {
      // Select this slot (to swap or to pick a replacement from grid)
      setSelectedSlot(prev => prev === slotIdx ? null : slotIdx);
    }
  };

  const handleRemove = (idx) => {
    const next = [...moves]; next[idx] = null; setMoves(next);
    if (selectedSlot === idx) setSelectedSlot(null);
  };

  const presentTypes = [...new Set(allMoves.map(m => moveData[m]?.type).filter(Boolean))].sort();

  // Helper hint text
  const hintText = selectedCard
    ? `"${selectedCard}" selected click a slot to place it`
    : selectedSlot !== null
    ? `Slot ${selectedSlot + 1} selected click another slot to swap, or click a move to replace it`
    : 'Click or drag a move card to assign it to a slot';

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:400, padding:'12px' }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'var(--grey-900)', border:'1px solid var(--border-lt)',
        width:'95vw', height:'95vh',
        display:'flex', flexDirection:'column', animation:'popIn 0.2s ease both', overflow:'hidden',
      }}>

        {/* Header */}
        <div style={{ background:'var(--grey-800)', borderBottom:'1px solid var(--border)', padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:'12px' }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'20px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--white)' }}>
              Change Moves
            </span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color: (selectedCard || selectedSlot !== null) ? '#c0a820' : 'var(--grey-400)', transition:'color 0.2s' }}>
              {hintText}
            </span>
          </div>
          <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
            {(selectedCard || selectedSlot !== null) && (
              <button onClick={() => { setSelectedCard(null); setSelectedSlot(null); }}
                style={{ background:'transparent', border:'1px solid var(--border-mid)', color:'var(--grey-400)', padding:'7px 14px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'12px', transition:'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-lt)';e.currentTarget.style.color='var(--white)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-mid)';e.currentTarget.style.color='var(--grey-400)';}}>
                Cancel
              </button>
            )}
            <button onClick={() => { onSave(moves); onClose(); }}
              style={{ background:'var(--white)', border:'none', color:'var(--black)', padding:'9px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.08em', textTransform:'uppercase', transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--grey-200)'}
              onMouseLeave={e=>e.currentTarget.style.background='var(--white)'}>
              Confirm
            </button>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--grey-400)', cursor:'pointer', fontSize:'24px', lineHeight:1, padding:'0 4px' }}>×</button>
          </div>
        </div>

        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

          {/* Left 4 drop slots */}
          <div style={{ width:'340px', minWidth:'340px', borderRight:'1px solid var(--border)', padding:'16px', display:'flex', flexDirection:'column', gap:'10px', flexShrink:0, overflowY:'auto' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'12px', letterSpacing:'0.14em', color:'var(--grey-400)', textTransform:'uppercase', paddingBottom:'10px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
              Current Moves
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', flex:1 }}>
              {[0,1,2,3].map(idx => (
                <DropSlot
                  key={idx}
                  move={moves[idx]}
                  idx={idx}
                  onDrop={handleDrop}
                  onRemove={handleRemove}
                  dragOver={dragOverSlot === idx}
                  onDragOver={setDragOverSlot}
                  onDragLeave={() => setDragOverSlot(null)}
                  isSelected={selectedSlot === idx}
                  onClick={() => handleSlotClick(idx)}
                />
              ))}
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-500)', textAlign:'center', paddingTop:'8px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
              {moves.filter(Boolean).length} / 4 slots filled
            </div>
          </div>

          {/* Right filters + card grid */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

            {/* Filter bar */}
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center', flexShrink:0, background:'var(--grey-800)' }}>
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="Search moves…"
                style={{ background:'var(--grey-900)', border:'1px solid var(--border-mid)', padding:'7px 12px', color:'var(--white)', fontSize:'13px', fontFamily:'var(--font-mono)', outline:'none', width:'180px', flexShrink:0 }}
                onFocus={e=>e.target.style.borderColor='var(--border-lt)'}
                onBlur={e=>e.target.style.borderColor='var(--border-mid)'}
              />

              <div style={{ display:'flex', gap:'4px' }}>
                {[['all','All'],['physical','Physical'],['special','Special'],['status','Status']].map(([v,l]) => {
                  const btnColor = v === 'physical' ? '#e07040' : v === 'special' ? '#4090d0' : v === 'status' ? '#aaa' : 'var(--white)';
                  const btnBg    = v === 'physical' ? 'rgba(224,112,64,0.18)' : v === 'special' ? 'rgba(64,144,208,0.18)' : v === 'status' ? 'rgba(170,170,170,0.12)' : '';
                  return (
                    <button key={v} onClick={() => setFilterCat(v)}
                      style={{ padding:'6px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.04em',
                        background: filterCat===v ? (btnBg || 'var(--grey-600)') : 'var(--grey-900)',
                        border: `1px solid ${filterCat===v ? (v !== 'all' ? btnColor : 'var(--border-lt)') : 'var(--border-mid)'}`,
                        color: filterCat===v && v !== 'all' ? btnColor : 'var(--white)',
                        transition:'all 0.1s',
                      }}>{l}</button>
                  );
                })}
              </div>

              <div style={{ display:'flex', gap:'4px' }}>
                {[['all','Any PWR'],['has','Has PWR'],['none','No PWR']].map(([v,l]) => (
                  <button key={v} onClick={() => setFilterPower(v)}
                    style={{ padding:'6px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.04em',
                      background: filterPower===v ? 'var(--grey-600)' : 'var(--grey-900)',
                      border: `1px solid ${filterPower===v ? 'var(--border-lt)' : 'var(--border-mid)'}`,
                      color: 'var(--white)', transition:'all 0.1s',
                    }}>{l}</button>
                ))}
              </div>

              <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                <button onClick={() => setFilterType('all')}
                  style={{ padding:'4px 9px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase',
                    background: filterType==='all' ? 'var(--grey-500)' : 'var(--grey-900)',
                    border: `1px solid ${filterType==='all' ? 'var(--border-lt)' : 'var(--border-mid)'}`,
                    color: 'var(--white)', transition:'all 0.1s',
                  }}>All Types</button>
                {presentTypes.map(t => (
                  <button key={t} onClick={() => setFilterType(filterType===t ? 'all' : t)}
                    style={{ padding:'4px 9px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase',
                      background: filterType===t ? (TYPE_BG[t]||'#333') : 'var(--grey-900)',
                      border: `1px solid ${filterType===t ? (TYPE_ACCENT[t]||'#555') : 'var(--border-mid)'}`,
                      color: 'var(--white)', transition:'all 0.1s',
                    }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Card grid fixed 3 columns */}
            <div style={{ flex:1, overflowY:'auto', padding:'14px 16px' }}>
              {filtered.length === 0 ? (
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'14px', color:'var(--grey-500)', textAlign:'center', paddingTop:'60px' }}>
                  No moves match your filters
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px' }}>
                  {filtered.map(m => (
                    <MoveCard
                      key={m}
                      move={m}
                      isDragging={draggedMove === m}
                      isSelected={selectedCard === m}
                      onDragStart={setDraggedMove}
                      onDragEnd={() => setDraggedMove(null)}
                      onClick={() => handleCardClick(m)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding:'8px 16px', borderTop:'1px solid var(--border)', fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-500)', flexShrink:0 }}>
              {filtered.length} move{filtered.length !== 1 ? 's' : ''} available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Read-only display of a currently assigned move.
function CurrentMoveSlot({ move, idx }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!move) { setData(null); return; }
    fetchMoveData(move).then(setData);
  }, [move]);

  const type   = data?.type || null;
  const bg     = move && type ? TYPE_BG[type]    : 'var(--grey-900)';
  const accent = move && type ? TYPE_ACCENT[type] : 'var(--border)';
  const catLabel = { physical:'Physical', special:'Special', status:'Status' }[data?.category] || '';
  const catColor = { physical:'#e07040', special:'#4090d0', status:'#aaa' }[data?.category] || '#888';
  const catBg    = { physical:'rgba(224,112,64,0.18)', special:'rgba(64,144,208,0.18)', status:'rgba(170,170,170,0.12)' }[data?.category] || '';

  return (
    <div style={{
      background: bg,
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      borderLeft: `3px solid ${accent}`,
      padding: '9px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      minHeight: '40px',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-500)', flexShrink:0 }}>{idx+1}</span>
        {move ? (
          <>
            {type && <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', color:accent, background:'rgba(0,0,0,0.35)', padding:'1px 5px', flexShrink:0 }}>{type}</span>}
            <span style={{ fontFamily:'var(--font-ui)', fontWeight:700, fontSize:'14px', textTransform:'capitalize', color:'var(--white)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {move}
            </span>
            {catLabel && <span style={{ fontFamily:'var(--font-mono)', fontSize:'8px', fontWeight:700, color: catColor, background: catBg, border:`1px solid ${catColor}55`, padding:'1px 5px', textTransform:'uppercase', letterSpacing:'0.04em', flexShrink:0, whiteSpace:'nowrap' }}>{catLabel}</span>}
            {data?.power > 0 && (
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--white)', background:'rgba(0,0,0,0.3)', padding:'1px 5px', flexShrink:0 }}>
                {data.power}
              </span>
            )}
          </>
        ) : (
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-600)', fontStyle:'italic' }}> empty</span>
        )}
      </div>
      {move && data?.effect && (
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-300)', lineHeight:1.45, paddingLeft:'20px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>
          {data.effect}
        </div>
      )}
    </div>
  );
}

// Main popup: left panel for stats/EVs/item, right panel for moves.
export default function CustomizePopup({ pokemon, onClose, onSave }) {
  const cached = pokemon.cachedData;

  const [currentMoves,    setCurrentMoves]    = useState(() => {
    const init = pokemon.moves?.length ? pokemon.moves : (cached?.moves?.slice(0,4) || []);
    return [...init, null, null, null, null].slice(0,4);
  });
  const [selectedItem,    setSelectedItem]    = useState(pokemon.item || null);
  const [selectedAbility, setSelectedAbility] = useState(pokemon.ability || cached?.abilities?.[0] || null);
  const [showItems,       setShowItems]       = useState(false);
  const [showChangeMoves, setShowChangeMoves] = useState(false);
  const [moveInfoTarget,  setMoveInfoTarget]  = useState(null);
  const [friendship,      setFriendship]      = useState(pokemon.friendship ?? 128);
  const [gender,          setGender]          = useState(pokemon.gender ?? 'm');
  const [evs, setEvs] = useState(() => pokemon.evs || {
    hp:0, attack:0, defense:0, 'special-attack':0, 'special-defense':0, speed:0
  });
  const totalEVs = Object.values(evs).reduce((a, b) => a + b, 0);
  const handleEVChange = (statKey, newVal) => {
    setEvs(prev => {
      const oldVal = prev[statKey] || 0;
      const delta = newVal - oldVal;
      const total = Object.values(prev).reduce((a, b) => a + b, 0);
      if (delta > 0 && total + delta > 510) return prev;
      return { ...prev, [statKey]: newVal };
    });
  };

  const abilityList = cached?.abilities || [];
  const stats       = cached?.stats     || [];
  const types       = cached?.types     || [];
  const sprite = cached?.sprite || null;

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'1rem' }}>
        <div onClick={e=>e.stopPropagation()} style={{ background:'var(--grey-900)', border:'1px solid var(--border-lt)', width:'min(960px,100%)', maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column', animation:'popIn 0.25s ease both' }}>

          {/* Header */}
          <div style={{ background:'var(--grey-800)', borderBottom:'1px solid var(--border)', padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'20px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--white)' }}>
              {pokemon.name.replace(/-/g,' ')}
            </span>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--white)', cursor:'pointer', fontSize:'22px' }}>×</button>
          </div>

          <div style={{ display:'flex', overflow:'hidden', flex:1 }}>

            {/* Left column */}
            <div style={{ width:'320px', minWidth:'320px', borderRight:'1px solid var(--border)', padding:'16px', overflowY:'auto', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
              {sprite
                ? <img src={sprite} alt={pokemon.name} style={{ width:'110px', height:'110px', objectFit:'contain' }} />
                : <div style={{ width:'110px', height:'110px', background:'var(--grey-800)' }} />
              }
              <div style={{ fontFamily:'var(--font-display)', fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'center', color:'var(--white)' }}>
                {pokemon.name.replace(/-/g,' ')}
              </div>
              <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', justifyContent:'center' }}>
                {types.map(t => (
                  <span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--white)', background:TYPE_BG[t]||'var(--grey-700)', border:`1px solid ${TYPE_ACCENT[t]||'var(--border)'}`, padding:'2px 7px', textTransform:'uppercase' }}>{t}</span>
                ))}
              </div>
              {/* EV budget indicator */}
              <div style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2px' }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--grey-400)' }}>Stats Lv50</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color: totalEVs >= 510 ? '#c03030' : totalEVs >= 400 ? '#c8b820' : '#60c060' }}>
                  {510 - totalEVs} EVs left
                </span>
              </div>
              <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'0px' }}>
                {stats.map(s => (
                  <EVStatRow
                    key={s.name}
                    statKey={s.name}
                    label={STAT_LABELS[s.name] || s.name.slice(0,4).toUpperCase()}
                    base={s.value}
                    ev={evs[s.name] || 0}
                    iv={31}
                    onEVChange={handleEVChange}
                    totalEVs={totalEVs}
                  />
                ))}
              </div>
              <AbilityPanel abilityList={abilityList} selected={selectedAbility} onSelect={setSelectedAbility} />

              <div style={{ width:'100%' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.12em', color:'var(--grey-400)', textTransform:'uppercase', marginBottom:'4px', marginTop:'4px' }}>Item</div>
                <button onClick={() => setShowItems(true)} style={{ width:'100%', background:'var(--grey-800)', border:'1px solid var(--border-mid)', color:'var(--white)', padding:'9px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'12px', textAlign:'left', transition:'border-color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-lt)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-mid)'}>
                  {selectedItem ? (selectedItem.name || selectedItem) : 'No Item'}
                </button>
                {selectedItem && (
                  <button onClick={() => setSelectedItem(null)} style={{ width:'100%', background:'transparent', border:'none', color:'var(--grey-500)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'11px', padding:'3px', textAlign:'center' }}>
                    remove item
                  </button>
                )}
              </div>

              <div style={{ width:'100%' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.12em', color:'var(--grey-400)', textTransform:'uppercase', marginBottom:'4px', marginTop:'4px' }}>Gender</div>
                <div style={{ display:'flex', gap:'4px' }}>
                  {[['m','♂ Male'],['f','♀ Female'],['n',' None']].map(([val, label]) => (
                    <button key={val} onClick={() => setGender(val)} style={{
                      flex:1, padding:'6px 0', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'11px',
                      background: gender===val ? 'var(--grey-600)' : 'var(--grey-800)',
                      border: `1px solid ${gender===val ? 'var(--border-lt)' : 'var(--border-mid)'}`,
                      color: gender===val ? 'var(--white)' : 'var(--grey-400)',
                      transition:'all 0.1s',
                    }}>{label}</button>
                  ))}
                </div>
              </div>

              <div style={{ width:'100%' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px', marginTop:'4px' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.12em', color:'var(--grey-400)', textTransform:'uppercase' }}>Friendship</div>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--white)' }}>{friendship}</span>
                </div>
                <input type="range" min={0} max={255} value={friendship} onChange={e => setFriendship(Number(e.target.value))}
                  style={{ width:'100%', accentColor:'var(--white)', cursor:'pointer' }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-500)', marginTop:'2px' }}>
                  <span>Frustration ↑</span><span>Return ↑</span>
                </div>
              </div>
            </div>

            {/* Right column moves */}
            <div style={{ flex:1, padding:'16px', display:'flex', flexDirection:'column', gap:'10px', minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border)', paddingBottom:'10px', flexShrink:0 }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'13px', letterSpacing:'0.15em', color:'var(--white)', textTransform:'uppercase' }}>
                  Current Moves
                </span>
                <button
                  onClick={() => setShowChangeMoves(true)}
                  style={{
                    background:'var(--grey-800)', border:'1px solid var(--border-mid)',
                    color:'var(--white)', padding:'7px 14px', cursor:'pointer',
                    fontFamily:'var(--font-mono)', fontSize:'12px', letterSpacing:'0.05em',
                    textTransform:'uppercase', transition:'all 0.15s',
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-lt)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-mid)';}}
                >
                  Change Moves
                </button>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {[0,1,2,3].map(idx => (
                  <CurrentMoveSlot key={idx} move={currentMoves[idx]} idx={idx} />
                ))}
              </div>

              <button
                onClick={() => { onSave({...pokemon, moves:currentMoves.filter(Boolean), item:selectedItem, ability:selectedAbility, friendship, gender, evs, ivs: pokemon.ivs || { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } }); onClose(); }}
                style={{ background:'var(--white)', border:'none', color:'var(--black)', padding:'13px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'15px', letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.15s', marginTop:'auto' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--grey-200)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--white)'}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>

      {showItems && <ItemPopup onClose={()=>setShowItems(false)} onSelect={setSelectedItem} selectedItem={selectedItem} />}
      {moveInfoTarget && <MoveInfoPopup moveName={moveInfoTarget} onClose={()=>setMoveInfoTarget(null)} />}
      {showChangeMoves && (
        <ChangeMovePopup
          pokemon={pokemon}
          currentMoves={currentMoves}
          onSave={(newMoves) => setCurrentMoves([...newMoves, null, null, null, null].slice(0,4))}
          onClose={() => setShowChangeMoves(false)}
        />
      )}
    </>
  );
}
