import React from 'react';

export default function ScorePanel({ mode, stats, round }) {
  const accuracy = stats.gamesPlayed ? Math.round((stats.correct / stats.gamesPlayed) * 100) : 0;

  return (
    <section style={{ background:'rgba(0,0,0,0.80)', border:'1px solid var(--border)', padding:'24px' }}>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.22em', color:'var(--grey-500)', marginBottom:'14px' }}>Mode Stats</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:'12px' }}>
        <div style={{ padding:'12px', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', flexDirection:'column', gap:'6px' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)' }}>Score</span>
          <strong style={{ fontFamily:'var(--font-display)', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>{stats.score}</strong>
        </div>
        <div style={{ padding:'12px', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', flexDirection:'column', gap:'6px' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)' }}>Streak</span>
          <strong style={{ fontFamily:'var(--font-display)', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>{stats.streak}</strong>
        </div>
        <div style={{ padding:'12px', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', flexDirection:'column', gap:'6px' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)' }}>Best</span>
          <strong style={{ fontFamily:'var(--font-display)', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>{stats.bestStreak}</strong>
        </div>
        <div style={{ padding:'12px', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', flexDirection:'column', gap:'6px' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)' }}>Accuracy</span>
          <strong style={{ fontFamily:'var(--font-display)', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>{accuracy}%</strong>
        </div>
      </div>
      {round ? (
        <div style={{ marginTop:'14px', padding:'12px', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', flexDirection:'column', gap:'6px' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)' }}>Current Pool</span>
          <strong style={{ fontFamily:'var(--font-display)', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>{mode.title}</strong>
        </div>
      ) : null}
    </section>
  );
}
