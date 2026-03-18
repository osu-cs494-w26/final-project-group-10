/*
 * BattleMoves.jsx Four move buttons shown during the player's turn.
 * Displays type, PP, category badge, and type effectiveness against the opponent.
 */
import React from 'react';

import { getTypeEffectiveness } from '../utils/battleEngine.js';
import MoveTooltip from './MoveTooltip.jsx';
import { TYPE_BG } from '../utils/constants.js';

const TYPE_ACCENT = {
  fire:'#e06030',water:'#4090d0',grass:'#50a030',electric:'#c0a820',
  psychic:'#d03060',ice:'#30a0b0',dragon:'#6030c0',dark:'#706040',
  fairy:'#c05070',normal:'#888',fighting:'#b03020',flying:'#6080a0',
  poison:'#8030a0',ground:'#a07820',rock:'#908020',bug:'#60902a',
  ghost:'#503088',steel:'#507088',
};

/** Returns the effectiveness multiplier of moveType vs defTypes */
/** Returns { label, color } for every multiplier value including 1× */
// Returns label and colour for a type-effectiveness multiplier.
function effBadge(mult) {
  if (mult === 0)    return { label: '0×',     color: '#666666' };
  if (mult >= 4)     return { label: '4×',     color: '#ff4040' };
  if (mult >= 2)     return { label: '2×',     color: '#e06060' };
  if (mult <= 0.25)  return { label: '0.25×',  color: '#6080a0' };
  if (mult <= 0.5)   return { label: '0.5×',   color: '#7090b0' };
  return               { label: '1×',     color: '#888888' }; // neutral always shown
}

// Renders the four move buttons with effectiveness and category badges.
export default function BattleMoves({ pokemon, moveData, onMove, disabled, lockedMove, defendingPoke }) {
  if (!pokemon) return null;

  const moves = pokemon.moves || [];
  // Always read types from the defending Pokémon falls back to [] if not yet loaded
  const defTypes = defendingPoke?.types || [];

    if (lockedMove) {
    const md     = moveData?.[lockedMove];
    const type   = md?.type || 'normal';
    const accent = TYPE_ACCENT[type] || '#888';
    const bg     = TYPE_BG[type] || '#2a2a2a';
    return (
      <div style={{ background:'var(--grey-800)', border:'1px solid var(--border)', padding:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
        <div style={{ borderBottom:'1px solid var(--border)', paddingBottom:'6px' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.12em', color:'#c0a820', textTransform:'uppercase' }}>
            ⚡ Charging {pokemon.name}
          </span>
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-400)', marginBottom:'4px' }}>
          {pokemon.name} is locked into <span style={{ color: accent, textTransform: 'capitalize' }}>{lockedMove}</span>. It will execute next turn automatically.
        </div>
        <button
          disabled={disabled}
          onClick={() => onMove(lockedMove)}
          style={{
            background: bg,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            borderLeft: `4px solid ${accent}`,
            padding: '14px 16px', cursor: disabled ? 'not-allowed' : 'pointer',
            textAlign: 'left', opacity: disabled ? 0.5 : 1,
            transition: 'filter 0.1s',
          }}
          onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.1em', color:'var(--white)', textTransform:'uppercase', marginBottom:'4px' }}>
            ▶ Continue: {lockedMove}
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'rgba(255,255,255,0.5)' }}>
            {type.toUpperCase()} {md?.power ? `· ${md.power} PWR` : ''} {md?.category ? `· ${md.category.toUpperCase().slice(0,4)}` : ''}
          </div>
        </button>
      </div>
    );
  }

    return (
    <div style={{ background:'var(--grey-800)', border:'1px solid var(--border)', padding:'12px', display:'flex', flexDirection:'column', gap:'6px' }}>
      <div style={{ borderBottom:'1px solid var(--border)', paddingBottom:'6px', marginBottom:'2px' }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.12em', color:'var(--grey-400)', textTransform:'uppercase' }}>
          Moves {pokemon.name}
        </span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px' }}>
        {[0,1,2,3].map(i => {
          const moveName = moves[i];
          if (!moveName) return (
            <div key={i} style={{ background:'var(--grey-900)', border:'1px solid var(--border)', padding:'12px 14px', color:'var(--grey-700)', fontSize:'12px', fontFamily:'var(--font-mono)' }}>---</div>
          );

          const md     = moveData?.[moveName];
          const pp     = pokemon.pp?.[moveName] ?? md?.pp ?? 10;
          const maxPP  = md?.pp || 10;
          const noPP   = pp <= 0;
          const type   = md?.type || 'normal';
          const bg     = TYPE_BG[type]     || '#2a2a2a';
          const accent = TYPE_ACCENT[type] || '#666';

          // Type effectiveness badge shown for physical/special moves (catches variable-power moves like Return)
          const isDamaging = md?.category === 'physical' || md?.category === 'special';
          const mult = isDamaging ? getTypeEffectiveness(type, defTypes) : null;
          const badge = mult !== null ? effBadge(mult) : null;

          return (
            <MoveTooltip key={i} moveName={moveName} preloaded={md}>
              <button
                disabled={disabled || noPP}
                onClick={() => onMove(moveName)}
                style={{
                  background: noPP ? 'var(--grey-900)' : bg,
                  borderTop: '1px solid rgba(255,255,255,0.07)',
                  borderRight: '1px solid rgba(255,255,255,0.07)',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  borderLeft: `4px solid ${noPP ? 'var(--grey-700)' : accent}`,
                  padding: '9px 11px', cursor: disabled||noPP ? 'not-allowed' : 'pointer',
                  textAlign: 'left', opacity: disabled ? 0.5 : noPP ? 0.3 : 1,
                  transition: 'filter 0.1s', display: 'flex', flexDirection: 'column', gap: '4px',
                  width: '100%',
                }}
                onMouseEnter={e => { if (!disabled && !noPP) e.currentTarget.style.filter = 'brightness(1.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'4px' }}>
                  <span style={{ fontFamily:'var(--font-ui)', fontWeight:600, fontSize:'13px', textTransform:'capitalize', color:'var(--white)', lineHeight:1.2 }}>
                    {moveName}
                  </span>
                  {badge && (
                    <span style={{
                      fontFamily:'var(--font-mono)', fontSize:'9px', fontWeight:700,
                      color: badge.color,
                      border: `1px solid ${badge.color}88`,
                      background: `${badge.color}22`,
                      padding:'1px 5px', lineHeight:1.5, flexShrink:0,
                    }}>
                      {badge.label}
                    </span>
                  )}
                </div>
                <div style={{ display:'flex', gap:'5px', fontSize:'10px', fontFamily:'var(--font-mono)', color:'rgba(255,255,255,0.5)', alignItems:'center' }}>
                  <span style={{ background:'rgba(0,0,0,0.35)', padding:'1px 5px', textTransform:'uppercase', fontSize:'9px', color:accent }}>{type}</span>
                  {md?.power > 0 && <span>{md.power} PWR</span>}
                  {md?.category && (() => {
                    const catColor = { physical:'#e07040', special:'#4090d0', status:'#aaa' }[md.category] || '#888';
                    const catBg    = { physical:'rgba(224,112,64,0.18)', special:'rgba(64,144,208,0.18)', status:'rgba(170,170,170,0.10)' }[md.category] || 'transparent';
                    const catLabel = { physical:'Physical', special:'Special', status:'Status' }[md.category] || md.category;
                    return (
                      <span style={{ color: catColor, background: catBg, border:`1px solid ${catColor}55`, padding:'1px 5px', fontSize:'9px', fontWeight:700, letterSpacing:'0.03em', textTransform:'uppercase' }}>
                        {catLabel}
                      </span>
                    );
                  })()}
                  <span style={{ marginLeft:'auto', color:pp<=2?'#c05050':'rgba(255,255,255,0.45)' }}>{pp}/{maxPP} PP</span>
                </div>
              </button>
            </MoveTooltip>
          );
        })}
      </div>
    </div>
  );
}
