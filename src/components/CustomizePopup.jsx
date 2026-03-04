// Modal for editing a Pokemon's moves, ability, and item.
// Opens instantly because all data is pre-cached when the Pokemon is added to the team.

import React, { useState, useEffect } from 'react';
import ItemPopup from './ItemPopup.jsx';
import { fetchMoveData } from '../hooks/usePokemonData.js';

// Shorthand labels for the stat bars
const STAT_LABELS = { hp:'HP', attack:'ATK', defense:'DEF', 'special-attack':'SATK', 'special-defense':'SDEF', speed:'SPD' };

// Dark background tint per type
const TYPE_BG = {
  fire:'#7a2a10',water:'#1a3a6a',grass:'#1a3a12',electric:'#4a3a00',
  psychic:'#4a1028',ice:'#0a3a48',dragon:'#280e58',dark:'#1a1008',
  fairy:'#4a1830',normal:'#303030',fighting:'#3a0e08',flying:'#283048',
  poison:'#300a48',ground:'#3a2a08',rock:'#302808',bug:'#1e3008',
  ghost:'#180a30',steel:'#283038',
};

// Bright accent color per type, used on borders and badges
const TYPE_ACCENT = {
  fire:'#e06030',water:'#4090d0',grass:'#50a030',electric:'#c0a820',
  psychic:'#d03060',ice:'#30a0b0',dragon:'#6030c0',dark:'#706040',
  fairy:'#c05070',normal:'#888',fighting:'#b03020',flying:'#6080a0',
  poison:'#8030a0',ground:'#a07820',rock:'#908020',bug:'#60902a',
  ghost:'#503088',steel:'#507088',
};

// Stat bar — label, colored fill bar, numeric value
function StatBar({ label, value }) {
  const pct = Math.min(100,(value/255)*100);
  const color = pct>60?'var(--hp-green)':pct>30?'var(--hp-yellow)':'var(--hp-red)';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', fontFamily:'var(--font-mono)' }}>
      <span style={{ color:'var(--grey-500)', width:'36px', textAlign:'right' }}>{label}</span>
      <div style={{ flex:1, height:'5px', background:'var(--grey-700)' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, transition:'width 0.5s ease' }} />
      </div>
      <span style={{ width:'26px', color:'var(--grey-300)', fontSize:'10px' }}>{value}</span>
    </div>
  );
}

// MoveInfoPopup — shown when clicking ? on any move, loads description from PokeAPI
function MoveInfoPopup({ moveName, onClose }) {
  const [data, setData] = useState(null);
  useEffect(() => { fetchMoveData(moveName).then(setData); }, [moveName]);
  const accent = data ? (TYPE_ACCENT[data.type] || '#888') : '#888';
  const bg     = data ? (TYPE_BG[data.type]     || '#222') : '#222';
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'var(--grey-900)', border:`1px solid ${accent}`, width:'340px', animation:'popIn 0.2s ease both', overflow:'hidden' }}>
        <div style={{ background:bg, borderBottom:`1px solid ${accent}`, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'16px', letterSpacing:'0.08em', textTransform:'capitalize', color:'var(--white)' }}>
              {data ? data.name : '...'}
            </div>
            {data && (
              <div style={{ display:'flex', gap:'5px', marginTop:'5px', flexWrap:'wrap' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--white)', background:accent, padding:'1px 6px', textTransform:'uppercase' }}>{data.type}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-300)', border:'1px solid var(--border-lt)', padding:'1px 6px', textTransform:'uppercase' }}>{data.category}</span>
                {data.power>0  && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-300)', border:'1px solid var(--border-lt)', padding:'1px 6px' }}>PWR {data.power}</span>}
                {data.pp       && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-300)', border:'1px solid var(--border-lt)', padding:'1px 6px' }}>PP {data.pp}</span>}
                {data.accuracy && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-300)', border:'1px solid var(--border-lt)', padding:'1px 6px' }}>ACC {data.accuracy}%</span>}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'18px', marginLeft:'8px' }}>x</button>
        </div>
        <div style={{ padding:'14px 16px' }}>
          {!data
            ? <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-500)' }}>Loading...</div>
            : <>
                {data.effect && <p style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-300)', lineHeight:1.65, marginBottom: data.flavor ? '10px' : 0 }}>{data.effect}</p>}
                {data.flavor && <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-500)', lineHeight:1.6, borderTop:'1px solid var(--border)', paddingTop:'10px', fontStyle:'italic' }}>{data.flavor}</p>}
              </>
          }
        </div>
      </div>
    </div>
  );
}

// AbilityPanel — shows current ability with description, dropdown to switch
function AbilityPanel({ abilityList, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  if (!abilityList || abilityList.length === 0) return null;
  const current = abilityList.find(a => a.name === selected?.name) || abilityList[0];
  return (
    <div style={{ width:'100%' }}>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'10px', letterSpacing:'0.12em', color:'var(--grey-500)', textTransform:'uppercase', marginBottom:'4px' }}>Ability</div>
      <div onClick={() => setOpen(o=>!o)} style={{ background:'var(--grey-800)', border:'1px solid var(--border-mid)', padding:'7px 10px', cursor:'pointer', transition:'border-color 0.15s' }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-lt)'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-mid)'}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:'var(--font-ui)', fontWeight:600, fontSize:'12px', textTransform:'capitalize', color:'var(--white)' }}>
            {current.name.replace(/-/g,' ')}
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-500)' }}>{open ? '▲' : '▼'}</span>
        </div>
        {current.isHidden && <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-600)', marginTop:'1px' }}>Hidden Ability</div>}
        {current.desc && <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-500)', marginTop:'3px', lineHeight:1.4 }}>{current.desc}</div>}
      </div>
      {open && (
        <div style={{ border:'1px solid var(--border-mid)', borderTop:'none', background:'var(--grey-900)' }}>
          {abilityList.filter(a=>a.name!==current.name).map(ab => (
            <div key={ab.name} onClick={() => { onSelect(ab); setOpen(false); }}
              style={{ padding:'8px 10px', cursor:'pointer', borderBottom:'1px solid var(--border)', transition:'background 0.1s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--grey-800)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ fontFamily:'var(--font-ui)', fontWeight:600, fontSize:'12px', textTransform:'capitalize', color:'var(--grey-300)' }}>
                {ab.name.replace(/-/g,' ')}
                {ab.isHidden && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-600)', marginLeft:'6px' }}>Hidden</span>}
              </div>
              {ab.desc && <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-500)', marginTop:'2px', lineHeight:1.4 }}>{ab.desc}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// MoveListRow — each row in the all-moves list fetches its own type on mount
// so every row is colored regardless of scroll position
function MoveListRow({ move, onPick, onInfo }) {
  const [type, setType] = useState(null);
  useEffect(() => { fetchMoveData(move).then(d => setType(d.type)); }, [move]);
  const bg     = type ? TYPE_BG[type]     : '#1a1a1a';
  const accent = type ? TYPE_ACCENT[type] : '#555';
  return (
    <div style={{ display:'flex', alignItems:'stretch', background:bg, borderLeft:`3px solid ${accent}`, borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <div onClick={onPick}
        style={{ flex:1, padding:'6px 8px', cursor:'pointer', display:'flex', flexDirection:'column', gap:'2px', transition:'filter 0.1s' }}
        onMouseEnter={e=>e.currentTarget.style.filter='brightness(1.35)'}
        onMouseLeave={e=>e.currentTarget.style.filter='none'}>
        {type && <span style={{ fontFamily:'var(--font-mono)', fontSize:'8px', color:accent, textTransform:'uppercase', letterSpacing:'0.05em', lineHeight:1 }}>{type}</span>}
        <span style={{ fontFamily:'var(--font-ui)', fontWeight:600, fontSize:'12px', textTransform:'capitalize', color:'var(--white)', lineHeight:1.2 }}>{move}</span>
      </div>
      <button onClick={onInfo}
        style={{ background:'rgba(0,0,0,0.25)', border:'none', borderLeft:'1px solid rgba(255,255,255,0.06)', color:'var(--grey-600)', cursor:'pointer', fontSize:'11px', fontFamily:'var(--font-mono)', padding:'0 7px', flexShrink:0, transition:'color 0.1s' }}
        onMouseEnter={e=>e.currentTarget.style.color='var(--grey-100)'}
        onMouseLeave={e=>e.currentTarget.style.color='var(--grey-600)'}>
        ?
      </button>
    </div>
  );
}

// CurrentMoveSlot — one of the 4 active move slots
// Fetches its own type so colors are always correct, independent of the list
function CurrentMoveSlot({ move, idx, isSwapping, isPending, onSlotClick, onInfo, onRemove }) {
  const [type, setType] = useState(null);

  // Fetch type whenever the move in this slot changes
  useEffect(() => {
    if (!move) { setType(null); return; }
    fetchMoveData(move).then(d => setType(d.type));
  }, [move]);

  const bg     = move && type ? TYPE_BG[type]     : move ? '#282828' : 'var(--grey-900)';
  const accent = move && type ? TYPE_ACCENT[type] : isSwapping ? 'var(--white)' : 'var(--border)';

  return (
    <div onClick={() => onSlotClick(idx)}
      style={{
        background:  isSwapping ? 'var(--grey-600)' : bg,
        border:      `1px solid ${isSwapping ? 'var(--white)' : isPending && move ? '#c0a820' : 'rgba(255,255,255,0.07)'}`,
        borderLeft:  `4px solid ${accent}`,
        padding:     '9px 10px', minHeight:'42px',
        display:     'flex', alignItems:'center', justifyContent:'space-between',
        cursor:      move || isPending ? 'pointer' : 'default',
        transition:  'filter 0.1s, border-color 0.1s',
      }}
      onMouseEnter={e=>{if(move||isPending)e.currentTarget.style.filter='brightness(1.2)'}}
      onMouseLeave={e=>{e.currentTarget.style.filter='none'}}>
      <div style={{ display:'flex', alignItems:'center', gap:'7px', flex:1, minWidth:0 }}>
        {move && type && (
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'8px', textTransform:'uppercase', color:accent, background:'rgba(0,0,0,0.35)', padding:'1px 5px', flexShrink:0 }}>
            {type}
          </span>
        )}
        <span style={{ fontFamily:'var(--font-ui)', fontWeight:600, fontSize:'13px', textTransform:'capitalize', color:move?'var(--white)':'var(--grey-600)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {move || `Slot ${idx+1}`}
        </span>
      </div>
      {move && !isPending && (
        <div style={{ display:'flex', gap:'5px', alignItems:'center', flexShrink:0, marginLeft:'6px' }}>
          <button onClick={e=>{e.stopPropagation();onInfo(move);}} style={{ background:'none', border:'1px solid rgba(255,255,255,0.2)', color:'var(--grey-300)', cursor:'pointer', fontSize:'10px', fontFamily:'var(--font-mono)', padding:'1px 6px', lineHeight:1.5 }}>?</button>
          <button onClick={e=>{e.stopPropagation();onRemove(idx);}} style={{ background:'none', border:'none', color:'var(--white)', cursor:'pointer', fontSize:'13px' }}>x</button>
        </div>
      )}
    </div>
  );
}

// CustomizePopup — main modal, uses pre-cached data so it opens instantly
export default function CustomizePopup({ pokemon, onClose, onSave }) {
  const cached = pokemon.cachedData;

  // State
  const [currentMoves,    setCurrentMoves]    = useState(() => {
    const init = pokemon.moves?.length ? pokemon.moves : (cached?.moves?.slice(0,4) || []);
    return [...init, null, null, null, null].slice(0,4);
  });
  const [moveSearch,      setMoveSearch]      = useState('');
  const [selectedItem,    setSelectedItem]    = useState(pokemon.item || null);
  const [selectedAbility, setSelectedAbility] = useState(pokemon.ability || cached?.abilities?.[0] || null);
  const [showItems,       setShowItems]       = useState(false);
  const [swapSlot,        setSwapSlot]        = useState(null);
  const [moveInfoTarget,  setMoveInfoTarget]  = useState(null);
  const [pendingListMove, setPendingListMove] = useState(null);

  const allMoves    = cached?.moves     || [];
  const abilityList = cached?.abilities || [];
  const stats       = cached?.stats     || [];
  const types       = cached?.types     || [];
  const sprite = cached?.spritePixel || cached?.sprite || null;

  // Moves not already in the active 4, filtered by search
  const available = allMoves.filter(m => !currentMoves.includes(m) && m.toLowerCase().includes(moveSearch.toLowerCase()));

  // Clicking a move from the all-moves list — fill empty slot, or swap if pending
  const handleListMoveClick = (moveName) => {
    if (swapSlot !== null) {
      const next = [...currentMoves]; next[swapSlot] = moveName;
      setCurrentMoves(next); setSwapSlot(null);
    } else {
      const empty = currentMoves.findIndex(m => !m);
      if (empty !== -1) {
        const next = [...currentMoves]; next[empty] = moveName; setCurrentMoves(next);
      } else {
        setSwapSlot(-1); setPendingListMove(moveName);
      }
    }
  };

  // Clicking a current slot — place pending move or select slot for swap
  const handleCurrentMoveClick = (idx) => {
    if (pendingListMove) {
      const next = [...currentMoves]; next[idx] = pendingListMove;
      setCurrentMoves(next); setPendingListMove(null); setSwapSlot(null);
    } else if (currentMoves[idx]) {
      setSwapSlot(swapSlot === idx ? null : idx);
    }
  };

  // Remove a move from a slot
  const handleRemove = (idx) => {
    const next = [...currentMoves]; next[idx] = null;
    setCurrentMoves(next); setSwapSlot(null);
  };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'1rem' }}>
        <div onClick={e=>e.stopPropagation()} style={{ background:'var(--grey-900)', border:'1px solid var(--border-lt)', width:'min(900px,100%)', maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', animation:'popIn 0.25s ease both' }}>

          {/* Header */}
          <div style={{ background:'var(--grey-800)', borderBottom:'1px solid var(--border)', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'18px', letterSpacing:'0.1em', textTransform:'uppercase' }}>
              {pokemon.name.replace(/-/g,' ')}
            </span>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--white)', cursor:'pointer', fontSize:'20px' }}>x</button>
          </div>

          <div style={{ display:'flex', overflow:'hidden', flex:1 }}>

            {/* Left column — sprite, stats, ability, item */}
            <div style={{ width:'200px', minWidth:'200px', borderRight:'1px solid var(--border)', padding:'12px', overflowY:'auto', display:'flex', flexDirection:'column', alignItems:'center', gap:'7px' }}>
              {sprite
                ? <img src={sprite} alt={pokemon.name} style={{ width:'100px', height:'100px', objectFit:'contain' }} />
                : <div style={{ width:'100px', height:'100px', background:'var(--grey-800)' }} />
              }
              <div style={{ fontFamily:'var(--font-display)', fontSize:'13px', textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'center' }}>
                {pokemon.name.replace(/-/g,' ')}
              </div>
              <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', justifyContent:'center' }}>
                {types.map(t => (
                  <span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--white)', background:TYPE_BG[t]||'var(--grey-700)', border:`1px solid ${TYPE_ACCENT[t]||'var(--border)'}`, padding:'2px 6px', textTransform:'uppercase' }}>{t}</span>
                ))}
              </div>
              <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'3px' }}>
                {stats.map(s => <StatBar key={s.name} label={STAT_LABELS[s.name]||s.name.slice(0,4).toUpperCase()} value={s.value} />)}
              </div>
              <AbilityPanel abilityList={abilityList} selected={selectedAbility} onSelect={setSelectedAbility} />
              {/* Item selector */}
              <div style={{ width:'100%' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'10px', letterSpacing:'0.12em', color:'var(--grey-500)', textTransform:'uppercase', marginBottom:'4px', marginTop:'4px' }}>Item</div>
                <button onClick={() => setShowItems(true)} style={{ width:'100%', background:'var(--grey-800)', border:'1px solid var(--border-mid)', color:'var(--grey-200)', padding:'8px 10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'11px', textAlign:'left', transition:'border-color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-lt)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-mid)'}>
                  {selectedItem ? (selectedItem.name || selectedItem) : 'No Item'}
                </button>
                {selectedItem && (
                  <button onClick={() => setSelectedItem(null)} style={{ width:'100%', background:'transparent', border:'none', color:'var(--grey-600)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', padding:'3px', textAlign:'center' }}>
                    remove item
                  </button>
                )}
              </div>
            </div>

            {/* Center column — 4 active move slots */}
            <div style={{ flex:1, padding:'12px', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:'7px', minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.15em', color:'var(--grey-400)', textTransform:'uppercase', borderBottom:'1px solid var(--border)', paddingBottom:'6px' }}>
                Current Moves
                {(swapSlot !== null || pendingListMove) && (
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'#c0a820', marginLeft:'10px', textTransform:'none', letterSpacing:0 }}>
                    {pendingListMove ? `Click a slot to place "${pendingListMove}"` : `Click a slot to swap`}
                  </span>
                )}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px', flex:1 }}>
                {currentMoves.map((move, idx) => (
                  <CurrentMoveSlot
                    key={idx}
                    move={move}
                    idx={idx}
                    isSwapping={swapSlot === idx}
                    isPending={pendingListMove !== null}
                    onSlotClick={handleCurrentMoveClick}
                    onInfo={m => setMoveInfoTarget(m)}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
              {pendingListMove && (
                <button onClick={() => { setPendingListMove(null); setSwapSlot(null); }}
                  style={{ background:'transparent', border:'1px solid var(--border-mid)', color:'var(--grey-400)', padding:'6px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'11px' }}>
                  Cancel
                </button>
              )}
              <button onClick={() => { onSave({...pokemon, moves:currentMoves.filter(Boolean), item:selectedItem, ability:selectedAbility}); onClose(); }}
                style={{ background:'var(--white)', border:'none', color:'var(--black)', padding:'11px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--grey-200)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--white)'}>
                Confirm
              </button>
            </div>

            {/* Right column — searchable list of all moves */}
            <div style={{ width:'175px', minWidth:'175px', padding:'12px', display:'flex', flexDirection:'column', gap:'5px' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.15em', color:'var(--grey-400)', textTransform:'uppercase', borderBottom:'1px solid var(--border)', paddingBottom:'6px', flexShrink:0 }}>
                All Moves
              </div>
              <input value={moveSearch} onChange={e=>setMoveSearch(e.target.value)} placeholder="Search..."
                style={{ background:'var(--grey-800)', border:'1px solid var(--border-mid)', padding:'5px 8px', color:'var(--white)', fontSize:'11px', fontFamily:'var(--font-mono)', outline:'none', width:'100%', flexShrink:0 }}
                onFocus={e=>e.target.style.borderColor='var(--border-lt)'}
                onBlur={e=>e.target.style.borderColor='var(--border-mid)'} />
              {/* Capped height so exactly ~7 moves show before scrolling */}
              <div style={{ overflowY:'auto', maxHeight:'238px', display:'flex', flexDirection:'column', gap:'2px' }}>
                {available.map(move => (
                  <MoveListRow
                    key={move}
                    move={move}
                    onPick={() => handleListMoveClick(move)}
                    onInfo={() => setMoveInfoTarget(move)}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {showItems      && <ItemPopup onClose={()=>setShowItems(false)} onSelect={setSelectedItem} selectedItem={selectedItem} />}
      {moveInfoTarget && <MoveInfoPopup moveName={moveInfoTarget} onClose={()=>setMoveInfoTarget(null)} />}
    </>
  );
}
