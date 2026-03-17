/*
* ScorePanel.jsx
* Component for displaying the player's current stats and progress in the "Who's That Pokémon?" game mode.
*/

import React from 'react';

function StatCard({ label, value, accent = 'var(--white)' }) {
  return (
    <div style={{ padding:'12px', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', flexDirection:'column', gap:'6px' }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)' }}>{label}</span>
      <strong style={{ fontFamily:'var(--font-display)', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:accent }}>{value}</strong>
    </div>
  );
}

export default function ScorePanel({ mode, stats, gameType, session, setupLabel }) {
  const isFreeplay = gameType.roundLimit === null;
  const progressLabel = gameType.roundLimit
    ? `${session.roundsCompleted} / ${gameType.roundLimit}`
    : 'Open Ended';

  return (
    <section style={{ background:'rgba(0,0,0,0.80)', border:'1px solid var(--border)', padding:'24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', gap:'14px', flexWrap:'wrap', marginBottom:'14px' }}>
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.22em', color:'var(--grey-500)', marginBottom:'8px' }}>Mode Stats</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'22px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>{mode.title}</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:mode.accent }}>{gameType.label}</span>
          {setupLabel ? (
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--grey-400)' }}>{setupLabel}</span>
          ) : null}
        </div>
      </div>

      {isFreeplay ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:'12px' }}>
          <StatCard label="Current Streak" value={stats.currentStreak ?? 0} accent={mode.accent} />
          <StatCard label="Best Streak" value={stats.bestStreak} />
          <StatCard label="Accuracy" value={`${stats.accuracy}%`} />
          <StatCard label="All-Time Correct" value={stats.allTimeCorrect} />
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:'12px' }}>
          <StatCard label="Run Progress" value={progressLabel} accent={mode.accent} />
          <StatCard label="Run Score" value={session.totalScore} />
          <StatCard label="Correct Guesses" value={`${session.correctGuesses} / ${gameType.roundLimit}`} />
          <StatCard label="Avg Guess Time" value={`${stats.averageTimeSeconds}s`} />
          <StatCard label="Hints Used" value={session.totalHintsUsed} />
          <StatCard label="Best Run Score" value={stats.bestRunScore} />
        </div>
      )}
    </section>
  );
}
