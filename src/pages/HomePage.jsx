/*
 * HomePage.jsx Landing page with the PokePortal title, four
 * mode cards, a welcome description, and a Pikachu illustration.
 */

import React, { useState } from 'react';

const PIKACHU_ART = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';

const CARDS = [
  { key:'pokedex',     num:'01', title:'Pokédex',            subtitle:'Pokémon Database',  desc:'Browse all Pokémon',                             accent:'#e06030', bg:'#7a2a10' },
  { key:'battlemode',  num:'02', title:'Battle',             subtitle:'Pokémon Battles',   desc:'Compete in Pokémon Battles',                     accent:'#4090d0', bg:'#1a3a6a' },
  { key:'wtp',        num:'03', title:"Who's That Pokémon?",subtitle:'Daily Challenge',    desc:'Guess the Pokémon',                              accent:'#60c060', bg:'#1a3a1a' },
  { key:'quiz', num:'04', title:'Quizzes',   subtitle:'Test Your Knowledge & Find Your Match',   desc:'How much do you know about Pokemon? Find your team now!',  accent:'#c8b820', bg:'#3a2c08' },
];

// Single mode card with hover accent colour and "Select →" reveal.
function HomeCard({ card, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onClick(card.key)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   hovered ? card.bg : 'var(--grey-900)',
        borderTop:    `1px solid ${hovered ? card.accent : 'var(--border)'}`,
        borderRight:  `1px solid ${hovered ? card.accent : 'var(--border)'}`,
        borderBottom: `1px solid ${hovered ? card.accent : 'var(--border)'}`,
        borderLeft:   `4px solid ${card.accent}`,
        padding:'28px 28px', cursor:'pointer', display:'flex', flexDirection:'column',
        gap:'10px', transition:'background 0.2s, border-color 0.2s, transform 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'none', position:'relative', minHeight:'180px',
      }}>
      <div style={{ position:'absolute', top:'12px', right:'14px', fontFamily:'var(--font-mono)', fontSize:'10px', color:card.accent, opacity:0.6, letterSpacing:'0.05em' }}>{card.num}</div>
      <div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'18px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', lineHeight:1.2, marginBottom:'4px' }}>{card.title}</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.1em', color:card.accent }}>{card.subtitle}</div>
      </div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-300)', lineHeight:1.7, flex:1 }}>{card.desc}</div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:card.accent, letterSpacing:'0.08em', textTransform:'uppercase', opacity: hovered ? 1 : 0, transition:'opacity 0.15s' }}>Select →</div>
    </div>
  );
}

// Renders the title, card grid, and welcome section.
export default function HomePage({ setPage }) {
  return (
    <div style={{ minHeight:'calc(100vh - var(--nav-h))', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', padding:'6rem 2rem 3rem', position:'relative' }}>

      {/* Title */}
      <div style={{ marginBottom:'2.5rem', textAlign:'center', animation:'fadeIn 0.4s ease both', position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center', zIndex:2 }}>
        <img src="/Pokeball.png" alt="" style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'210px', height:'210px', opacity:0.6, pointerEvents:'none' }} />
        <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(40px,7vw,76px)', fontWeight:300, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--white)', lineHeight:1, position:'relative', zIndex:1 }}>
          PokePortal
        </div>
      </div>

      {/* Main black box cards + welcome + pikachu */}
      <div style={{
        maxWidth:'1100px', width:'100%',
        background:'#000',
        border:'1px solid var(--border)',
        position:'relative', zIndex:2,
        animation:'fadeIn 0.5s 0.1s ease both',
        display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>

        {/* Cards row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', padding:'24px 24px 20px' }}>
          {CARDS.map(card => (
            <HomeCard key={card.key} card={card} onClick={setPage} />
          ))}
        </div>

        {/* Divider */}
        <div style={{ height:'1px', background:'var(--border)', margin:'0 24px' }} />

        {/* Welcome + Pikachu row */}
        <div style={{ display:'flex', alignItems:'flex-end', gap:'0', minHeight:'260px' }}>

          {/* Welcome text */}
          <div style={{ flex:1, padding:'32px 36px 36px', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--grey-500)' }}>
              Welcome
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'26px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--white)', lineHeight:1.2 }}>
              Welcome to PokePortal
            </div>
            <p style={{ margin:0, fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-300)', lineHeight:1.8, maxWidth:'480px' }}>
              Welcome to Pokeportal! This website is dedicated to all things Pokémon! You can look at the complete Pokédex, battle AI trainers, do the daily "Who's that Pokémon?" challenge or take a quiz to determine what Pokémon fits your personality type. Enjoy!
            </p>

          </div>

          {/* Pikachu */}
          <div style={{ flexShrink:0, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:'0 48px', borderLeft:'1px solid var(--border)' }}>
            <img
              src={PIKACHU_ART}
              alt="Pikachu"
              style={{ width:'200px', height:'200px', objectFit:'contain', display:'block', imageRendering:'pixelated' }}
            />
          </div>

        </div>
      </div>

    </div>
  );
}
