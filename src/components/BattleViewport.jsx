/*
 * BattleViewport.jsx Renders the battle arena: both Pokémon sprites,
 * HP bars, stat stages, status badges, and lunge/hit animations.
 */

import React, { useEffect, useRef, useState } from 'react';
import { TYPE_BG, TYPE_COLORS} from '../utils/constants.js';

function hpColor(pct) {
  if (pct > 0.5) return 'var(--hp-green)';
  if (pct > 0.2) return 'var(--hp-yellow)';
  return 'var(--hp-red)';
}


const STATUS_COLORS = { BRN:'#b05030', PSN:'#7040a0', TOX:'#7040a0', PAR:'#a09020', SLP:'#506080', FRZ:'#4080a0' };
const STATUS_MAP    = { brn:'BRN', psn:'PSN', par:'PAR', slp:'SLP', frz:'FRZ', tox:'TOX' };
const STAGE_KEYS    = [
  {key:'atk',label:'ATK'},{key:'def',label:'DEF'},
  {key:'spatk',label:'SATK'},{key:'spdef',label:'SDEF'},{key:'spd',label:'SPD'},
  {key:'acc',label:'ACC'},{key:'eva',label:'EVA'},
];

// hitSignal: { hpAfter, maxHp, ts } when ts changes we animate from current to hpAfter

const VOLATILE_BADGES = [
  // [key, label, color, bg, description]
  { key: 'confused',       label: 'CNF',  color: '#e0a030', bg: '#3a2800', check: v => v.confused > 0,       tip: 'Confused' },
  { key: 'leechSeed',      label: 'SEED', color: '#50c050', bg: '#0a2a0a', check: v => v.leechSeed,           tip: 'Leech Seed' },
  { key: 'substituteHp',   label: 'SUB',  color: '#80c0ff', bg: '#0a1a30', check: v => v.substituteHp > 0,    tip: 'Substitute' },
  { key: 'protect',        label: 'PROT', color: '#a0e0ff', bg: '#0a2030', check: v => v.protect,             tip: 'Protected' },
  { key: 'endure',         label: 'END',  color: '#ffcc60', bg: '#302000', check: v => v.endure,              tip: 'Enduring' },
  { key: 'taunt',          label: 'TAUT', color: '#e04040', bg: '#300808', check: v => v.taunt > 0,           tip: 'Taunted' },
  { key: 'encore',         label: 'ENC',  color: '#c060e0', bg: '#200830', check: v => v.encore?.turns > 0,   tip: 'Encored' },
  { key: 'disabled',       label: 'DIS',  color: '#888888', bg: '#1a1a1a', check: v => v.disabled?.turns > 0, tip: 'Move Disabled' },
  { key: 'torment',        label: 'TORM', color: '#c04040', bg: '#2a0808', check: v => v.torment,             tip: 'Tormented' },
  { key: 'yawn',           label: 'YAWN', color: '#8888cc', bg: '#101028', check: v => v.yawn !== undefined,  tip: 'Drowsy' },
  { key: 'reflect',        label: 'REF',  color: '#60a0ff', bg: '#081828', check: v => v.reflect > 0,         tip: v => `Reflect (${v.reflect})` },
  { key: 'lightScreen',    label: 'L.SCR',color: '#ffdd40', bg: '#28200a', check: v => v.lightScreen > 0,     tip: v => `Light Screen (${v.lightScreen})` },
  { key: 'ingrain',        label: 'ROOT', color: '#40a840', bg: '#0a1e0a', check: v => v.ingrain,             tip: 'Ingrained' },
  { key: 'aquaRing',       label: 'AQUA', color: '#40b0e0', bg: '#081820', check: v => v.aquaRing,            tip: 'Aqua Ring' },
  { key: 'curse',          label: 'CURS', color: '#9040a0', bg: '#1a0828', check: v => v.curse,               tip: 'Cursed' },
  { key: 'perishCount',    label: 'PRSH', color: '#e04040', bg: '#280808', check: v => v.perishCount > 0,     tip: v => `Perish (${v.perishCount})` },
  { key: 'futureSight',    label: 'FSGT', color: '#8080e0', bg: '#101028', check: v => !!v.futureSight,       tip: 'Future Sight incoming' },
  { key: 'destinyBond',    label: 'DBND', color: '#c0c0c0', bg: '#1a1a1a', check: v => v.destinyBond,         tip: 'Destiny Bond' },
  { key: 'focusEnergy',    label: 'FOCS', color: '#ff8040', bg: '#280e00', check: v => v.focusEnergy,         tip: 'Focus Energy' },
  { key: 'safeguard',      label: 'SAFE', color: '#80ffb0', bg: '#082018', check: v => v.safeguard > 0,       tip: v => `Safeguard (${v.safeguard})` },
  { key: 'mist',           label: 'MIST', color: '#b0d8ff', bg: '#101820', check: v => v.mist > 0,            tip: 'Mist' },
];

function VolatileBadges({ volatile: v }) {
  if (!v) return null;
  const active = VOLATILE_BADGES.filter(b => b.check(v));
  if (!active.length) return null;
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:'3px', marginTop:'5px' }}>
      {active.map(b => {
        const tip = typeof b.tip === 'function' ? b.tip(v) : b.tip;
        return (
          <span key={b.key} title={tip} style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '8px',
            fontWeight:    700,
            letterSpacing: '0.04em',
            color:         b.color,
            background:    b.bg,
            border:        `1px solid ${b.color}55`,
            padding:       '1px 4px',
            cursor:        'default',
          }}>
            {b.label}
          </span>
        );
      })}
    </div>
  );
}

function AnimHPBar({ battler, hitSignal }) {
  const barRef    = useRef(null);
  const displayHp = useRef(battler?.hp ?? 0);

  // Reset bar whenever the pokemon changes (switch-in) so displayHp starts from full
  useEffect(() => {
    if (!battler || !barRef.current) return;
    const pct = Math.max(0, Math.min(1, battler.hp / battler.maxHp));
    displayHp.current = battler.hp;
    barRef.current.style.transition = 'none';
    barRef.current.style.width      = `${pct * 100}%`;
    barRef.current.style.background = hpColor(pct);
  }, [battler?.name]);

  useEffect(() => {
    if (!hitSignal || !barRef.current) return;
    const { hpAfter, maxHp } = hitSignal;
    const fromPct = Math.max(0, Math.min(1, displayHp.current / maxHp));
    const toPct   = Math.max(0, Math.min(1, hpAfter        / maxHp));

    barRef.current.style.transition = 'none';
    barRef.current.style.width      = `${fromPct * 100}%`;
    barRef.current.style.background = hpColor(fromPct);
    // Force reflow
    void barRef.current.offsetWidth;
    barRef.current.style.transition = 'width 0.55s ease-out, background 0.55s ease-out';
    barRef.current.style.width      = `${toPct * 100}%`;
    barRef.current.style.background = hpColor(toPct);
    displayHp.current = hpAfter;
  }, [hitSignal?.ts]);

  if (!battler) return null;
  const pct    = Math.max(0, Math.min(1, battler.hp / battler.maxHp));
  const color  = hpColor(pct);
  const status = battler.status && battler.status !== 'none' ? STATUS_MAP[battler.status] : null;
  const stages = battler.stages || {};
  const activeStages = STAGE_KEYS.filter(s => stages[s.key] && stages[s.key] !== 0);
  const spd    = battler.spd ?? battler.baseSPD ?? '?';

  return (
    <div className="battle-hp-card">
      {/* Name row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px', gap:'8px' }}>
        <span className="hp-name" style={{ fontFamily:'var(--font-display)', fontSize:'18px', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {battler.name}
          {battler.gender === 'm' && <span style={{ fontFamily:'var(--font-mono)', fontSize:'13px', color:'#6ab0ff', marginLeft:'6px', fontWeight:400, letterSpacing:0 }}>♂</span>}
          {battler.gender === 'f' && <span style={{ fontFamily:'var(--font-mono)', fontSize:'13px', color:'#ff8aad', marginLeft:'6px', fontWeight:400, letterSpacing:0 }}>♀</span>}
        </span>
        <div style={{ display:'flex', gap:'5px', alignItems:'center', flexShrink:0 }}>
          {battler.item && (
            <span style={{ fontSize:'11px', color:'var(--grey-400)', border:'1px solid var(--border)', padding:'2px 6px', fontFamily:'var(--font-mono)', whiteSpace:'nowrap' }}>
              {battler.item.name || battler.item}
            </span>
          )}
          {status && (
            <span style={{ fontSize:'12px', fontWeight:700, color:'var(--white)', background: STATUS_COLORS[status] || '#555', padding:'2px 7px', fontFamily:'var(--font-mono)' }}>
              {status}
            </span>
          )}
          <span className="hp-lv" style={{ fontSize:'12px', color:'var(--grey-500)', fontFamily:'var(--font-mono)' }}>Lv50</span>
        </div>
      </div>

      {/* Type badges */}
      {battler.types?.length > 0 && (
        <div style={{ display:'flex', gap:'5px', marginBottom:'7px' }}>
          {battler.types.map(t => (
            <span key={t} className="hp-type" style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      '11px',
              fontWeight:    700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color:         TYPE_COLORS[t] || '#aaa',
              background:    TYPE_BG[t]     || '#2a2a2a',
              border:        `1px solid ${TYPE_COLORS[t] || '#555'}`,
              padding:       '2px 8px',
            }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Speed display */}
      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-500)', letterSpacing:'0.05em' }}>SPD</span>
        <span className="hp-spd-val" style={{ fontFamily:'var(--font-mono)', fontSize:'13px', color:'#80b8e0', fontWeight:600 }}>{spd}</span>
        {stages.spd !== 0 && (
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color: stages.spd > 0 ? '#7ab87a' : '#b87a7a', border:`1px solid ${stages.spd > 0 ? '#7ab87a' : '#b87a7a'}`, padding:'0 4px' }}>
            {stages.spd > 0 ? '+' : ''}{stages.spd}
          </span>
        )}
      </div>

      {/* Stat stage badges */}
      {activeStages.filter(s => s.key !== 'spd').length > 0 && (
        <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'6px' }}>
          {activeStages.filter(s => s.key !== 'spd').map(s => {
            const col = stages[s.key] > 0 ? '#7ab87a' : '#b87a7a';
            return (
              <span key={s.key} style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:col, border:`1px solid ${col}`, padding:'1px 5px' }}>
                {stages[s.key] > 0 ? '+' : ''}{stages[s.key]} {s.label}
              </span>
            );
          })}
        </div>
      )}

      {/* HP bar */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
        <span style={{ fontSize:'12px', color:'var(--grey-500)', fontFamily:'var(--font-mono)', width:'20px', flexShrink:0 }}>HP</span>
        <div className="hp-bar" style={{ flex:1, height:'10px', background:'var(--grey-700)', position:'relative', overflow:'hidden' }}>
          <div ref={barRef} style={{ position:'absolute', left:0, top:0, bottom:0, width:`${Math.round(pct*100)}%`, background:color }} />
        </div>
      </div>

      {/* HP numbers */}
      <div className="hp-nums" style={{ textAlign:'right', fontSize:'13px', fontFamily:'var(--font-mono)', color:'var(--grey-400)' }}>
        {battler.hp} / {battler.maxHp}
      </div>

      {/* Volatile status badges */}
      <VolatileBadges volatile={battler.volatile} />
    </div>
  );
}

// Accepts counter-based signals; each increment plays the animation once
function BattleSprite({ battler, isBack, lungeSignal, hitSignal, faintSignal, swOutSignal, swInSignal }) {
  const ref = useRef(null);

  // LUNGE slide toward opponent and return
  useEffect(() => {
    if (!lungeSignal || !ref.current) return;
    const dir = isBack ? 1 : -1;   // player lunges right, ai lunges left
    ref.current.style.transition = 'none';
    ref.current.style.transform  = 'translateX(0)';
    // Tiny rAF so transition resets first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!ref.current) return;
        ref.current.style.transition = 'transform 0.15s ease-out';
        ref.current.style.transform  = `translateX(${dir * 32}px)`;
        setTimeout(() => {
          if (!ref.current) return;
          ref.current.style.transition = 'transform 0.18s ease-in';
          ref.current.style.transform  = 'translateX(0)';
        }, 160);
      });
    });
  }, [lungeSignal]);

  // HIT rapid white flash × 3 then back
  useEffect(() => {
    if (!hitSignal || !ref.current) return;
    const el = ref.current;
    let t = 0;
    const flashes = [
      () => { el.style.filter = 'brightness(3) saturate(0)'; },
      () => { el.style.filter = 'drop-shadow(0 0 0 transparent)'; },
      () => { el.style.filter = 'brightness(2.5) saturate(0)'; },
      () => { el.style.filter = 'drop-shadow(0 0 0 transparent)'; },
      () => { el.style.filter = 'brightness(2) saturate(0)'; },
      () => { el.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.9))'; },
    ];
    const run = (i) => {
      if (i >= flashes.length || !ref.current) return;
      flashes[i]();
      t = setTimeout(() => run(i + 1), 75);
    };
    run(0);
    return () => clearTimeout(t);
  }, [hitSignal?.ts]);

  // FAINT shrink + fade
  useEffect(() => {
    if (!faintSignal || faintSignal < 1 || !ref.current) return;
    ref.current.style.transition = 'transform 0.55s ease-in, opacity 0.55s ease-in';
    ref.current.style.transform  = 'scaleY(0.05) translateY(60px)';
    ref.current.style.opacity    = '0';
  }, [faintSignal]);

  // SWITCH_OUT slide down
  useEffect(() => {
    if (!swOutSignal || !ref.current) return;
    ref.current.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
    ref.current.style.transform  = 'translateY(120px)';
    ref.current.style.opacity    = '0';
  }, [swOutSignal]);

  // SWITCH_IN reset position then slide up from below
  useEffect(() => {
    if (!swInSignal || !ref.current) return;
    ref.current.style.transition = 'none';
    ref.current.style.transform  = 'translateY(120px)';
    ref.current.style.opacity    = '0';
    ref.current.style.filter     = 'drop-shadow(0 4px 8px rgba(0,0,0,0.9))';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!ref.current) return;
      ref.current.style.transition = 'transform 0.42s cubic-bezier(0.2,1,0.4,1), opacity 0.3s ease-out';
      ref.current.style.transform  = 'translateY(0)';
      ref.current.style.opacity    = '1';
    }));
  }, [swInSignal]);

  const src = isBack ? battler?.spriteBack : battler?.sprite;

  return (
    <div ref={ref} style={{ willChange:'transform, opacity, filter', display:'inline-block', flexShrink:0 }}>
      {src
        ? <img src={src} alt={battler?.name || ''} className="battle-sprite-img" />
        : <div className="battle-sprite-placeholder" />
      }
    </div>
  );
}

// Lays out both sides of the arena with sprites and info boxes.
export default function BattleViewport({
  player, ai,
  playerLunge, aiLunge,
  playerHit, aiHit,
  playerFaint, aiFaint,
  playerSwOut, playerSwIn,
  aiSwIn,
}) {
  return (
    <>
      {/* Desktop layout: absolute positioned sprites on a shared field */}
      <div className="battle-viewport-desktop" style={{ display:'flex', flexShrink:0, height:'clamp(220px, 38vw, 420px)', background:'var(--grey-900)', border:'1px solid var(--border)', overflow:'hidden' }}>
        <div className="battle-side-panel battle-side-left" />
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(var(--grey-800) 1px, transparent 1px)', backgroundSize:'32px 32px', opacity:0.35 }} />
          {/* Player bottom-left */}
          <div style={{ position:'absolute', bottom:'12px', left:'12px', display:'flex', alignItems:'flex-end', gap:'10px', maxWidth:'calc(50% - 12px)' }}>
            <BattleSprite battler={player} isBack={true} lungeSignal={playerLunge} hitSignal={playerHit} faintSignal={playerFaint} swOutSignal={playerSwOut} swInSignal={playerSwIn} />
            <AnimHPBar battler={player} hitSignal={playerHit} />
          </div>
          {/* AI top-right */}
          <div style={{ position:'absolute', top:'12px', right:'12px', display:'flex', alignItems:'flex-start', gap:'10px', maxWidth:'calc(50% - 12px)' }}>
            <AnimHPBar battler={ai} hitSignal={aiHit} />
            <BattleSprite battler={ai} isBack={false} lungeSignal={aiLunge} hitSignal={aiHit} faintSignal={aiFaint} swInSignal={aiSwIn} />
          </div>
        </div>
        <div className="battle-side-panel battle-side-right" />
      </div>

      {/* Mobile layout: AI row on top, player row on bottom, no overlap */}
      <div className="battle-viewport-mobile">
        {/* AI row: HP card on left, sprite on right */}
        <div className="battle-viewport-row battle-viewport-row-ai">
          <AnimHPBar battler={ai} hitSignal={aiHit} />
          <BattleSprite battler={ai} isBack={false} lungeSignal={aiLunge} hitSignal={aiHit} faintSignal={aiFaint} swInSignal={aiSwIn} />
        </div>
        {/* Player row: sprite on left, HP card on right */}
        <div className="battle-viewport-row battle-viewport-row-pl">
          <BattleSprite battler={player} isBack={true} lungeSignal={playerLunge} hitSignal={playerHit} faintSignal={playerFaint} swOutSignal={playerSwOut} swInSignal={playerSwIn} />
          <AnimHPBar battler={player} hitSignal={playerHit} />
        </div>
      </div>
    </>
  );
}
