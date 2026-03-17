/*
* GameModeCard.jsx
* Component for rendering a game mode selection card in the "Who's That Pokémon?" mode selection screen.
*/

import React, { useState } from 'react';

export default function GameModeCard({ mode, onSelect, index, featured = false }) {
  const [hovered, setHovered] = useState(false);
  const descriptionParts = mode.description.split('. ');
  const firstSentence = descriptionParts[0] ? `${descriptionParts[0]}${mode.description.includes('. ') ? '.' : ''}` : mode.description;
  const remainingDescription = descriptionParts.slice(1).join('. ');

  return (
    <div
      onClick={() => onSelect(mode.key)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? mode.bg : 'var(--grey-900)',
        borderTop: `1px solid ${hovered ? mode.accent : 'var(--border)'}`,
        borderRight: `1px solid ${hovered ? mode.accent : 'var(--border)'}`,
        borderBottom: `1px solid ${hovered ? mode.accent : 'var(--border)'}`,
        borderLeft: `4px solid ${mode.accent}`,
        padding: featured ? '38px 34px' : '34px 28px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        position: 'relative',
        minHeight: featured ? '340px' : '300px',
        boxShadow: hovered ? `0 14px 36px ${mode.glow}` : 'none',
      }}
    >
      <div style={{ position:'absolute', top:'12px', right:'14px', fontFamily:'var(--font-mono)', fontSize:'10px', color:mode.accent, opacity:0.7, letterSpacing:'0.05em' }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:featured ? '42px' : '30px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', lineHeight:1.15, marginBottom:'6px' }}>
          {mode.title}
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:mode.accent }}>
          {mode.subtitle}
        </div>
      </div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:featured ? '15px' : '13px', color:'var(--grey-300)', lineHeight:1.95, flex:1 }}>
        <div>{firstSentence}</div>
        {remainingDescription ? <div>{remainingDescription}</div> : null}
      </div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:mode.accent, letterSpacing:'0.08em', textTransform:'uppercase', opacity:hovered ? 1 : 0, transition:'opacity 0.15s' }}>
        Configure Mode →
      </div>
    </div>
  );
}
