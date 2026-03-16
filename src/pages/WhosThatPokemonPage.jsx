import React from 'react';

import GameModeCard from '../components/wtp/GameModeCard.jsx';
import { WTP_MODES } from '../data/wtpModes.js';

export default function WhosThatPokemonPage({ onSelectMode, setPage }) {
  const featuredMode = WTP_MODES.find((mode) => mode.featured);
  const standardModes = WTP_MODES.filter((mode) => !mode.featured);

  return (
    <div style={{ minHeight:'calc(100vh - var(--nav-h))', display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 24px', gap:'32px', position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:'1180px', display:'flex', flexDirection:'column', gap:'24px' }}>
        <button
          type="button"
          onClick={() => setPage('home')}
          style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', padding:'10px 22px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'13px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s', alignSelf:'flex-start' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background='none'}
        >
          ← Back
        </button>

        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--grey-500)', marginBottom:'8px' }}>Challenge Yourself</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'40px', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--white)' }}>Who's That Pokémon?</div>
        </div>

        <div style={{ background:'rgba(0,0,0,0.80)', border:'1px solid var(--border)', padding:'24px' }}>
          <div style={{ marginBottom:'16px' }}>
            <GameModeCard mode={featuredMode} onSelect={onSelectMode} index={0} featured />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'16px' }}>
            {standardModes.map((mode, index) => (
              <GameModeCard key={mode.key} mode={mode} onSelect={onSelectMode} index={index + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
