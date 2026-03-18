/*
 * NavBar.jsx Sticky top navigation bar with logo, page links,
 * a Battle dropdown, user email, and logout button.
 * On small screens the links collapse into a hamburger drawer.
 * Uses URL path matching for active state now that React Router is in use.
 */

import React, { useState } from 'react';

// Sub-links shown in the Battle hover dropdown.
// Sub-links shown in the Battle hover dropdown.
const BATTLE_SUBSECTIONS = [
  { label: 'Quick Battle',   path: '/battle',          desc: 'Random vs Random',    accent: '#e06030' },
  { label: 'Build Team',     path: '/team/build',      desc: 'Custom Team Builder', accent: '#4090d0' },
  { label: 'Battle Trainer', path: '/battle/trainer',  desc: 'Trainer Challenge',   accent: '#c070e0' },
];

const NAV_LINKS = [
  { label: 'Pokédex',             path: '/pokedex', activePrefixes: ['/pokedex'] },
  { label: 'Battle',              path: '/battle',  activePrefixes: ['/battle', '/team/build'], hasDropdown: true },
  { label: "Who's That Pokémon?", path: '/wtp',     activePrefixes: ['/wtp'] },
  { label: 'Quizzes',             path: '/quiz',    activePrefixes: ['/quiz'] },
];

const ACCENT_FOR_PATH = {
  '/pokedex': '#e06030',
  '/battle':  '#4090d0',
  '/wtp':     '#60c060',
  '/quiz':    '#c8b820',
};

/* Check if currentPath matches any of the given prefixes */
function isActivePath(currentPath, prefixes) {
  return prefixes.some(p => currentPath === p || currentPath.startsWith(p + '/'));
}

/* Dropdown menu listing the three battle sub-modes. */
function BattleDropdown({ onNavigate, onQuickBattle, onClose }) {
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
        <div key={sub.path}
          onClick={() => {
            if (sub.path === '/battle') { onQuickBattle(); }
            else { onNavigate(sub.path); }
            onClose();
          }}
          style={{ padding: '12px 18px', cursor: 'pointer', borderLeft: '3px solid transparent', transition: 'all 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--grey-800)'; e.currentTarget.style.borderLeftColor = sub.accent; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: sub.accent }}>{sub.label}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--grey-500)', marginTop: '2px' }}>{sub.desc}</div>
        </div>
      ))}
    </div>
  );
}

/* Mobile drawer showing all nav links and battle sub-links inline. */
function MobileDrawer({ currentPath, onNavigate, onQuickBattle, onSignOut, user, onClose }) {
  return (
    <div className="nav-drawer open">
      {NAV_LINKS.map(({ label, path, activePrefixes, hasDropdown }) => {
        const isActive = isActivePath(currentPath, activePrefixes);
        const accent   = ACCENT_FOR_PATH[path];
        return (
          <div key={path}>
            <button
              onClick={() => { onNavigate(path); onClose(); }}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                borderLeft: `4px solid ${isActive ? accent : 'transparent'}`,
                color: isActive ? 'var(--white)' : 'var(--grey-300)',
                padding: '14px 16px', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontSize: '16px',
                letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'left',
              }}>
              {label}
            </button>
            {}
            {hasDropdown && (
              <div style={{ paddingLeft: '20px', borderLeft: '1px solid var(--border-mid)', marginLeft: '4px' }}>
                {BATTLE_SUBSECTIONS.map(sub => (
                  <button key={sub.path}
                    onClick={() => { sub.path === '/battle' ? onQuickBattle() : onNavigate(sub.path); onClose(); }}
                    style={{ width: '100%', background: 'transparent', border: 'none', color: sub.accent, padding: '10px 12px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'left' }}>
                    {sub.label} — {sub.desc}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
      {user && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--grey-500)', padding: '8px 16px', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.email}
        </div>
      )}
      <button onClick={() => { onSignOut(); onClose(); }}
        style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--grey-400)', padding: '10px 16px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '8px 0', transition: 'all 0.15s' }}>
        Logout
      </button>
    </div>
  );
}

/* Renders the full navigation bar.
   page prop is a URL path string from useLocation().pathname. */
export default function NavBar({ page, setPage, user, onSignOut, onQuickBattle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen,   setDrawerOpen]   = useState(false);

  
  /* Navigate to a URL path via the setPage adapter in App.jsx or directly */
  const onNavigate = (path) => {
    setPage(path);
    setDrawerOpen(false);
  };

  return (
    <>
      <nav style={{
        background: 'var(--grey-900)', borderBottom: '1px solid var(--border)',
        height: 'var(--nav-h)', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 1.25rem',
        position: 'sticky', top: 0, zIndex: 100,
      }}>

        {/* Logo */}
        <div onClick={() => onNavigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative', gap: '10px' }}>
          <img src="/Pokeball.png" alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '42px', height: '42px', opacity: 0.18, pointerEvents: 'none' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white)', position: 'relative', zIndex: 1 }}>
            PokePortal
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="nav-links-desktop" style={{ display: 'flex', gap: '2px', alignItems: 'stretch', height: '100%' }}>
          {NAV_LINKS.map(({ label, path, activePrefixes, hasDropdown }) => {
            const isActive = isActivePath(page, activePrefixes);
            const accent   = ACCENT_FOR_PATH[path];
            const isOpen   = hasDropdown && dropdownOpen;
            return (
              <div key={path} style={{ position: 'relative', height: '100%', display: 'flex' }}
                onMouseEnter={() => hasDropdown && setDropdownOpen(true)}
                onMouseLeave={() => hasDropdown && setDropdownOpen(false)}>
                <button
                  onClick={() => onNavigate(path)}
                  style={{
                    background:    isActive || isOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border:        'none',
                    borderBottom:  isActive ? `2px solid ${accent}` : '2px solid transparent',
                    color:         isActive ? 'var(--white)' : 'var(--grey-400)',
                    padding:       '0 18px', cursor: 'pointer',
                    fontFamily:    'var(--font-display)', fontSize: '13px',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    transition:    'all 0.15s', height: '100%',
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--white)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--grey-400)'; }}>
                  {label}
                  {hasDropdown && <span style={{ fontSize: '9px', opacity: 0.6, marginTop: '1px' }}>▾</span>}
                </button>
                {isOpen && <BattleDropdown onNavigate={onNavigate} onQuickBattle={onQuickBattle} onClose={() => setDropdownOpen(false)} />}
              </div>
            );
          })}
          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: 'auto 10px' }} />
          {user && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--grey-500)', letterSpacing: '0.05em', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
              {user.email}
            </span>
          )}
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

        {/* Hamburger toggle (visible only on mobile) */}
        <button className="nav-hamburger" onClick={() => setDrawerOpen(o => !o)} aria-label="Menu">
          {drawerOpen ? '✕' : '☰'}
        </button>

      </nav>

      {drawerOpen && (
        <MobileDrawer
          currentPath={page}
          onNavigate={onNavigate}
          onQuickBattle={onQuickBattle}
          onSignOut={onSignOut}
          user={user}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  );
}
