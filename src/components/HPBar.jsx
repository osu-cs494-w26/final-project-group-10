// HP bar with status badge, level, HP numbers shown on both sides.

import React from 'react';

// Green above 50%, yellow above 20%, red below
function hpColor(pct) {
  if (pct > 0.5) return 'var(--hp-green)';
  if (pct > 0.2) return 'var(--hp-yellow)';
  return 'var(--hp-red)';
}

// Shows a stat stage change like "+2 ATK"
function StageLabel({ stage, label }) {
  if (!stage || stage === 0) return null;
  const color = stage > 0 ? '#7ab87a' : '#b87a7a';
  return (
    <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color, border:`1px solid ${color}`, padding:'0px 4px' }}>
      {stage > 0 ? '+' : ''}{stage} {label}
    </span>
  );
}

const STAGE_KEYS = [
  { key:'atk', label:'ATK' }, { key:'def', label:'DEF' },
  { key:'spatk', label:'SATK' }, { key:'spdef', label:'SDEF' }, { key:'spd', label:'SPD' },
];

const STATUS_COLORS = { BRN:'#b05030', PSN:'#7040a0', TOX:'#7040a0', PAR:'#a09020', SLP:'#506080', FRZ:'#4080a0' };
const STATUS_LABELS = { brn:'BRN', psn:'PSN', par:'PAR', slp:'SLP', frz:'FRZ', tox:'TOX' };

// HP bar with instant update, no animation, and HP numbers shown on both sides.
export default function HPBar({ battler, side }) {
  if (!battler) return null;

  const hp     = battler.hp ?? 0;
  const pct    = Math.max(0, Math.min(1, hp / battler.maxHp));
  const color  = hpColor(pct);
  const status = battler.status && battler.status !== 'none' ? STATUS_LABELS[battler.status] : null;
  const stages = battler.stages || {};
  const activeStages = STAGE_KEYS.filter(s => stages[s.key] && stages[s.key] !== 0);

  return (
    <div style={{ background:'var(--grey-800)', border:'1px solid var(--border-mid)', padding:'10px 14px', minWidth:'210px', maxWidth:'260px' }}>
      {/* Name + level row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px', gap:'6px' }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'15px', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {battler.name}
        </span>
        <div style={{ display:'flex', gap:'4px', alignItems:'center', flexShrink:0 }}>
          {battler.item && (
            <span style={{ fontSize:'9px', color:'var(--grey-400)', border:'1px solid var(--border)', padding:'1px 4px', fontFamily:'var(--font-mono)', whiteSpace:'nowrap' }}>
              {battler.item.name || battler.item}
            </span>
          )}
          {status && (
            <span style={{ fontSize:'10px', fontWeight:700, color:'var(--white)', background: STATUS_COLORS[status] || '#555', padding:'1px 5px', fontFamily:'var(--font-mono)' }}>
              {status}
            </span>
          )}
          <span style={{ fontSize:'10px', color:'var(--grey-500)', fontFamily:'var(--font-mono)' }}>Lv50</span>
        </div>
      </div>

      {/* Stat stage modifiers */}
      {activeStages.length > 0 && (
        <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', marginBottom:'5px' }}>
          {activeStages.map(s => <StageLabel key={s.key} stage={stages[s.key]} label={s.label} />)}
        </div>
      )}

      {/* HP bar */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
        <span style={{ fontSize:'10px', color:'var(--grey-500)', fontFamily:'var(--font-mono)', width:'18px', flexShrink:0 }}>HP</span>
        <div style={{ flex:1, height:'7px', background:'var(--grey-700)', position:'relative' }}>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:`${Math.round(pct * 100)}%`, background:color, transition:'width 0.2s ease' }} />
        </div>
      </div>

      {/* HP numbers shown on both sides. */}
      <div style={{ textAlign:'right', fontSize:'11px', fontFamily:'var(--font-mono)', color:'var(--grey-400)' }}>
        {hp} / {battler.maxHp}
      </div>
    </div>
  );
}
