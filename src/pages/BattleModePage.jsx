/*
 * BattleModePage.jsx Battle mode selection screen.
 * Shows three cards: Quick Battle, Build Team, and Battle Trainer.
 */

import React, { useState } from 'react';

const MODES = [
  {
    id: 'random',
    num: '01',
    label: 'Quick Battle',
    subtitle: 'Random vs Random',
    description: 'Battle a AI in a 6v6 battle with a random Pokémon team and random moves.',
    accent: '#e06030',
    bg: '#7a2a10',
    active: true,
  },
  {
    id: 'saveteam',
    num: '02',
    label: 'Build Team',
    subtitle: 'Custom Team Builder',
    description: 'Build and save your own custom Pokémon team using any Pokémon from Gen 1-5.',
    accent: '#4090d0',
    bg: '#1a3a6a',
    active: true,
  },
  {
    id: 'battletrainer',
    num: '03',
    label: 'Battle Trainer',
    subtitle: 'Trainer Challenge',
    description: 'Battle some of the strongest Pokémon trainers from past games.',
    accent: '#c070e0',
    bg: '#3a1050',
    active: true,
  },
];

// Single battle-mode card: compact on mobile, fuller on desktop.
function ModeCard({ mode, onClick }) {
  const [hovered, setHovered] = useState(false);

  if (!mode.active) {
    return (
      <div style={{
        background: 'var(--grey-900)', border: '1px solid var(--border)',
        borderLeft: '4px solid #2a2a2a', display: 'flex', alignItems: 'center',
        justifyContent: 'center', opacity: 0.35, position: 'relative',
        padding: 'clamp(16px, 4vw, 48px) clamp(12px, 3vw, 40px)',
      }}>
        <span style={{ position:'absolute', top:'10px', right:'12px', fontFamily:'var(--font-mono)', fontSize:'10px', color:'#444', letterSpacing:'0.05em' }}>{mode.num}</span>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'12px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#555' }}>Coming Soon</span>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(mode.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? mode.bg : 'var(--grey-900)',
        borderTop:    `1px solid ${hovered ? mode.accent : 'var(--border)'}`,
        borderRight:  `1px solid ${hovered ? mode.accent : 'var(--border)'}`,
        borderBottom: `1px solid ${hovered ? mode.accent : 'var(--border)'}`,
        borderLeft:   `4px solid ${mode.accent}`,
        padding: 'clamp(16px, 4vw, 48px) clamp(12px, 3vw, 40px)',
        cursor: 'pointer', display: 'flex', flexDirection: 'column',
        gap: 'clamp(8px, 2vw, 18px)',
        transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'none', position: 'relative',
      }}
    >
      <div style={{ position:'absolute', top:'10px', right:'12px', fontFamily:'var(--font-mono)', fontSize:'10px', color:mode.accent, opacity:0.6, letterSpacing:'0.05em' }}>
        {mode.num}
      </div>
      <div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(14px, 3vw, 34px)', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', lineHeight:1.2, marginBottom:'4px', paddingRight:'20px' }}>
          {mode.label}
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'clamp(8px, 1.5vw, 10px)', textTransform:'uppercase', letterSpacing:'0.1em', color:mode.accent }}>
          {mode.subtitle}
        </div>
      </div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'clamp(10px, 1.8vw, 15px)', color:'var(--grey-300)', lineHeight:1.7, flex:1 }}>
        {mode.description}
      </div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:mode.accent, letterSpacing:'0.08em', textTransform:'uppercase', opacity: hovered ? 1 : 0, transition:'opacity 0.15s' }}>
        Select →
      </div>
    </div>
  );
}

// Renders the three mode cards and handles navigation.
export default function BattleModePage({ setPage, setBattleMode }) {
  const handleSelect = (id) => {
    if (id === 'random')        { setBattleMode('random'); setPage('battle'); }
    else if (id === 'saveteam')      { setBattleMode('custom'); setPage('saveteam'); }
    else if (id === 'battletrainer')  { setPage('battletrainer'); }
  };

  return (
    <div style={{ minHeight:'calc(100vh - var(--nav-h))', display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 1rem', gap:'32px', position:'relative', zIndex:1 }}>
      {/* Content box: full width on mobile, capped at 1100px on desktop */}
      <div className="page-content-box" style={{ display:'flex', flexDirection:'column', gap:'32px' }}>

        <button onClick={() => setPage('home')} style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s', alignSelf:'flex-start' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background='none'}>
          ← Back
        </button>

        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--grey-500)', marginBottom:'8px' }}>Choose Your Mode</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'40px', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--white)' }}>Battle</div>
        </div>

        {/* Mode cards: always 3 columns, content shrinks via clamp sizing */}
        <div style={{ background:'rgba(0,0,0,0.80)', border:'1px solid var(--border)', padding:'16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px' }}>
            {MODES.map((mode, idx) => (
              <ModeCard key={idx} mode={mode} onClick={handleSelect} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
