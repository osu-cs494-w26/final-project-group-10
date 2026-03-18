/*
 * CustomizePopup.jsx Modal for editing a party member's EVs, ability,
 * item, gender, and friendship, and for viewing/changing their moves.
 * On mobile: single scrollable column. On desktop: left stats + right moves.
 *
 * ChangeMovePopup is imported from its own file.
 * useIsMobile is imported from its own hook.
 */

import React, { useState, useEffect } from 'react';
import ChangeMovePopup  from './ChangeMovePopup.jsx';
import useIsMobile      from '../hooks/useIsMobile.js';
import { fetchMoveData }               from '../hooks/usePokemonData.js';
import { calcHPStat, calcBattleStat }  from '../utils/battleEngine.js';
import { TYPE_BG, TYPE_ACCENT } from '../utils/constants.js';

const STAT_LABELS = {
  hp:'HP', attack:'ATK', defense:'DEF',
  'special-attack':'SATK', 'special-defense':'SDEF', speed:'SPD',
};

const HP_STAT_MAX    = 370;
const OTHER_STAT_MAX = 310;

/* Stat row showing the lv50 value with an EV slider and +/- buttons. */
function EVStatRow({ statKey, label, base, ev, onEVChange, totalEVs, iv }) {
  const lv50      = statKey === 'hp' ? calcHPStat(base, ev, iv) : calcBattleStat(base, ev, iv);
  const maxScale  = statKey === 'hp' ? HP_STAT_MAX : OTHER_STAT_MAX;
  const pct       = Math.min(100, (lv50 / maxScale) * 100);
  const color     = pct > 60 ? 'var(--hp-green)' : pct > 30 ? 'var(--hp-yellow)' : 'var(--hp-red)';
  const remaining = 510 - totalEVs;
  const maxAdd    = Math.min(252 - ev, remaining);

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
        <button onClick={() => onEVChange(statKey, Math.max(0, ev - 4))} disabled={ev <= 0}
          style={{ background:'transparent', border:'1px solid var(--border)', color: ev > 0 ? 'var(--white)' : 'var(--grey-700)', width:'16px', height:'16px', cursor: ev > 0 ? 'pointer' : 'not-allowed', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, lineHeight:1 }}>−</button>
        <input type="range" min="0" max="252" step="4" value={ev}
          onChange={e => { const n = parseInt(e.target.value); const d = n - ev; if (d > 0 && d > remaining) return; onEVChange(statKey, n); }}
          style={{ flex:1, accentColor:'#4090d0', height:'4px', cursor:'pointer' }} />
        <button onClick={() => onEVChange(statKey, Math.min(252, ev + 4))} disabled={maxAdd <= 0}
          style={{ background:'transparent', border:'1px solid var(--border)', color: maxAdd > 0 ? 'var(--white)' : 'var(--grey-700)', width:'16px', height:'16px', cursor: maxAdd > 0 ? 'pointer' : 'not-allowed', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, lineHeight:1 }}>+</button>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-500)', width:'24px', textAlign:'right', flexShrink:0 }}>{ev}</span>
      </div>
    </div>
  );
}

/* Read-only display of a currently assigned move in the main popup. */
function CurrentMoveSlot({ move, idx }) {
  const [data, setData] = useState(null);
  useEffect(() => { if (!move) { setData(null); return; } fetchMoveData(move).then(setData); }, [move]);
  const type     = data?.type || null;
  const bg       = move && type ? TYPE_BG[type] : 'var(--grey-900)';
  const accent   = move && type ? TYPE_ACCENT[type] : 'var(--border)';
  const catLabel = { physical:'Physical', special:'Special', status:'Status' }[data?.category] || '';
  const catColor = { physical:'#e07040', special:'#4090d0', status:'#aaa' }[data?.category] || '#888';
  const catBg    = { physical:'rgba(224,112,64,0.18)', special:'rgba(64,144,208,0.18)', status:'rgba(170,170,170,0.12)' }[data?.category] || '';

  return (
    <div style={{ background:bg, borderTop:'1px solid rgba(255,255,255,0.06)', borderRight:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)', borderLeft:`3px solid ${accent}`, padding:'9px 12px', display:'flex', flexDirection:'column', gap:'4px', minHeight:'40px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-500)', flexShrink:0 }}>{idx + 1}</span>
        {move ? (
          <>
            {type && <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', color:accent, background:'rgba(0,0,0,0.35)', padding:'1px 5px', flexShrink:0 }}>{type}</span>}
            <span style={{ fontFamily:'var(--font-ui)', fontWeight:700, fontSize:'14px', textTransform:'capitalize', color:'var(--white)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{move}</span>
            {catLabel && <span style={{ fontFamily:'var(--font-mono)', fontSize:'8px', fontWeight:700, color:catColor, background:catBg, border:`1px solid ${catColor}55`, padding:'1px 5px', textTransform:'uppercase', letterSpacing:'0.04em', flexShrink:0, whiteSpace:'nowrap' }}>{catLabel}</span>}
            {data?.power > 0 && <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--white)', background:'rgba(0,0,0,0.3)', padding:'1px 5px', flexShrink:0 }}>{data.power}</span>}
          </>
        ) : (
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-600)', fontStyle:'italic' }}> empty</span>
        )}
      </div>
      {move && data?.effect && (
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-300)', lineHeight:1.45, paddingLeft:'20px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>{data.effect}</div>
      )}
    </div>
  );
}

/* Main popup: edits stats, moves, ability, item, gender, and friendship.
   Mobile: single scrollable column. Desktop: left stats col + right moves col. */
export default function CustomizePopup({ pokemon, onClose, onSave }) {
  const isMobile = useIsMobile();
  const cached   = pokemon.cachedData;

  const [currentMoves,    setCurrentMoves]    = useState(() => {
    const init = pokemon.moves?.length ? pokemon.moves : (cached?.moves?.slice(0, 4) || []);
    return [...init, null, null, null, null].slice(0, 4);
  });
  const [selectedItem,    setSelectedItem]    = useState(pokemon.item || null);
  const [showChangeMoves, setShowChangeMoves] = useState(false);
  const [friendship,      setFriendship]      = useState(pokemon.friendship ?? 128);
  const [gender,          setGender]          = useState(pokemon.gender ?? 'm');
  const [evs, setEvs] = useState(() => pokemon.evs || {
    hp:0, attack:0, defense:0, 'special-attack':0, 'special-defense':0, speed:0,
  });

  const totalEVs = Object.values(evs).reduce((a, b) => a + b, 0);

  const handleEVChange = (statKey, newVal) => {
    setEvs(prev => {
      const delta = newVal - (prev[statKey] || 0);
      const total = Object.values(prev).reduce((a, b) => a + b, 0);
      if (delta > 0 && total + delta > 510) return prev;
      return { ...prev, [statKey]: newVal };
    });
  };

  const stats       = cached?.stats     || [];
  const types       = cached?.types     || [];
  const sprite      = cached?.staticSprite || cached?.sprite    || null;

  // Stat panel used in both the mobile and desktop layouts.
  const StatPanel = (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', padding: isMobile ? '12px' : '16px' }}>
      {sprite
        ? <img src={sprite} alt={pokemon.name} style={{ width: isMobile ? '80px' : '110px', height: isMobile ? '80px' : '110px', objectFit:'contain', imageRendering:'pixelated' }} />
        : <div style={{ width: isMobile ? '80px' : '110px', height: isMobile ? '80px' : '110px', background:'var(--grey-800)' }} />
      }
      <div style={{ fontFamily:'var(--font-display)', fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'center', color:'var(--white)' }}>{pokemon.name.replace(/-/g, ' ')}</div>
      <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', justifyContent:'center' }}>
        {types.map(t => <span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--white)', background:TYPE_BG[t]||'var(--grey-700)', border:`1px solid ${TYPE_ACCENT[t]||'var(--border)'}`, padding:'2px 7px', textTransform:'uppercase' }}>{t}</span>)}
      </div>
      <div style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2px' }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--grey-400)' }}>Stats Lv50</span>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color: totalEVs >= 510 ? '#c03030' : totalEVs >= 400 ? '#c8b820' : '#60c060' }}>{510 - totalEVs} EVs left</span>
      </div>
      <div style={{ width:'100%' }}>
        {stats.map(s => (
          <EVStatRow key={s.name} statKey={s.name} label={STAT_LABELS[s.name] || s.name.slice(0, 4).toUpperCase()} base={s.value} ev={evs[s.name] || 0} iv={31} onEVChange={handleEVChange} totalEVs={totalEVs} />
        ))}
      </div>
      <div style={{ width:'100%' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.12em', color:'var(--grey-400)', textTransform:'uppercase', marginBottom:'4px', marginTop:'4px' }}>Gender</div>
        <div style={{ display:'flex', gap:'4px' }}>
          {[['m','♂ Male'], ['f','♀ Female'], ['n','None']].map(([val, label]) => (
            <button key={val} onClick={() => setGender(val)} style={{ flex:1, padding:'6px 0', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'11px', background:gender===val?'var(--grey-600)':'var(--grey-800)', border:`1px solid ${gender===val?'var(--border-lt)':'var(--border-mid)'}`, color:gender===val?'var(--white)':'var(--grey-400)', transition:'all 0.1s' }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ width:'100%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px', marginTop:'4px' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.12em', color:'var(--grey-400)', textTransform:'uppercase' }}>Friendship</div>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--white)' }}>{friendship}</span>
        </div>
        <input type="range" min={0} max={255} value={friendship} onChange={e => setFriendship(Number(e.target.value))} style={{ width:'100%', accentColor:'var(--white)', cursor:'pointer' }} />
        <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-500)', marginTop:'2px' }}>
          <span>Frustration ↑</span><span>Return ↑</span>
        </div>
      </div>
    </div>
  );

  // Moves panel used in both the mobile and desktop layouts.
  const MovesPanel = (
    <div style={{ padding: isMobile ? '12px' : '16px', display:'flex', flexDirection:'column', gap:'10px', minWidth:0 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border)', paddingBottom:'10px', flexShrink:0 }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'13px', letterSpacing:'0.15em', color:'var(--white)', textTransform:'uppercase' }}>Current Moves</span>
        <button onClick={() => setShowChangeMoves(true)} style={{ background:'var(--grey-800)', border:'1px solid var(--border-mid)', color:'var(--white)', padding:'7px 14px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'12px', letterSpacing:'0.05em', textTransform:'uppercase' }}>Change Moves</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
        {[0, 1, 2, 3].map(idx => <CurrentMoveSlot key={idx} move={currentMoves[idx]} idx={idx} />)}
      </div>
      <button
        onClick={() => {
          onSave({ ...pokemon, moves: currentMoves.filter(Boolean), item: null, ability: null, friendship, gender, evs, ivs: pokemon.ivs || { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } });
          onClose();
        }}
        style={{ background:'var(--white)', border:'none', color:'var(--black)', padding:'13px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'15px', letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.15s', marginTop:'auto' }}>
        Confirm
      </button>
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent:'center', zIndex:200, padding: isMobile ? '0' : '1rem' }}>
        <div onClick={e => e.stopPropagation()} style={{ background:'var(--grey-900)', border:'1px solid var(--border-lt)', width: isMobile ? '100%' : 'min(960px,100%)', height: isMobile ? '100%' : 'auto', maxHeight: isMobile ? '100%' : '92vh', overflow:'hidden', display:'flex', flexDirection:'column', animation:'popIn 0.25s ease both' }}>

          {/* Header */}
          <div style={{ background:'var(--grey-800)', borderBottom:'1px solid var(--border)', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize: isMobile ? '16px' : '20px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--white)' }}>{pokemon.name.replace(/-/g, ' ')}</span>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--white)', cursor:'pointer', fontSize:'22px' }}>×</button>
          </div>

          {isMobile ? (
            /* Mobile: single scrollable column */
            <div style={{ flex:1, overflowY:'auto' }}>
              {StatPanel}
              <div style={{ height:'1px', background:'var(--border)' }} />
              {MovesPanel}
            </div>
          ) : (
            /* Desktop: two-column side by side */
            <div style={{ display:'flex', overflow:'hidden', flex:1 }}>
              <div style={{ width:'320px', minWidth:'320px', borderRight:'1px solid var(--border)', overflowY:'auto', display:'flex', flexDirection:'column' }}>
                {StatPanel}
              </div>
              <div style={{ flex:1, overflowY:'auto' }}>
                {MovesPanel}
              </div>
            </div>
          )}
        </div>
      </div>

      {showChangeMoves && (
        <ChangeMovePopup
          pokemon={pokemon}
          currentMoves={currentMoves}
          onSave={newMoves => setCurrentMoves([...newMoves, null, null, null, null].slice(0, 4))}
          onClose={() => setShowChangeMoves(false)}
        />
      )}
    </>
  );
}
