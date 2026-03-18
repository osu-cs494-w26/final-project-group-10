/**
 * QuizPage.jsx
 * Hub page with three quiz options.
 * Styled to match BattleModePage design. Responsive.
 */

import React, { useState } from 'react';

const QUIZ_MODES = [
  {
    id: 'personality-quiz',
    num: '01',
    label: 'Personality',
    subtitle: 'Find Your Match',
    description: 'Discover your Pokémon nature and get a personalized team of 6 Pokémon that match your personality.',
    accent: '#c8b820',
    bg: '#3a2c08',
    active: true,
  },
  {
    id: 'pokemon-quiz',
    num: '02',
    label: 'Pokémon Quiz',
    subtitle: 'Test Your Knowledge',
    description: 'Challenge yourself with 10 questions about Pokémon lore, moves, types, and history from Gen 1-5.',
    accent: '#4090d0',
    bg: '#1a3a6a',
    active: true,
  },
  {
    id: 'evolution-quiz',
    num: '03',
    label: 'Evolution',
    subtitle: 'Evolution Chains',
    description: 'How well do you know Pokémon evolution chains? Test your knowledge on levels, items, and branching evolutions.',
    accent: '#e06030',
    bg: '#7a2a10',
    active: true,
  },
];

// Single quiz card with coloured left border and hover state.
function QuizCard({ mode, onClick }) {
  const [hovered, setHovered] = useState(false);

  if (!mode.active) {
    return (
      <div style={{
        background: 'var(--grey-900)', border: '1px solid var(--border)',
        borderLeft: '4px solid #2a2a2a', display: 'flex', alignItems: 'center',
        justifyContent: 'center', minHeight: '400px', opacity: 0.35, position: 'relative',
      }}>
        <span style={{ position:'absolute', top:'12px', right:'14px', fontFamily:'var(--font-mono)', fontSize:'10px', color:'#444', letterSpacing:'0.05em' }}>{mode.num}</span>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'12px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#555' }}>Coming Soon</span>
      </div>
    );
  }

  return (
    <div
      className="quiz-card"
      onClick={() => onClick(mode.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? mode.bg : 'var(--grey-900)',
        borderTop:    `1px solid ${hovered ? mode.accent : 'var(--border)'}`,
        borderRight:  `1px solid ${hovered ? mode.accent : 'var(--border)'}`,
        borderBottom: `1px solid ${hovered ? mode.accent : 'var(--border)'}`,
        borderLeft:   `4px solid ${mode.accent}`,
        padding: '48px 40px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
        gap: '18px', transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'none', position: 'relative', minHeight: '400px',
      }}
    >
      <div style={{ position:'absolute', top:'12px', right:'14px', fontFamily:'var(--font-mono)', fontSize:'10px', color:mode.accent, opacity:0.6, letterSpacing:'0.05em' }}>
        {mode.num}
      </div>
      <div>
        <div className="quiz-card-label" style={{ fontFamily:'var(--font-display)', fontSize:'34px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', lineHeight:1.2, marginBottom:'4px' }}>
          {mode.label}
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.1em', color:mode.accent }}>
          {mode.subtitle}
        </div>
      </div>
      <div className="quiz-card-desc" style={{ fontFamily:'var(--font-mono)', fontSize:'15px', color:'var(--grey-300)', lineHeight:1.9, flex:1 }}>
        {mode.description}
      </div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:mode.accent, letterSpacing:'0.08em', textTransform:'uppercase', opacity: hovered ? 1 : 0, transition:'opacity 0.15s' }}>
        Start Quiz →
      </div>
    </div>
  );
}

// Renders the three quiz cards and handles navigation.
export default function QuizPage({ setPage }) {
  const handleSelect = (id) => {
    setPage(id);
  };

  return (
    <div className="quiz-page" style={{ minHeight:'calc(100vh - var(--nav-h))', display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 24px', gap:'32px', position:'relative', zIndex:1 }}>
      <style>{`
        /* Responsive styles for QuizPage */
        @media (max-width: 768px) {
          .quiz-page > div { max-width: 100%; }
          .quiz-page .quiz-card { padding: 30px 20px !important; min-height: 320px !important; }
          .quiz-page .quiz-card-label { font-size: 24px !important; }
          .quiz-page .quiz-card-desc { font-size: 13px !important; }
          .quiz-page .quiz-card > div:first-of-type { top: 8px !important; right: 8px !important; }
          .quiz-page > div > div:last-child { padding: 16px !important; }
          .quiz-page > div > div:last-child > div { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
        @media (max-width: 480px) {
          .quiz-page .quiz-card { padding: 20px 15px !important; min-height: 280px !important; }
          .quiz-page .quiz-card-label { font-size: 20px !important; }
          .quiz-page .quiz-card-desc { font-size: 12px !important; }
          .quiz-page > div > div:first-of-type button { padding: 8px 16px !important; font-size: 12px !important; }
          .quiz-page > div > div:nth-child(2) div:first-child { font-size: 9px !important; }
          .quiz-page > div > div:nth-child(2) div:last-child { font-size: 28px !important; }
        }
      `}</style>
      <div style={{ width:'100%', maxWidth:'1100px', display:'flex', flexDirection:'column', gap:'32px' }}>

        <button onClick={() => setPage('home')} style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s', alignSelf:'flex-start' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background='none'}>
          ← Back
        </button>

        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--grey-500)', marginBottom:'8px' }}>Challenge Yourself</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'40px', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--white)' }}>Quizzes</div>
        </div>

        <div style={{ background:'rgba(0,0,0,0.80)', border:'1px solid var(--border)', padding:'24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px' }}>
            {QUIZ_MODES.map((mode) => (
              <QuizCard key={mode.id} mode={mode} onClick={handleSelect} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}