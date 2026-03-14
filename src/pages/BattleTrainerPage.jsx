/*
 * BattleTrainerPage.jsx Trainer gallery page. Players browse trainers,
 * filter by difficulty / generation, then pick a saved team to fight with.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient.js';
import { TYPE_COLORS, TYPE_BG} from '../utils/constants.js';
import { fetchPokeData } from '../hooks/usePokemonData.js';


const TRAINERS = [
  {
    id: 'misty', name: 'Misty', title: 'Water-type Gym Leader',
    game: 'Pokémon Red / Blue / Yellow', gen: 1,
    accent: '#40a0e0', bg: '#0a1a30', difficulty: 1,
    party: [{ name:'staryu', evs: { hp:0, attack:0, defense:0, 'special-attack':252, 'special-defense':4, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'starmie', evs: { hp:0, attack:0, defense:0, 'special-attack':252, 'special-defense':4, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } }],
  },
  {
    id: 'roxanne', name: 'Roxanne', title: 'Rock-type Gym Leader',
    game: 'Pokémon Ruby / Sapphire / Emerald', gen: 3,
    accent: '#a08040', bg: '#2a1a08', difficulty: 1,
    party: [{ name:'geodude', evs: { hp:252, attack:4, defense:252, 'special-attack':0, 'special-defense':0, speed:0 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'graveler', evs: { hp:252, attack:4, defense:252, 'special-attack':0, 'special-defense':0, speed:0 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'nosepass', evs: { hp:252, attack:4, defense:252, 'special-attack':0, 'special-defense':0, speed:0 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } }],
  },
  {
    id: 'whitney', name: 'Whitney', title: 'Normal-type Gym Leader',
    game: 'Pokémon Gold / Silver / Crystal', gen: 2,
    accent: '#ff88aa', bg: '#3a1020', difficulty: 2,
    party: [{ name:'clefairy', evs: { hp:252, attack:252, defense:0, 'special-attack':0, 'special-defense':4, speed:0 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'miltank', evs: { hp:252, attack:252, defense:0, 'special-attack':0, 'special-defense':4, speed:0 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } }],
  },
  {
    id: 'morty', name: 'Morty', title: 'Ghost-type Gym Leader',
    game: 'Pokémon Gold / Silver / Crystal', gen: 2,
    accent: '#9070d0', bg: '#1a0a30', difficulty: 2,
    party: [{ name:'gastly', evs: { hp:0, attack:0, defense:0, 'special-attack':252, 'special-defense':4, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'haunter', evs: { hp:0, attack:0, defense:0, 'special-attack':252, 'special-defense':4, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'misdreavus', evs: { hp:0, attack:0, defense:0, 'special-attack':252, 'special-defense':4, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'gengar', evs: { hp:0, attack:0, defense:0, 'special-attack':252, 'special-defense':4, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } }],
  },
  {
    id: 'blue', name: 'Blue', title: 'Pallet Town Rival',
    game: 'Pokémon Red / Blue / Yellow', gen: 1,
    accent: '#4090d0', bg: '#1a3a6a', difficulty: 3,
    party: [{ name:'pidgeot', evs: { hp:0, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'alakazam', evs: { hp:0, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'rhydon', evs: { hp:0, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'arcanine', evs: { hp:0, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'exeggutor', evs: { hp:0, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'blastoise', evs: { hp:0, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } }],
  },
  {
    id: 'giovanni', name: 'Giovanni', title: 'Team Rocket Boss',
    game: 'Pokémon Red / Blue / Yellow', gen: 1,
    accent: '#c03030', bg: '#2a0808', difficulty: 3,
    party: [{ name:'persian', evs: { hp:0, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'dugtrio', evs: { hp:0, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'nidoqueen', evs: { hp:0, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'nidoking', evs: { hp:0, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'rhyhorn', evs: { hp:0, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } }],
  },
  {
    id: 'lance', name: 'Lance', title: 'Dragon Master',
    game: 'Pokémon Gold / Silver / Crystal', gen: 2,
    accent: '#c070e0', bg: '#3a1050', difficulty: 4,
    party: [{ name:'gyarados', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'dragonair', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'dragonite', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'aerodactyl', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'kingdra', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'charizard', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } }],
  },
  {
    id: 'steven', name: 'Steven', title: 'Hoenn Champion',
    game: 'Pokémon Ruby / Sapphire / Emerald', gen: 3,
    accent: '#b8a030', bg: '#3a2a08', difficulty: 4,
    party: [{ name:'skarmory', evs: { hp:252, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:0 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'claydol', evs: { hp:252, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:0 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'aggron', evs: { hp:252, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:0 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'cradily', evs: { hp:252, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:0 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'armaldo', evs: { hp:252, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:0 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'metagross', evs: { hp:252, attack:252, defense:4, 'special-attack':0, 'special-defense':0, speed:0 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } }],
  },
  {
    id: 'n', name: 'N', title: 'King of Team Plasma',
    game: 'Pokémon Black / White', gen: 5,
    accent: '#30a8a0', bg: '#0a2a28', difficulty: 4,
    party: [{ name:'klinklang', evs: { hp:0, attack:0, defense:0, 'special-attack':252, 'special-defense':4, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'zoroark', evs: { hp:0, attack:0, defense:0, 'special-attack':252, 'special-defense':4, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'carracosta', evs: { hp:0, attack:0, defense:0, 'special-attack':252, 'special-defense':4, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'vanilluxe', evs: { hp:0, attack:0, defense:0, 'special-attack':252, 'special-defense':4, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'archeops', evs: { hp:0, attack:0, defense:0, 'special-attack':252, 'special-defense':4, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'zekrom', evs: { hp:0, attack:0, defense:0, 'special-attack':252, 'special-defense':4, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } }],
  },
  {
    id: 'red', name: 'Red', title: 'Pokémon Champion',
    game: 'Pokémon Gold / Silver / Crystal', gen: 2,
    accent: '#e06030', bg: '#7a2a10', difficulty: 5,
    party: [{ name:'pikachu', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'venusaur', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'charizard', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'blastoise', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'snorlax', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'lapras', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } }],
  },
  {
    id: 'cynthia', name: 'Cynthia', title: 'Sinnoh Champion',
    game: 'Pokémon Diamond / Pearl / Platinum', gen: 4,
    accent: '#60c060', bg: '#1a3a1a', difficulty: 5,
    party: [{ name:'spiritomb', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'roserade', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'garchomp', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'lucario', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'milotic', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'togekiss', evs: { hp:0, attack:252, defense:0, 'special-attack':4, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } }],
  },
  {
    id: 'ghetsis', name: 'Ghetsis', title: 'Shadow Triad Leader',
    game: 'Pokémon Black / White', gen: 5,
    accent: '#4060c0', bg: '#080a20', difficulty: 5,
    party: [{ name:'cofagrigus', evs: { hp:4, attack:0, defense:0, 'special-attack':252, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'bouffalant', evs: { hp:4, attack:0, defense:0, 'special-attack':252, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'seismitoad', evs: { hp:4, attack:0, defense:0, 'special-attack':252, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'bisharp', evs: { hp:4, attack:0, defense:0, 'special-attack':252, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'eelektross', evs: { hp:4, attack:0, defense:0, 'special-attack':252, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } },{ name:'hydreigon', evs: { hp:4, attack:0, defense:0, 'special-attack':252, 'special-defense':0, speed:252 }, ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 } }],
  },
];

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
        setSprites(prev => ({ ...prev, [name]: d.sprite }));
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

// Clickable card for a single trainer.
function TrainerGalleryCard({ trainer, onChallenge }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onChallenge(trainer)}
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
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'20px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', lineHeight:1.1 }}>
              {trainer.name}
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.1em', color:trainer.accent, marginTop:'3px' }}>
              {trainer.title}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
            <DifficultyStars rating={trainer.difficulty} accent={trainer.accent} />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--white)', letterSpacing:'0.04em', textAlign:'right' }}>
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

// Modal overlay for choosing a saved team before the battle.
function TeamSelectModal({ trainer, slots, onConfirm, onClose, onBuildTeam }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const hasTeams = slots.some(s => s?.pokemon?.length > 0);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:150, padding:'24px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:'var(--grey-900)', border:`1px solid ${trainer.accent}`, width:'100%', maxWidth:'680px', maxHeight:'90vh', display:'flex', flexDirection:'column', boxShadow:`0 0 60px ${trainer.accent}33`, overflow:'hidden' }}>

        {/* Header */}
        <div style={{ background:trainer.bg, borderBottom:`1px solid ${trainer.accent}55`, padding:'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.12em', color:trainer.accent, marginBottom:'3px' }}>Challenging</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'18px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--white)' }}>
              {trainer.name} {trainer.title}
            </div>
            <DifficultyStars rating={trainer.difficulty} accent={trainer.accent} />
          </div>
          <button onClick={onClose} style={{ background:'none', border:'1px solid var(--border)', color:'var(--grey-400)', width:'30px', height:'30px', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.1s' }}
            onMouseEnter={e => { e.currentTarget.style.color='var(--white)'; e.currentTarget.style.borderColor='var(--border-lt)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--grey-400)'; e.currentTarget.style.borderColor='var(--border)'; }}>
            ✕
          </button>
        </div>

        {/* Opponent party */}
        <div style={{ padding:'14px 22px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'8px', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--grey-600)', marginBottom:'9px' }}>Opponent's Party</div>
          <PartyStrip members={trainer.party} accentColor={trainer.accent} />
        </div>

        {/* Team slots */}
        <div style={{ padding:'18px 22px', overflowY:'auto', flex:1 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--grey-400)', marginBottom:'12px' }}>Choose Your Team</div>

          {!hasTeams ? (
            <div style={{ textAlign:'center', padding:'24px 0', display:'flex', flexDirection:'column', gap:'12px', alignItems:'center' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--grey-500)' }}>No Teams Saved</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-600)', lineHeight:1.6 }}>Build and save a team before challenging a legend.</div>
              <button onClick={onBuildTeam}
                style={{ background:'rgba(64,144,208,0.15)', border:'1px solid #4090d0', color:'#4090d0', padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'13px', letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(64,144,208,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(64,144,208,0.15)'}>
                → Build a Team
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {slots.map((slot, i) => {
                if (!slot?.pokemon?.length) return null;
                const sel = selectedSlot === i;
                return (
                  <div key={i} onClick={() => setSelectedSlot(prev => prev === i ? null : i)}
                    style={{ background:sel ? `${trainer.accent}18` : 'var(--grey-800)', border:`1px solid ${sel ? trainer.accent : 'var(--border-mid)'}`, borderLeft:`4px solid ${sel ? trainer.accent : 'var(--border)'}`, padding:'12px 16px', cursor:'pointer', transition:'all 0.15s', boxShadow:sel ? `0 0 12px ${trainer.accent}33` : 'none' }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor='var(--border-lt)'; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor='var(--border-mid)'; }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:sel ? trainer.accent : 'var(--grey-500)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                          Slot {String(i+1).padStart(2,'0')}
                        </span>
                        <span style={{ fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.06em', textTransform:'uppercase', color:sel ? trainer.accent : 'var(--white)' }}>
                          {slot.name || `Team ${i+1}`}
                        </span>
                      </div>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-600)' }}>{slot.pokemon.length}/6</span>
                    </div>
                    <PartyStrip members={slot.pokemon} accentColor={sel ? trainer.accent : '#555'} />
                    <div style={{ display:'flex', gap:'4px', marginTop:'8px', flexWrap:'wrap' }}>
                      {slot.pokemon.flatMap(p => p.types || []).filter((t,i,a) => a.indexOf(t)===i).slice(0,8).map(t => (
                        <span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:'8px', textTransform:'uppercase', color:TYPE_COLORS[t]||'#888', border:`1px solid ${TYPE_COLORS[t]||'#888'}`, padding:'1px 5px', background:TYPE_BG[t]||'#222', letterSpacing:'0.04em' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
              <button onClick={onBuildTeam}
                style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--grey-500)', padding:'10px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:'4px', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-lt)'; e.currentTarget.style.color='var(--grey-300)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--grey-500)'; }}>
                + Build & Save New Team
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {hasTeams && (
          <div style={{ padding:'14px 22px', borderTop:'1px solid var(--border)', flexShrink:0, display:'flex', justifyContent:'flex-end', gap:'10px', background:'var(--grey-900)' }}>
            <button onClick={onClose}
              style={{ background:'none', border:'1px solid var(--border)', color:'var(--grey-400)', padding:'10px 22px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'12px', letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color='var(--white)'; e.currentTarget.style.borderColor='var(--border-lt)'; }}
              onMouseLeave={e => { e.currentTarget.style.color='var(--grey-400)'; e.currentTarget.style.borderColor='var(--border)'; }}>
              Cancel
            </button>
            <button onClick={() => selectedSlot !== null && onConfirm(selectedSlot)} disabled={selectedSlot === null}
              style={{ background:selectedSlot!==null ? trainer.accent : 'transparent', border:`1px solid ${selectedSlot!==null ? trainer.accent : 'var(--border)'}`, color:selectedSlot!==null ? '#000' : 'var(--grey-700)', padding:'10px 30px', cursor:selectedSlot!==null ? 'pointer' : 'not-allowed', fontFamily:'var(--font-display)', fontSize:'13px', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, transition:'all 0.2s' }}>
              {selectedSlot !== null ? `Fight ${trainer.name}!` : 'Select a Team'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main page: trainer gallery with search/filter and team-select modal.
export default function BattleTrainerPage({ setPage, user, setBattleTeams }) {
  const [slots,            setSlots]            = useState(Array(10).fill(null));
  const [challengeTrainer, setChallengeTrainer]  = useState(null);
  const [search,           setSearch]            = useState('');
  const [filterDiff,       setFilterDiff]        = useState(null); // 1-5 or null
  const [filterGen,        setFilterGen]         = useState(null); // 1-5 or null

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
      });
  }, [user]);

  const handleConfirm = (slotIdx) => {
    const trainer = challengeTrainer;
    const playerTeam = slots[slotIdx].pokemon;
    setBattleTeams({ playerTeam, opponentTeam: trainer.party.map(p => ({ ...p, moves: [] })), trainerLabel: trainer.name });
    setPage('trainerbattle');
  };

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
    <div style={{ minHeight:'calc(100vh - var(--nav-h))', display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 24px', gap:'28px', position:'relative', zIndex:1 }}>

      {challengeTrainer && (
        <TeamSelectModal
          trainer={challengeTrainer}
          slots={slots}
          onConfirm={handleConfirm}
          onClose={() => setChallengeTrainer(null)}
          onBuildTeam={() => setPage('saveteam')}
        />
      )}

      <div style={{ width:'100%', maxWidth:'1300px', display:'flex', flexDirection:'column', gap:'24px' }}>

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

        {/* Search + filters */}
        <div style={{ background:'rgba(0,0,0,0.80)', border:'1px solid var(--border)', padding:'16px 20px' }}>
        <div style={{ display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' }}>
          {/* Search box */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search trainers…"
            style={{ background:'var(--grey-900)', border:'1px solid var(--border-mid)', padding:'8px 14px', color:'var(--white)', fontSize:'13px', fontFamily:'var(--font-mono)', outline:'none', width:'220px', flexShrink:0 }}
            onFocus={e => e.target.style.borderColor='var(--border-lt)'}
            onBlur={e => e.target.style.borderColor='var(--border-mid)'}
          />

          {/* Difficulty filter */}
          <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--white)', textTransform:'uppercase', letterSpacing:'0.08em', marginRight:'2px' }}>Difficulty</span>
            <button style={filterDiff===null ? btnActive : btnBase} onClick={() => setFilterDiff(null)}>All</button>
            {[1,2,3,4,5].map(d => (
              <button key={d} style={filterDiff===d ? btnActive : btnBase} onClick={() => setFilterDiff(prev => prev===d ? null : d)}>
                {'★'.repeat(d)}
              </button>
            ))}
          </div>

          {/* Gen filter */}
          <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--white)', textTransform:'uppercase', letterSpacing:'0.08em', marginRight:'2px' }}>Gen</span>
            <button style={filterGen===null ? btnActive : btnBase} onClick={() => setFilterGen(null)}>All</button>
            {[1,2,3,4,5].map(g => (
              <button key={g} style={filterGen===g ? btnActive : btnBase} onClick={() => setFilterGen(prev => prev===g ? null : g)}>
                {g}
              </button>
            ))}
          </div>

          {/* Result count */}
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--white)', marginLeft:'auto' }}>
            {filtered.length} trainer{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        </div>

        {/* Gallery grid */}
        <div style={{ background:'rgba(0,0,0,0.80)', border:'1px solid var(--border)', padding:'24px' }}>
          {filtered.length > 0 ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'14px' }}>
              {filtered.map(trainer => (
                <TrainerGalleryCard key={trainer.id} trainer={trainer} onChallenge={t => setChallengeTrainer(t)} />
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
