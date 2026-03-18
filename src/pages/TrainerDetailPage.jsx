/*
 * TrainerDetailPage.jsx Parameterized route: /battle/trainer/:trainerId
 * Reads the trainerId from the URL via useParams(), looks up the trainer
 * in the shared TRAINERS array, and renders the full team-select challenge flow.
 * This is the parameterized route satisfying the CS 494 routing requirement.
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient.js';
import { TYPE_COLORS, TYPE_BG } from '../utils/constants.js';
import { fetchPokeData } from '../hooks/usePokemonData.js';
import { TRAINERS } from '../utils/trainers.js';

/* Difficulty star display */
function DifficultyStars({ rating, accent }) {
  return (
    <div style={{ display:'flex', gap:'2px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize:'12px', color: i <= rating ? accent : 'var(--grey-700)' }}>★</span>
      ))}
    </div>
  );
}

/* Row of Pokémon sprite thumbnails */
function PartyStrip({ members, accent }) {
  const [sprites, setSprites] = useState({});
  useEffect(() => {
    members.forEach(m => {
      fetchPokeData(m.name).then(d => setSprites(p => ({ ...p, [m.name]: d.sprite }))).catch(() => {});
    });
  }, [members.map(m => m.name).join(',')]);

  return (
    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
      {members.map((m, i) => (
        <div key={i} style={{ width:'56px', height:'56px', background:'rgba(0,0,0,0.35)', border:`1px solid ${accent}44`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {sprites[m.name]
            ? <img src={sprites[m.name]} alt={m.name} style={{ width:'50px', height:'50px', imageRendering:'pixelated' }} />
            : <div style={{ width:'32px', height:'32px', background:'rgba(255,255,255,0.04)' }} />
          }
        </div>
      ))}
    </div>
  );
}

// Renders the list of saved teams so the player can pick one before battling.
function TeamSlotPicker({ slots, trainer, selectedSlot, onSelect, onBuildTeam }) {
  const hasTeams = slots.some(s => s?.pokemon?.length > 0);

  if (!hasTeams) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'14px', padding:'32px 0' }}>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--grey-500)' }}>No Teams Saved</div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-600)', lineHeight:1.6, textAlign:'center' }}>Build and save a team before challenging a trainer.</div>
      <button onClick={onBuildTeam}
        style={{ background:`${trainer.accent}22`, border:`1px solid ${trainer.accent}`, color:trainer.accent, padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'12px', letterSpacing:'0.1em', textTransform:'uppercase' }}>
        Build a Team →
      </button>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
      {slots.map((slot, i) => {
        if (!slot?.pokemon?.length) return null;
        const sel = selectedSlot === i;
        return (
          <div key={i} onClick={() => onSelect(prev => prev === i ? null : i)}
            style={{ background: sel ? `${trainer.accent}18` : 'var(--grey-800)', border:`1px solid ${sel ? trainer.accent : 'var(--border-mid)'}`, borderLeft:`4px solid ${sel ? trainer.accent : 'var(--border)'}`, padding:'12px 16px', cursor:'pointer', transition:'all 0.15s', boxShadow: sel ? `0 0 12px ${trainer.accent}33` : 'none' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color: sel ? trainer.accent : 'var(--grey-500)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Slot {String(i+1).padStart(2,'0')}</span>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.06em', textTransform:'uppercase', color: sel ? trainer.accent : 'var(--white)' }}>{slot.name || `Team ${i+1}`}</span>
              </div>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-600)' }}>{slot.pokemon.length}/6</span>
            </div>
            <PartyStrip members={slot.pokemon} accent={sel ? trainer.accent : '#555'} />
            <div style={{ display:'flex', gap:'4px', marginTop:'8px', flexWrap:'wrap' }}>
              {slot.pokemon.flatMap(p => p.types || []).filter((t,i,a) => a.indexOf(t) === i).slice(0,8).map(t => (
                <span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:'8px', textTransform:'uppercase', color:TYPE_COLORS[t]||'#888', border:`1px solid ${TYPE_COLORS[t]||'#888'}`, padding:'1px 5px', background:TYPE_BG[t]||'#222' }}>{t}</span>
              ))}
            </div>
          </div>
        );
      })}
      <button onClick={onBuildTeam}
        style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--grey-500)', padding:'10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:'4px', transition:'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-lt)'; e.currentTarget.style.color='var(--grey-300)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--grey-500)'; }}>
        + Build &amp; Save New Team
      </button>
    </div>
  );
}

// Reads trainerId from the URL, looks up the trainer, and renders the challenge flow.
export default function TrainerDetailPage({ user, onBattleStart, onBack, onBuildTeam }) {
  /* useParams extracts trainerId from /battle/trainer/:trainerId */
  const { trainerId } = useParams();

  const trainer = TRAINERS.find(t => t.id === trainerId);

  const [slots,        setSlots]        = useState(Array(10).fill(null));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(true);

  /* Load the user's saved teams from Supabase */
  useEffect(() => {
    if (!user) { setLoadingSlots(false); return; }
    supabase
      .from('team_slots').select('*').eq('user_id', user.id).order('slot_index')
      .then(({ data, error }) => {
        if (!error && data) {
          const filled = Array(10).fill(null);
          data.forEach(row => { if (row.slot_index >= 0 && row.slot_index < 10) filled[row.slot_index] = row; });
          setSlots(filled);
        }
        setLoadingSlots(false);
      });
  }, [user]);

  /* 404 state: trainerId not found in TRAINERS list */
  if (!trainer) {
    return (
      <div style={{ minHeight:'calc(100vh - var(--nav-h))', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'28px', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--white)' }}>Trainer Not Found</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-500)' }}>No trainer with id "{trainerId}"</div>
        <button onClick={onBack} style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'13px', letterSpacing:'0.1em', textTransform:'uppercase' }}>
          ← Back to Trainers
        </button>
      </div>
    );
  }

  const handleFight = () => {
    if (selectedSlot === null) return;
    const playerTeam = slots[selectedSlot].pokemon;
    const opponentTeam = trainer.party.map(p => ({ ...p, moves: [] }));
    onBattleStart(playerTeam, opponentTeam, trainer.name);
  };

  return (
    <div style={{ minHeight:'calc(100vh - var(--nav-h))', display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 1rem', gap:'0', position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:'860px', display:'flex', flexDirection:'column', gap:'0' }}>

        {/* Back button */}
        <div style={{ marginBottom:'24px' }}>
          <button onClick={onBack}
            style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'13px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background='none'}>
            ← All Trainers
          </button>
        </div>

        {/* Trainer hero panel */}
        <div style={{ background:trainer.bg, border:`1px solid ${trainer.accent}`, borderBottom:'none', padding:'28px 32px', display:'flex', flexDirection:'column', gap:'14px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'36px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--white)', lineHeight:1 }}>{trainer.name}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.12em', color:trainer.accent, marginTop:'6px' }}>{trainer.title}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-400)', marginTop:'4px' }}>{trainer.game}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px' }}>
              <DifficultyStars rating={trainer.difficulty} accent={trainer.accent} />
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-500)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Gen {trainer.gen}</span>
            </div>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--grey-500)', marginBottom:'10px' }}>Opponent's Party</div>
            <PartyStrip members={trainer.party} accent={trainer.accent} />
          </div>
        </div>

        {/* Team picker + fight button */}
        <div style={{ background:'var(--grey-900)', border:`1px solid ${trainer.accent}`, borderTop:`1px solid ${trainer.accent}44`, padding:'24px 32px', display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'12px', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--grey-400)' }}>Choose Your Team</div>
          {loadingSlots
            ? <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-600)', padding:'20px 0' }}>Loading teams…</div>
            : <TeamSlotPicker slots={slots} trainer={trainer} selectedSlot={selectedSlot} onSelect={setSelectedSlot} onBuildTeam={onBuildTeam} />
          }

          {/* Fight button is active once a team slot is selected. */}
          <button
            onClick={handleFight}
            disabled={selectedSlot === null}
            style={{ background: selectedSlot !== null ? trainer.accent : 'transparent', border:`1px solid ${selectedSlot !== null ? trainer.accent : 'var(--border)'}`, color: selectedSlot !== null ? '#000' : 'var(--grey-700)', padding:'14px', cursor: selectedSlot !== null ? 'pointer' : 'not-allowed', fontFamily:'var(--font-display)', fontSize:'15px', letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:700, transition:'all 0.2s', width:'100%', marginTop:'8px' }}>
            {selectedSlot !== null ? `Fight ${trainer.name}!` : 'Select a Team First'}
          </button>
        </div>

      </div>
    </div>
  );
}
