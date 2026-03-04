// Top navigation bar with PokePortal title and section links.

import React from 'react';

const NAV_LINKS = [
  { label: 'Pokedex',     key: 'pokedex',     active: true },
  { label: 'Battle',      key: 'select',      active: true  },
  { label: 'Daily Quiz',  key: 'quiz',        active: true },
  { label: 'Personality', key: 'personality', active: true },
];

export default function NavBar({ page, setPage }) {
  return (
    <nav style={{ background:'var(--grey-900)', borderBottom:'1px solid var(--border)', height:'var(--nav-h)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2rem', position:'sticky', top:0, zIndex:100 }}>
      <div onClick={() => setPage('home')} style={{ cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:400, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--white)' }}>
        PokePortal
      </div>
      <div style={{ display:'flex', gap:'4px' }}>
        {NAV_LINKS.map(({ label, key, active }) => (
          <button key={key} onClick={() => active && setPage(key)} style={{
            background:    page === key ? 'var(--grey-700)' : 'transparent',
            border:        `1px solid ${page === key ? 'var(--border-lt)' : 'transparent'}`,
            color:         page === key ? 'var(--white)' : 'var(--grey-400)',
            padding:       '6px 16px', cursor: active ? 'pointer' : 'not-allowed',
            fontFamily:    'var(--font-display)', fontSize:'13px', letterSpacing:'0.1em',
            textTransform: 'uppercase', opacity: active ? 1 : 0.4, transition:'all 0.15s',
          }}>
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
