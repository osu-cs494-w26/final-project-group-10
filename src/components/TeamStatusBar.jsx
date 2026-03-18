/*
 * TeamStatusBar.jsx Row of six Pokéball icons above each team's HP bar,
 * coloured by health state and highlighted for the active Pokémon.
 */

import React from 'react';

// Draws a pokeball SVG icon colored by the pokemon's HP state
// Single Pokéball SVG icon coloured by the Pokémon's HP state.
function Pokeball({ poke, isActive }) {
  const fainted = poke?.fainted;
  const pct     = poke ? poke.hp / poke.maxHp : 0;
  const color   = fainted
    ? '#444'
    : pct > 0.5 ? '#ffffff'
    : pct > 0.2 ? '#b8a030'
    : '#c03030';

  const size = isActive ? 18 : 14;

  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ flexShrink:0, filter: isActive ? 'drop-shadow(0 0 3px rgba(255,255,255,0.4))' : 'none', transition:'all 0.3s' }}>
      {/* Top half always red like a real pokeball */}
      <path d="M2,10 A8,8 0 0,1 18,10 Z" fill={fainted ? '#442222' : '#c03020'} />
      {/* Bottom half */}
      <path d="M2,10 A8,8 0 0,0 18,10 Z" fill={fainted ? '#333' : '#1a1a1a'} />
      {/* Outer ring */}
      <circle cx="10" cy="10" r="8" fill="none" stroke={color} strokeWidth="1.5" />
      {/* Center dividing line */}
      <line x1="2" y1="10" x2="18" y2="10" stroke={color} strokeWidth="1.2" />
      {/* Center button */}
      <circle cx="10" cy="10" r="2.5" fill={isActive ? 'var(--white)' : '#888'} stroke={color} strokeWidth="1" />
    </svg>
  );
}

// Row of pokeball icons shown above each team's HP bar
// Renders both teams' six-Pokéball status rows.
export default function TeamStatusBar({ playerTeam, aiTeam, playerActive, aiActive }) {
  return (
    <div style={{
      background: 'var(--grey-800)', borderBottom:'1px solid var(--border)',
      padding:'6px 12px', display:'flex', justifyContent:'space-between', alignItems:'center',
      gap:'8px', overflow:'hidden',
    }}>
      {/* Player pokeballs */}
      <div style={{ display:'flex', gap:'4px', alignItems:'center', flexShrink:0 }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'11px', color:'var(--grey-400)', letterSpacing:'0.1em', marginRight:'4px', textTransform:'uppercase', whiteSpace:'nowrap' }}>You</span>
        {playerTeam.map((p, i) => <Pokeball key={i} poke={p} isActive={i === playerActive} />)}
      </div>

      {/* Center label: hidden on mobile via CSS class */}
      <div className="team-status-center">Pokemon Battle</div>

      {/* Opponent pokeballs */}
      <div style={{ display:'flex', gap:'4px', alignItems:'center', flexShrink:0 }}>
        {aiTeam.map((p, i) => <Pokeball key={i} poke={p} isActive={i === aiActive} />)}
        <span style={{ fontFamily:'var(--font-display)', fontSize:'11px', color:'var(--grey-400)', letterSpacing:'0.1em', marginLeft:'4px', textTransform:'uppercase', whiteSpace:'nowrap' }}>Foe</span>
      </div>
    </div>
  );
}
