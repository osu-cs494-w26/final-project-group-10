/*
 * BattlePage.jsx Active battle screen. Loads team data, runs the
 * battle engine, plays animations, and handles player input.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GEN1_POKEMON, GEN2_POKEMON, GEN3_POKEMON, GEN4_POKEMON, GEN5_POKEMON } from '../utils/constants.js';
import { fetchPokeData, fetchMoveData } from '../hooks/usePokemonData.js';
import { useBattle, BATTLE_STATE, CONTROLLER } from '../hooks/useBattle.js';
import { MOVE_EFFECTS, getOperationalMoves } from '../utils/moveEffects.js';
import BattleViewport from '../components/BattleViewport.jsx';
import TeamStatusBar  from '../components/TeamStatusBar.jsx';
import BattleMoves    from '../components/BattleMoves.jsx';
import BattleConsole  from '../components/BattleConsole.jsx';

function randomTeam(size = 6) {
  const pool  = [...GEN1_POKEMON, ...GEN2_POKEMON, ...GEN3_POKEMON, ...GEN4_POKEMON, ...GEN5_POKEMON];
  const picks = [];
  while (picks.length < size) picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return picks;
}


// Distributes 510 EVs randomly across 6 stats for AI battles.
function randomEvs() {
  // Distribute 510 EVs randomly across 6 stats, max 252 per stat
  const statKeys = ['hp','attack','defense','special-attack','special-defense','speed'];
  const evs = { hp:0, attack:0, defense:0, 'special-attack':0, 'special-defense':0, speed:0 };
  let remaining = 510;
  // Bias toward offensive/speed stats 
  const weights = [0.1, 0.25, 0.1, 0.25, 0.1, 0.2];
  statKeys.forEach((k, i) => {
    const alloc = Math.min(252, Math.floor(remaining * weights[i] * (0.7 + Math.random() * 0.6)));
    evs[k] = alloc;
    remaining -= alloc;
  });
  // Dump any leftover into a random stat that has room
  while (remaining > 0) {
    const k = statKeys[Math.floor(Math.random() * statKeys.length)];
    const add = Math.min(remaining, 252 - evs[k]);
    evs[k] += add;
    remaining -= add;
    if (remaining > 0 && Object.values(evs).every(v => v >= 252)) break;
  }
  return evs;
}


const DEFAULT_IVS = { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 };
const DEFAULT_EVS = { hp:0,  attack:0,  defense:0,  'special-attack':0,  'special-defense':0,  speed:0  };
function ensureEvs(evs) { return evs ? { ...DEFAULT_EVS, ...evs } : DEFAULT_EVS; }
function ensureIvs(ivs) { return ivs ? { ...DEFAULT_IVS, ...ivs } : DEFAULT_IVS; }

// Progress bar shown while Pokémon and move data loads.
function LoadingScreen({ progress, total }) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;
  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', background: 'var(--black)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '0.2em', color: 'var(--white)', textTransform: 'uppercase' }}>Preparing Battle</div>
      <div style={{ width: '300px', height: '4px', background: 'var(--grey-800)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--white)', transition: 'width 0.2s ease' }} />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--grey-400)' }}>Loading... {pct}%</div>
    </div>
  );
}

// Post-battle popup showing a Pokémon's full stats and moves.
function PokemonDetailPopup({ poke, moveData, onClose }) {
  if (!poke) return null;
  const STAT_BARS = [
    { key:'hp',    label:'HP',      val: poke.maxHp, max:400, color:'var(--hp-green)' },
    { key:'atk',   label:'ATK',     val: poke.atk,   max:250, color:'#e07040' },
    { key:'def',   label:'DEF',     val: poke.def,   max:250, color:'#4090d0' },
    { key:'spatk', label:'SP.ATK',  val: poke.spatk, max:250, color:'#c070e0' },
    { key:'spdef', label:'SP.DEF',  val: poke.spdef, max:250, color:'#30a8a0' },
    { key:'spd',   label:'SPD',     val: poke.spd,   max:250, color:'#c8b820' },
  ];
  const TYPE_COLORS = { fire:'#e06030',water:'#4090d0',grass:'#60c060',electric:'#c8b820',psychic:'#c060a0',ice:'#60c0c0',dragon:'#6040c0',dark:'#604830',fairy:'#e080a0',normal:'#a0a090',fighting:'#c04020',flying:'#8090c0',poison:'#a040a0',ground:'#c09040',rock:'#b0a060',bug:'#90b020',ghost:'#705090',steel:'#b0b0c0' };
  const CAT_COLOR = { physical:'#e07040', special:'#4090d0', status:'#aaa' };
  const CAT_BG    = { physical:'rgba(224,112,64,0.18)', special:'rgba(64,144,208,0.18)', status:'rgba(170,170,170,0.12)' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:400 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:'var(--grey-900)', borderLeft:'4px solid var(--border-lt)', borderTop:'1px solid var(--border-lt)', borderRight:'1px solid var(--border)', borderBottom:'1px solid var(--border)', width:'100%', maxWidth:'520px', maxHeight:'85vh', overflowY:'auto', animation:'fadeIn 0.2s ease' }}>

        {/* Header */}
        <div style={{ background:'var(--grey-800)', padding:'16px 18px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'14px' }}>
          {poke.sprite && <img src={poke.sprite} alt={poke.name} style={{ width:'64px', height:'64px', imageRendering:'pixelated', filter: poke.fainted ? 'grayscale(1) opacity(0.5)' : 'none' }} />}
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'20px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>{poke.name}</div>
            <div style={{ display:'flex', gap:'5px', marginTop:'5px' }}>
              {(poke.types||[]).map(t => (
                <span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', color:TYPE_COLORS[t]||'#888', border:`1px solid ${TYPE_COLORS[t]||'#888'}`, padding:'1px 7px', letterSpacing:'0.06em' }}>{t}</span>
              ))}
              {poke.fainted && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', color:'#c03030', border:'1px solid #c03030', padding:'1px 7px' }}>Fainted</span>}
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-400)', marginTop:'5px' }}>
              HP: {poke.fainted ? 0 : poke.hp} / {poke.maxHp}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'1px solid var(--border)', color:'var(--grey-400)', width:'28px', height:'28px', cursor:'pointer', fontSize:'13px', alignSelf:'flex-start', transition:'all 0.1s' }}
            onMouseEnter={e=>{e.currentTarget.style.color='var(--white)';e.currentTarget.style.borderColor='var(--border-lt)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='var(--grey-400)';e.currentTarget.style.borderColor='var(--border)';}}>✕</button>
        </div>

        {/* Stats */}
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--grey-600)', marginBottom:'10px' }}>Stats</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {STAT_BARS.map(({ key, label, val, max, color }) => (
              <div key={key} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-500)', textTransform:'uppercase', width:'44px', flexShrink:0 }}>{label}</span>
                <div style={{ flex:1, height:'6px', background:'var(--grey-700)' }}>
                  <div style={{ width:`${Math.min(100, (val/max)*100)}%`, height:'100%', background:color, transition:'width 0.4s ease' }} />
                </div>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--white)', width:'28px', textAlign:'right', flexShrink:0 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Moves */}
        <div style={{ padding:'14px 18px' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--grey-600)', marginBottom:'10px' }}>Moves</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {(poke.moves||[]).map(moveName => {
              const md = moveData?.[moveName];
              const cat = md?.category || 'status';
              return (
                <div key={moveName} style={{ background:'var(--grey-800)', border:'1px solid var(--border-mid)', padding:'8px 12px', display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'13px', letterSpacing:'0.06em', textTransform:'capitalize', color:'var(--white)' }}>{moveName.replace(/-/g,' ')}</div>
                    {md?.effect_short && <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-500)', marginTop:'2px', lineHeight:1.4 }}>{md.effect_short}</div>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'3px', flexShrink:0 }}>
                    {md?.type && <span style={{ fontFamily:'var(--font-mono)', fontSize:'8px', textTransform:'uppercase', color:TYPE_COLORS[md.type]||'#888', border:`1px solid ${TYPE_COLORS[md.type]||'#888'}`, padding:'1px 5px' }}>{md.type}</span>}
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'8px', textTransform:'uppercase', color:CAT_COLOR[cat], background:CAT_BG[cat], border:`1px solid ${CAT_COLOR[cat]}44`, padding:'1px 5px' }}>{cat}</span>
                    {md?.power > 0 && <span style={{ fontFamily:'var(--font-mono)', fontSize:'8px', color:'var(--grey-500)' }}>{md.power} PWR</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Victory/defeat overlay with party sprites and result buttons.
function GameOverScreen({ winner, playerTeam, aiTeam, trainerLabel, moveData, onRestart, onBack }) {
  const [inspecting, setInspecting] = React.useState(null);
  const isVictory = winner === 0;
  const isDraw    = winner === 'draw';
  const accent    = isVictory ? '#60c060' : isDraw ? '#c8b820' : '#c03030';
  const bg        = isVictory ? '#1a3a1a' : isDraw ? '#3a2c08' : '#3a0a0a';
  const label     = isVictory ? 'Victory!' : isDraw ? 'Draw!' : 'Defeated!';

  const TeamRow = ({ team, title }) => (
    <div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--white)', marginBottom:'8px' }}>{title}</div>
      <div style={{ display:'flex', gap:'6px' }}>
        {team.map((p, i) => {
          const pct = p.fainted ? 0 : p.hp / p.maxHp;
          const hpColor = pct > 0.5 ? 'var(--hp-green)' : pct > 0.2 ? 'var(--hp-yellow)' : 'var(--hp-red)';
          return (
            <div key={i} onClick={() => setInspecting(p)}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', opacity: p.fainted ? 0.35 : 1, cursor:'pointer', transition:'opacity 0.15s, transform 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px) scale(1.06)'}
              onMouseLeave={e=>e.currentTarget.style.transform='none'}>
              <div style={{ width:'52px', height:'52px', background:'rgba(0,0,0,0.4)', border:`1px solid ${p.fainted ? 'var(--border)' : accent}55`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {p.sprite
                  ? <img src={p.sprite} alt={p.name} style={{ width:'48px', height:'48px', imageRendering:'pixelated', filter: p.fainted ? 'grayscale(1)' : 'none' }} />
                  : <div style={{ width:'32px', height:'32px', background:'var(--grey-700)' }} />}
              </div>
              <div style={{ width:'52px', height:'3px', background:'var(--grey-700)' }}>
                <div style={{ width:`${pct*100}%`, height:'100%', background: hpColor }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {inspecting && <PokemonDetailPopup poke={inspecting} moveData={moveData} onClose={() => setInspecting(null)} />}
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
        <div style={{
          background:'var(--grey-900)',
          borderTop:    `1px solid ${accent}`,
          borderRight:  `1px solid var(--border)`,
          borderBottom: `1px solid var(--border)`,
          borderLeft:   `4px solid ${accent}`,
          width:'100%', maxWidth:'700px',
          boxShadow: `0 0 60px ${accent}22`,
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ background: bg, padding:'24px 28px', borderBottom:`1px solid ${accent}44` }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.18em', color:accent, marginBottom:'6px' }}>Battle Result</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'48px', letterSpacing:'0.2em', textTransform:'uppercase', color:accent, lineHeight:1 }}>{label}</div>
          </div>
          <div style={{ padding:'20px 28px', display:'flex', flexDirection:'column', gap:'16px', borderBottom:`1px solid var(--border)` }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--white)', letterSpacing:'0.08em' }}>Click a Pokémon to view its stats and moves</div>
            {playerTeam && <TeamRow team={playerTeam} title="Your Party" />}
            {aiTeam     && <TeamRow team={aiTeam}     title={`${trainerLabel || "Opponent"}'s Party`} />}
          </div>
          <div style={{ padding:'18px 28px', display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <button onClick={onBack} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--grey-400)', padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'13px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.color='var(--white)';e.currentTarget.style.borderColor='var(--border-lt)';}}
              onMouseLeave={e=>{e.currentTarget.style.color='var(--grey-400)';e.currentTarget.style.borderColor='var(--border)';}}>
              ← Menu
            </button>
            <button onClick={onRestart} style={{ background:`${accent}22`, border:`1px solid ${accent}`, color:accent, padding:'10px 28px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'13px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s', fontWeight:700 }}
              onMouseEnter={e=>{e.currentTarget.style.background=accent;e.currentTarget.style.color='#000';}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${accent}22`;e.currentTarget.style.color=accent;}}>
              Play Again
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


// Forces the player to choose a replacement when their active Pokémon faints.
function FaintSwitchPopup({ team, onSwitch }) {
  const available = team.filter(p => !p.fainted);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 150 }}>
      <div style={{ background: 'var(--grey-900)', border: '1px solid var(--border-lt)', padding: '28px', minWidth: '360px', animation: 'popIn 0.2s ease both' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: '4px' }}>
          Choose Next Pokémon
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--grey-500)', marginBottom: '16px' }}>
          Your Pokémon fainted send out a replacement.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {available.map((poke) => {
            const realIdx = team.indexOf(poke);
            const pct     = poke.hp / poke.maxHp;
            const hpColor = pct > 0.5 ? 'var(--hp-green)' : pct > 0.2 ? 'var(--hp-yellow)' : 'var(--hp-red)';
            return (
              <button key={realIdx} onClick={() => onSwitch(realIdx)}
                style={{ background: 'var(--grey-800)', border: '1px solid var(--border-mid)', padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--white)', fontFamily: 'inherit', transition: 'border-color 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-lt)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}>
                {poke.sprite && <img src={poke.sprite} alt={poke.name} style={{ width: '48px', height: '48px', imageRendering: 'pixelated' }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>{poke.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '5px', background: 'var(--grey-700)' }}>
                      <div style={{ width: `${pct * 100}%`, height: '100%', background: hpColor }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--grey-400)' }}>{poke.hp}/{poke.maxHp}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Clickable party bar shown at the bottom of the battle screen.
function PartyStrip({ team, activeIdx, onSwitch, disabled }) {
  return (
    <div className="battle-party-strip">
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--grey-500)', textTransform: 'uppercase', flexShrink: 0 }}>Party</span>
      {team.map((poke, i) => {
        const isActive = i === activeIdx;
        const pct      = poke.hp / poke.maxHp;
        const hpColor  = pct > 0.5 ? 'var(--hp-green)' : pct > 0.2 ? 'var(--hp-yellow)' : 'var(--hp-red)';
        const canClick = !disabled && !poke.fainted && !isActive;
        return (
          <div key={i} onClick={() => canClick && onSwitch(i)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '5px 8px', background: isActive ? 'var(--grey-700)' : 'var(--grey-800)', border: `1px solid ${isActive ? 'var(--border-lt)' : 'var(--border)'}`, cursor: canClick ? 'pointer' : 'default', opacity: poke.fainted ? 0.3 : disabled && !isActive ? 0.5 : 1, transition: 'all 0.15s', minWidth: '52px', flexShrink: 0 }}
            onMouseEnter={e => { if (canClick) e.currentTarget.style.borderColor = 'var(--grey-400)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = isActive ? 'var(--border-lt)' : 'var(--border)'; }}>
            {poke.sprite
              ? <img src={poke.sprite} alt={poke.name} style={{ width: '36px', height: '36px', imageRendering: 'pixelated' }} />
              : <div style={{ width: '36px', height: '36px', background: 'var(--grey-700)' }} />}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: isActive ? 'var(--white)' : 'var(--grey-400)', textAlign: 'center', textTransform: 'capitalize', maxWidth: '52px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{poke.name}</div>
            <div style={{ width: '100%', height: '3px', background: 'var(--grey-600)' }}>
              <div style={{ width: `${Math.max(0, pct * 100)}%`, height: '100%', background: hpColor, transition: 'width 0.3s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Internally, side 0 = human player, side 1 = AI.
// The 'player' variable names below refer to side-0 for readability.
function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s', flexShrink:0 }}
      onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';}}
      onMouseLeave={e=>{e.currentTarget.style.background='none';}}>
      &larr; Menu
    </button>
  );
}

// Main battle component: data loading, animation loop, and UI layout.
export default function BattlePage({ team, setPage, opponentTeam = null, trainerLabel = 'Opponent' }) {
  const [ready,    setReady]    = useState(false);
  const [progress, setProgress] = useState(0);
  const [total,    setTotal]    = useState(1);
  const [mdc,      setMdc]      = useState({});

  const battle = useBattle();

  const [visSnap,   setVisSnap]   = useState(null);
  const [log,       setLog]       = useState([]);
  const [animating, setAnimating] = useState(false);
  const [faintSwitchOpen, setFaintSwitchOpen] = useState(false);
  const [lockedMove, setLockedMove] = useState(null);
  const [pendingOpponentMove, setPendingOpponentMove] = useState(null);

  // Animation counters/signals (index 0 = side 0, index 1 = side 1)
  const [lunge,   setLunge]   = useState([0, 0]);
  const [hit,     setHit]     = useState([null, null]);
  const [faint,   setFaint]   = useState([0, 0]);
  const [swOut,   setSwOut]   = useState([0, 0]);
  const [swIn,    setSwIn]    = useState([0, 0]);
  const [aiSwIn,  setAiSwIn]  = useState([0, 0]);

  const timerRef = useRef(null);

  const DUR = {
    LUNGE: 320, HIT: 520, FAINT: 700,
    STATUS_HIT: 480, SWITCH_OUT: 360,
    SWITCH_IN: 480, AI_SWITCH_IN: 480,
    MSG: 0, DONE: 0,
  };

  const playStep = useCallback((steps, idx, finalSnap) => {
    if (idx >= steps.length) return;
    const step = steps[idx];
    const next = () => {
      timerRef.current = setTimeout(() => playStep(steps, idx + 1, finalSnap), DUR[step.type] ?? 0);
    };

    // Helpers side is now 0|1
    const isSide0 = step.side === 0;

    switch (step.type) {
      case 'MSG':
        setLog(prev => [...prev, step.text]);
        next();
        break;

      case 'LUNGE':
        setLunge(prev => { const n = [...prev]; n[step.side]++; return n; });
        next();
        break;

      case 'HIT':
        setHit(prev => {
          const n = [...prev];
          n[step.side] = { hpAfter: step.hpAfter, maxHp: step.maxHp, ts: Date.now() };
          return n;
        });
        timerRef.current = setTimeout(() => playStep(steps, idx + 1, finalSnap), DUR.HIT);
        break;

      case 'STATUS_HIT':
        setHit(prev => {
          const n = [...prev];
          n[step.side] = { hpAfter: step.hpAfter, maxHp: step.maxHp, ts: Date.now() };
          return n;
        });
        timerRef.current = setTimeout(() => playStep(steps, idx + 1, finalSnap), DUR.STATUS_HIT);
        break;

      case 'FAINT':
        setFaint(prev => { const n = [...prev]; n[step.side]++; return n; });
        timerRef.current = setTimeout(() => {
          if (step.side === 1) setVisSnap(finalSnap); // AI fainted → update viewport
          playStep(steps, idx + 1, finalSnap);
        }, DUR.FAINT);
        break;

      case 'SWITCH_OUT':
        setSwOut(prev => { const n = [...prev]; n[step.side ?? 0]++; return n; });
        next();
        break;

      case 'SWITCH_IN': {
        const swSnap = JSON.parse(JSON.stringify(finalSnap));
        const si = step.side ?? 0;
        const incoming = swSnap.teams[si][swSnap.activeIdx[si]];
        if (incoming) incoming.hp = incoming.maxHp;
        setVisSnap(swSnap);
        setSwIn(prev => { const n = [...prev]; n[si]++; return n; });
        next();
        break;
      }

      case 'AI_SWITCH_IN': {
        const swSnap = JSON.parse(JSON.stringify(finalSnap));
        const si = step.side ?? 1;
        const incoming = swSnap.teams[si][swSnap.activeIdx[si]];
        if (incoming) incoming.hp = incoming.maxHp;
        setVisSnap(swSnap);
        setAiSwIn(prev => { const n = [...prev]; n[si]++; return n; });
        next();
        break;
      }

      case 'FORCED_SWITCH': {
        // Human player is forced to switch (U-Turn, Parting Shot, etc.)
        // Pause the step queue and show the switch panel.
        // If the attacker went first and queued an opponent move, store it.
        const oppMove = step.opponentMoveName ?? null;
        setVisSnap(finalSnap);
        setAnimating(false);
        setFaintSwitchOpen(true);
        setPendingOpponentMove(oppMove);
        battle.setPhase(BATTLE_STATE.SELECTING);
        break;
      }

      case 'DONE':
        timerRef.current = setTimeout(() => {
          setVisSnap(finalSnap);
          setAnimating(false);

          if (!finalSnap?.teams) { battle.setPhase(BATTLE_STATE.SELECTING); return; }

          const side0Out = finalSnap.teams[0].every(p => p.fainted);
          const side1Out = finalSnap.teams[1].every(p => p.fainted);

          if (side0Out || side1Out) {
            const w = side0Out && side1Out ? 'draw' : side1Out ? 0 : 1;
            battle.applyWinner(w);
            return;
          }

          // Check if human side's active pokemon fainted show swap popup
          const activePoke = finalSnap.teams[0][finalSnap.activeIdx[0]];
          const hasAlive   = finalSnap.teams[0].some(p => !p.fainted);
          if (activePoke?.fainted && hasAlive) {
            setFaintSwitchOpen(true);
            battle.setPhase(BATTLE_STATE.SELECTING);
            return;
          }

          battle.setPhase(BATTLE_STATE.SELECTING);
        }, 100);
        break;

      default:
        next();
    }
  }, [battle]);

    useEffect(() => {
    let cancelled = false;
    (async () => {
      const shuffle = arr => { const a = [...arr]; for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };

      // Build both teams if team prop is empty we're in random mode
      const isRandom = !team || team.length === 0;
      const playerNames = isRandom ? randomTeam(6) : null;
      const playerBase  = isRandom
        ? playerNames.map(name => ({ name, moves: [], item: null, evs: randomEvs(), ivs: null }))
        : team.map(p => ({ ...p, evs: ensureEvs(p.evs), ivs: ensureIvs(p.ivs) }));

      const aiNames   = opponentTeam ? opponentTeam.map(p => p.name) : randomTeam(6);
      const aiPokemon = opponentTeam
        ? opponentTeam.map(p => ({ name: p.name, moves: p.moves || [], item: p.item || null, evs: ensureEvs(p.evs), ivs: ensureIvs(p.ivs) }))
        : aiNames.map(name => ({ name, moves: [], item: null, evs: randomEvs(), ivs: null }));

      const allPokemon = [...playerBase, ...aiPokemon];
      setTotal(allPokemon.length);

      const assignRandomMoves = (opMoves) => {
        const damaging = shuffle(opMoves.filter(m => MOVE_EFFECTS[m]?.power !== null));
        const support  = shuffle(opMoves.filter(m => MOVE_EFFECTS[m]?.power === null));
        const picked = [...damaging.slice(0, 2)];
        const rest = shuffle([...damaging.slice(2), ...support]);
        for (const m of rest) { if (picked.length >= 4) break; picked.push(m); }
        return picked.length >= 2 ? picked : opMoves.slice(0, 4);
      };

      const allData = {};
      for (const p of allPokemon) {
        if (cancelled) return;
        const data = await fetchPokeData(p.name);
        allData[p.name] = data;
        if (!p.moves || p.moves.length === 0) {
          const opMoves = getOperationalMoves(data.moves);
          p.moves = assignRandomMoves(opMoves);
          if (p.moves.length < 2) p.moves = (data.moves || []).slice(0, 4);
        }
        // Assign EVs if not already set random for any pokemon without saved EVs
        if (!p.evs || !p.evs.attack) p.evs = isRandom ? randomEvs() : ensureEvs(p.evs);
        if (!p.ivs || !p.ivs.attack) p.ivs = ensureIvs(p.ivs);
        setProgress(prev => prev + 1);
      }
      if (cancelled) return;

      // Normalise player team moves
      const playerTeamData = playerBase.map(p => ({
        ...p,
        moves: p.moves?.length
          ? getOperationalMoves(p.moves)
          : getOperationalMoves(allData[p.name]?.moves),
      }));
      playerTeamData.forEach(p => {
        if (p.moves.length === 0) p.moves = (allData[p.name]?.moves || []).slice(0, 4);
      });

      const allMoveNames = new Set();
      [...playerTeamData, ...aiPokemon].forEach(p => p.moves.forEach(m => allMoveNames.add(m)));
      const map = {};
      await Promise.all([...allMoveNames].map(async m => { map[m] = await fetchMoveData(m); }));
      if (cancelled) return;

      battle.setMoveDataMap(map);
      setMdc(map);

      // Generic side configs change side 1 to CONTROLLER.HUMAN for 2-player
      battle.initBattle([
        { team: playerTeamData, controllerType: CONTROLLER.HUMAN, label: 'You' },
        { team: aiPokemon,      controllerType: CONTROLLER.AI,    label: trainerLabel },
      ], allData, map);

      setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (battle.snap && !visSnap) setVisSnap(battle.getSnap());
  }, [battle.snap]);

    const handleMove = useCallback((moveName) => {
    if (animating || faintSwitchOpen || battle.phase !== BATTLE_STATE.SELECTING) return;
    // If player is locked into a charge move, force it
    const moveToUse = lockedMove ?? moveName;
    const { steps } = battle.computeTurn([moveToUse, null], false);
    const finalSnap = battle.getSnap();
    // Check if the player's active mon is now locked into a charge move after this turn
    const playerPoke = finalSnap.teams[0][finalSnap.activeIdx[0]];
    const newLock = playerPoke?.volatile?.lockedMove ?? null;
    setLockedMove(newLock);
    setAnimating(true);
    battle.setPhase(BATTLE_STATE.ANIMATING);
    playStep(steps, 0, finalSnap);
  }, [animating, faintSwitchOpen, battle, playStep, lockedMove]);

  const handleFaintSwitch = useCallback((newIdx) => {
    const switchSteps    = battle.computeSwitch(newIdx, 0);
    // If there's a pending opponent follow-up move (from U-Turn / Parting Shot going first),
    // run it against the newly switched-in Pokémon before ending the turn.
    const followUpSteps  = pendingOpponentMove
      ? battle.computeOpponentFollowUp(pendingOpponentMove)
      : [];
    const allSteps       = [...switchSteps, ...followUpSteps, { type: 'DONE' }];
    const finalSnap      = battle.getSnap();
    setFaintSwitchOpen(false);
    setLockedMove(null);
    setPendingOpponentMove(null);
    setAnimating(true);
    battle.setPhase(BATTLE_STATE.ANIMATING);
    playStep(allSteps, 0, finalSnap);
  }, [battle, playStep, pendingOpponentMove]);

  const handleSwitch = useCallback((newIdx) => {
    if (animating || faintSwitchOpen) return;
    const snap = battle.getSnap();
    const poke = snap.teams[0][newIdx];
    if (!poke || poke.fainted) return;

    const switchSteps          = battle.computeSwitch(newIdx, 0);
    const { steps: turnSteps } = battle.computeTurn([null, null], true);
    const allSteps             = [...switchSteps, ...turnSteps];
    const finalSnap            = battle.getSnap();
    setAnimating(true);
    battle.setPhase(BATTLE_STATE.ANIMATING);
    playStep(allSteps, 0, finalSnap);
  }, [animating, faintSwitchOpen, battle, playStep]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (!ready || !visSnap) return <LoadingScreen progress={progress} total={total} />;

  // Map generic snap to component-friendly names
  const playerTeam  = visSnap.teams[0];
  const aiTeam      = visSnap.teams[1];
  const playerActive = visSnap.activeIdx[0];
  const aiActive    = visSnap.activeIdx[1];
  const playerPoke  = playerTeam[playerActive];
  const aiPoke      = aiTeam[aiActive];
  const inputLocked = animating || faintSwitchOpen;

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', background: 'var(--black)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {battle.winner !== null && <GameOverScreen winner={battle.winner} playerTeam={visSnap?.teams[0]} aiTeam={visSnap?.teams[1]} trainerLabel={trainerLabel} moveData={mdc} onRestart={() => setPage('battlemode')} onBack={() => setPage('battlemode')} />}

      {faintSwitchOpen && (
        <FaintSwitchPopup
          team={playerTeam}
          onSwitch={handleFaintSwitch}
        />
      )}

      <TeamStatusBar
        playerTeam={playerTeam} aiTeam={aiTeam}
        playerActive={playerActive} aiActive={aiActive}
      />

      <BattleViewport
        player={playerPoke}
        ai={aiPoke}
        playerLunge={lunge[0]}
        aiLunge={lunge[1]}
        playerHit={hit[0]}
        aiHit={hit[1]}
        playerFaint={faint[0]}
        aiFaint={faint[1]}
        playerSwOut={swOut[0]}
        playerSwIn={swIn[0]}
        aiSwIn={aiSwIn[1]}
      />

      {/* Moves panel and battle console: side by side on desktop, stacked on mobile */}
      <div className="battle-bottom-grid">
        <BattleMoves
          pokemon={playerPoke}
          moveData={mdc}
          onMove={handleMove}
          disabled={inputLocked}
          lockedMove={lockedMove}
        />
        {/* Wrapper gives the console a hard cap so it never expands on mobile */}
        <div className="battle-console-wrap">
          <BattleConsole log={log} />
        </div>
      </div>

      <PartyStrip
        team={playerTeam}
        activeIdx={playerActive}
        onSwitch={handleSwitch}
        disabled={inputLocked || !!lockedMove}
      />
      {/* Back button: left on desktop, centred on mobile via CSS class */}
      <div className="battle-back-row">
        <BackBtn onClick={() => setPage('battlemode')} />
      </div>
    </div>
  );
}
