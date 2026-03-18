/*
 * BattleTrainerPage.jsx Trainer gallery page. Players browse trainers,
 * filter by difficulty and generation, then navigate to the trainer's
 * detail page (/battle/trainer/:id) to pick a team and fight.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TYPE_COLORS, TYPE_BG } from '../utils/constants.js';
import { fetchPokeData } from '../hooks/usePokemonData.js';
import { TRAINERS } from '../utils/trainers.js';

// Renders a row of coloured stars for a trainer's difficulty rating.
function DifficultyStars({ rating, accent }) {
  return (
    <div style={{ display:'flex', gap:'2px', alignItems:'center' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize:'11px', color: i <= rating ? accent : 'var(--grey-700)', lineHeight:1 }}>★</span>
      ))}
    </div>
  );
}

// Renders a row of sprite boxes for a trainer's party.
function PartyStrip({ members, accentColor }) {
  const [sprites, setSprites] = useState({});

  useEffect(() => {
    const unique = [...new Set(members.map(m => m.name))];
    unique.forEach(name => {
      fetchPokeData(name).then(d => {
        setSprites(prev => ({ ...prev, [name]: d.staticSprite || d.sprite }));
      }).catch(() => {});
    });
  }, [members.map(m => m.name).join(',')]);

  return (
    <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
      {members.map((m, i) => {
        const src = sprites[m.name];
        return (
          <div key={i} style={{ width:'50px', height:'50px', background:'rgba(0,0,0,0.3)', border:`1px solid ${accentColor}33`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {src
              ? <img src={src} alt={m.name} style={{ width:'46px', height:'46px', imageRendering:'pixelated' }} />
              : <div style={{ width:'32px', height:'32px', background:'rgba(255,255,255,0.04)' }} />
            }
          </div>
        );
      })}
    </div>
  );
}

// Clickable card for a single trainer. Navigates to the trainer detail page on click.
function TrainerGalleryCard({ trainer }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => navigate(`/battle/trainer/${trainer.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? trainer.bg : 'var(--grey-900)',
        borderTop: `1px solid ${hovered ? trainer.accent : 'var(--border)'}`,
        borderRight: `1px solid ${hovered ? trainer.accent : 'var(--border)'}`,
        borderBottom: `1px solid ${hovered ? trainer.accent : 'var(--border)'}`,
        borderLeft: `4px solid ${trainer.accent}`,
        display:'flex', flexDirection:'column', overflow:'hidden',
        transition:'all 0.2s', cursor:'pointer',
        boxShadow: hovered ? `0 4px 24px ${trainer.accent}33` : 'none',
      }}>

      <div style={{ padding:'18px 18px 14px', display:'flex', flexDirection:'column', gap:'10px', flex:1 }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px' }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'20px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', lineHeight:1.1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {trainer.name}
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.1em', color:trainer.accent, marginTop:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {trainer.title}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0 }}>
            <DifficultyStars rating={trainer.difficulty} accent={trainer.accent} />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-400)', letterSpacing:'0.04em', textAlign:'right', lineHeight:1.3 }}>
              {trainer.game}
            </span>
          </div>
        </div>

        {/* Party */}
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'8px', color:'var(--white)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'7px' }}>Party</div>
          <PartyStrip members={trainer.party} accentColor={trainer.accent} />
        </div>
      </div>

      {/* Challenge footer */}
      <div style={{
        background: hovered ? trainer.accent : `${trainer.accent}22`,
        borderTop:`1px solid ${hovered ? trainer.accent : `${trainer.accent}44`}`,
        color: hovered ? '#000' : trainer.accent,
        padding:'11px 18px',
        fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.14em',
        textTransform:'uppercase', fontWeight:700, transition:'all 0.2s', width:'100%',
        textAlign:'center', boxSizing:'border-box',
      }}>
        Challenge {trainer.name} →
      </div>
    </div>
  );
}

// Main page: trainer gallery with search/filter. Clicking a card
// navigates to /battle/trainer/:id for the full challenge flow.
export default function BattleTrainerPage({ setPage, user }) {
  const [search,     setSearch]     = useState('');
  const [filterDiff, setFilterDiff] = useState(null);
  const [filterGen,  setFilterGen]  = useState(null);

  // Sort by difficulty 1→5, then filter
  const filtered = TRAINERS
    .slice()
    .sort((a, b) => a.difficulty - b.difficulty)
    .filter(t => {
      if (filterDiff !== null && t.difficulty !== filterDiff) return false;
      if (filterGen  !== null && t.gen         !== filterGen)  return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!t.name.toLowerCase().includes(q) && !t.title.toLowerCase().includes(q) && !t.game.toLowerCase().includes(q)) return false;
      }
      return true;
    });

  const btnBase = { fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.06em', padding:'6px 12px', cursor:'pointer', border:'1px solid var(--border-mid)', background:'var(--grey-900)', color:'var(--grey-400)', transition:'all 0.15s' };
  const btnActive = { ...btnBase, background:'var(--grey-700)', border:'1px solid var(--border-lt)', color:'var(--white)' };

  return (
    <div style={{ minHeight:'calc(100vh - var(--nav-h))', display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 1rem', gap:'28px', position:'relative', zIndex:1 }}>

      {/* Content box: full width on mobile, capped at 1300px on desktop */}
      <div className="page-content-box" style={{ maxWidth:'1300px', display:'flex', flexDirection:'column', gap:'24px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={() => setPage('battlemode')}
            style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background='none'}>
            ← Back
          </button>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'36px', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--white)' }}>Battle Trainer</div>
          </div>
          <div style={{ width:'120px' }} />
        </div>

        <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-500)', textAlign:'center', marginTop:'-8px' }}>
          Choose a trainer to challenge.
        </div>

        {/* Search + filters: stacks vertically on mobile */}
        <div style={{ background:'rgba(0,0,0,0.80)', border:'1px solid var(--border)', padding:'16px 20px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

            {/* Search box: full width on mobile */}
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search trainers…"
              style={{ background:'var(--grey-900)', border:'1px solid var(--border-mid)', padding:'8px 14px', color:'var(--white)', fontSize:'13px', fontFamily:'var(--font-mono)', outline:'none', width:'100%', maxWidth:'320px' }}
              onFocus={e => e.target.style.borderColor='var(--border-lt)'}
              onBlur={e => e.target.style.borderColor='var(--border-mid)'}
            />

            {/* Difficulty and Gen filters side by side, each wrapping internally */}
            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', alignItems:'flex-start' }}>

              {/* Difficulty filter */}
              <div style={{ display:'flex', gap:'4px', alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-400)', textTransform:'uppercase', letterSpacing:'0.08em', marginRight:'2px', flexShrink:0 }}>Difficulty</span>
                <button style={filterDiff===null ? btnActive : btnBase} onClick={() => setFilterDiff(null)}>All</button>
                {[1,2,3,4,5].map(d => (
                  <button key={d} style={filterDiff===d ? btnActive : btnBase} onClick={() => setFilterDiff(prev => prev===d ? null : d)}>
                    {'★'.repeat(d)}
                  </button>
                ))}
              </div>

              {/* Gen filter */}
              <div style={{ display:'flex', gap:'4px', alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-400)', textTransform:'uppercase', letterSpacing:'0.08em', marginRight:'2px', flexShrink:0 }}>Gen</span>
                <button style={filterGen===null ? btnActive : btnBase} onClick={() => setFilterGen(null)}>All</button>
                {[1,2,3,4,5].map(g => (
                  <button key={g} style={filterGen===g ? btnActive : btnBase} onClick={() => setFilterGen(prev => prev===g ? null : g)}>
                    {g}
                  </button>
                ))}
              </div>

            </div>

            {/* Result count */}
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-600)' }}>
              {filtered.length} trainer{filtered.length !== 1 ? 's' : ''}
            </span>

          </div>
        </div>

        {/* Gallery grid: 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <div style={{ background:'rgba(0,0,0,0.80)', border:'1px solid var(--border)', padding:'24px' }}>
          {filtered.length > 0 ? (
            <div className="trainer-gallery-grid">
              {filtered.map(trainer => (
                <TrainerGalleryCard key={trainer.id} trainer={trainer} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'60px 0', fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-600)' }}>
              No trainers match your search.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
