// Homepage with the four main components

import React, { useState } from 'react';

// Four feature cards 
const CARDS = [
  { key:'pokedex',     title:'Pokedex',          desc:'Browse all Pokemon',        active:true },
  { key:'select',      title:'Battle System',    desc:'Build your team and fight', active:true  },
  { key:'quiz',        title:'Daily Quiz',       desc:'Guess the Pokemon',         active:true },
  { key:'personality', title:'Personality Quiz', desc:'Find your Pokemon type',    active:true },
];

export default function HomePage({ setPage }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ minHeight:'calc(100vh - var(--nav-h))', background:'var(--black)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'3rem 2rem' }}>
      <div style={{ marginBottom:'3rem', textAlign:'center', animation:'fadeIn 0.4s ease both' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(32px,6vw,64px)', fontWeight:300, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--white)', lineHeight:1 }}>
          PokePortal
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1px', maxWidth:'600px', width:'100%', background:'var(--border)', border:'1px solid var(--border)', animation:'fadeIn 0.5s 0.1s ease both' }}>
        {CARDS.map(card => (
          <div key={card.key}
            onMouseEnter={() => setHovered(card.key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => card.active && setPage('select')}
            style={{ background: hovered===card.key && card.active ? 'var(--grey-800)' : 'var(--grey-900)', padding:'28px 24px', cursor: card.active ? 'pointer' : 'not-allowed', opacity: card.active ? 1 : 0.35, transition:'background 0.15s' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'18px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--white)', marginBottom:'6px' }}>
              {card.title}
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-400)' }}>
              {card.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
