/*
 * NavBar.jsx Sticky top navigation bar with logo, page links,
 * a Battle dropdown, user email, and logout button.
 */

import React, { useState } from 'react';

// Links shown in the Battle hover dropdown.
const BATTLE_SUBSECTIONS = [
  { label: 'Quick Battle',    key: 'battlemode',    desc: 'Random vs Random',     accent: '#e06030' },
  { label: 'Build Team',      key: 'saveteam',      desc: 'Custom Team Builder',  accent: '#4090d0' },
  { label: 'Battle Trainer',  key: 'battletrainer', desc: 'Trainer Challenge',    accent: '#c070e0' },
];

const NAV_LINKS = [
  { label: 'Pokédex',             key: 'pokedex',     activeKeys: ['pokedex'] },
  { label: 'Battle',              key: 'battlemode',  activeKeys: ['battlemode','select','battle','saveteam','battletrainer','trainerbattle'], hasDropdown: true },
  { label: "Who's That Pokémon?", key: 'quiz',        activeKeys: ['quiz'] },
  { label: 'Personality',         key: 'personality', activeKeys: ['personality'] },
];

const ACCENT_FOR_KEY = {
  pokedex:     '#e06030',
  battlemode:  '#4090d0',
  quiz:        '#60c060',
  personality: '#c8b820',
};

// Dropdown menu listing the three battle sub-modes.
function BattleDropdown({ setPage, onQuickBattle, onClose }) {
  return (
    <div
      onMouseLeave={onClose}
      style={{
        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
        background: 'var(--grey-900)', border: '1px solid var(--border)',
        borderTop: '2px solid #4090d0', minWidth: '220px', zIndex: 200,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)', animation: 'fadeIn 0.15s ease',
      }}>
      {BATTLE_SUBSECTIONS.map(sub => (
        <div
          key={sub.key}
          onClick={() => {
            if (sub.key === 'battlemode') { onQuickBattle(); }
            else { setPage(sub.key); }
            onClose();
          }}
          style={{ padding: '12px 18px', cursor: 'pointer', borderLeft: `3px solid transparent`, transition: 'all 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--grey-800)'; e.currentTarget.style.borderLeftColor = sub.accent; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--white)' }}>{sub.label}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: sub.accent, marginTop: '2px', letterSpacing: '0.06em' }}>{sub.desc}</div>
        </div>
      ))}
    </div>
  );
}

// Renders the full navigation bar.
export default function NavBar({ page, setPage, user, onSignOut, onQuickBattle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const activeLink = NAV_LINKS.find(l => l.activeKeys.includes(page));
  const activeKey  = activeLink?.key ?? null;

  return (
    <nav style={{
      background: 'var(--grey-900)', borderBottom: '1px solid var(--border)',
      height: 'var(--nav-h)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 2rem',
      position: 'sticky', top: 0, zIndex: 100,
    }}>

      {/* Logo */}
      <div onClick={() => setPage('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative', gap: '10px' }}>
        <img src="/Pokeball.png" alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '42px', height: '42px', opacity: 0.18, pointerEvents: 'none' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white)', position: 'relative', zIndex: 1 }}>
          PokePortal
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '2px', alignItems: 'stretch', height: '100%' }}>
        {NAV_LINKS.map(({ label, key, hasDropdown }) => {
          const isActive = activeKey === key;
          const accent   = ACCENT_FOR_KEY[key];
          const isOpen   = hasDropdown && dropdownOpen;

          return (
            <div key={key} style={{ position: 'relative', height: '100%', display: 'flex' }}
              onMouseEnter={() => hasDropdown && setDropdownOpen(true)}
              onMouseLeave={() => hasDropdown && setDropdownOpen(false)}>
              <button
                onClick={() => setPage(hasDropdown ? 'battlemode' : key)}
                style={{
                  background:    isActive || isOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border:        'none',
                  borderBottom:  isActive ? `2px solid ${accent}` : '2px solid transparent',
                  color:         isActive ? 'var(--white)' : 'var(--grey-400)',
                  padding:       '0 18px',
                  cursor:        'pointer',
                  fontFamily:    'var(--font-display)',
                  fontSize:      '13px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  transition:    'all 0.15s',
                  height:        '100%',
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '5px',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'var(--white)'; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'var(--grey-400)'; }}}
              >
                {label}
                {hasDropdown && <span style={{ fontSize: '9px', opacity: 0.6, marginTop: '1px' }}>▾</span>}
              </button>
              {isOpen && <BattleDropdown setPage={setPage} onQuickBattle={onQuickBattle} onClose={() => setDropdownOpen(false)} />}
            </div>
          );
        })}

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: 'auto 10px' }} />

        {/* User email */}
        {user && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--grey-500)', letterSpacing: '0.05em', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
            {user.email}
          </span>
        )}

        {/* Logout */}
        <button onClick={onSignOut} style={{
          background: 'transparent', border: '1px solid var(--border)', color: 'var(--grey-400)',
          padding: '5px 14px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '12px',
          letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.15s',
          marginLeft: '8px', alignSelf: 'center',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--grey-400)'; e.currentTarget.style.color = 'var(--white)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--grey-400)'; }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
