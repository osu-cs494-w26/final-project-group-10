/*
 * LoadingScreen.jsx Shared full page loading screen used by SaveTeamPage,
 * BattlePage, and AuthPage while data or sprites are loading.
 */

import React from 'react';

export default function LoadingScreen({ title = 'Loading', loaded = 0, total = 0 }) {
  const hasCounts = total > 0;
  const pct       = hasCounts ? Math.round((loaded / total) * 100) : 0;

  return (
    <div style={{
      height: 'calc(100vh - var(--nav-h))', background: 'var(--black)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: '32px',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: '28px',
        letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--white)',
      }}>
        {title}
      </div>

      <div style={{ width: 'clamp(260px, 50vw, 360px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ background: 'var(--grey-800)', height: '6px', width: '100%' }}>
          <div style={{
            background: '#4ade80', height: '100%',
            width: hasCounts ? `${pct}%` : '100%',
            transition: 'width 0.1s',
            animation: hasCounts ? 'none' : 'loadingPulse 1.4s ease-in-out infinite',
          }} />
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--grey-400)',
        }}>
          {hasCounts ? (
            <>
              <span>{loaded} / {total}</span>
              <span>{pct}%</span>
            </>
          ) : (
            <span style={{ margin: '0 auto' }}>Please wait…</span>
          )}
        </div>
      </div>
    </div>
  );
}
