/*
 * PokemonCard.jsx Memoized grid card showing a Pokémon's sprite, name,
 * type badges, and an Add button. Shared between SaveTeamPage and SelectPage.
 *
 * teamFull is NOT a prop. It is communicated via the .team-full CSS class
 * on the parent container so flipping it never triggers a re-render of
 * individual cards. onDragStart, onDragEnd, onClick, and onAdd must be
 * stable references (useRef and useCallback pattern) for memo to hold.
 */

import { memo } from 'react';
import { GEN1_POKEMON, GEN2_POKEMON, GEN3_POKEMON, GEN4_POKEMON, GEN5_POKEMON, TYPE_COLORS, TYPE_BG } from '../utils/constants.js';

// Full list used to calculate the id badge number.
const ALL_POKEMON = ['testmon', ...GEN1_POKEMON, ...GEN2_POKEMON, ...GEN3_POKEMON, ...GEN4_POKEMON, ...GEN5_POKEMON];

// Renders a single Pokémon card with sprite, name, type badges, and an Add button.
const PokemonCard = memo(function PokemonCard({ name, cardData, isDragging, isSelected, onDragStart, onDragEnd, onClick, onAdd }) {
  const type1   = cardData?.types?.[0];
  const type2   = cardData?.types?.[1];
  const id      = ALL_POKEMON.indexOf(name) + 1;
  const accent  = type1 ? (TYPE_COLORS[type1] || '#888') : 'var(--border)';
  const cardBg  = type1 ? TYPE_BG[type1] : 'var(--grey-900)';

  return (
    <div
      draggable={!isDragging}
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(name); }}
      onDragEnd={onDragEnd}
      onClick={() => onClick(name)}
      className="pokemon-card"
      style={{
        background:  cardBg,
        borderTop:   `2px solid ${isSelected ? '#4ade80' : 'rgba(255,255,255,0.06)'}`,
        borderRight: `2px solid ${isSelected ? '#4ade80' : 'rgba(255,255,255,0.06)'}`,
        borderBottom:`2px solid ${isSelected ? '#4ade80' : 'rgba(255,255,255,0.06)'}`,
        borderLeft:  `4px solid ${isSelected ? '#4ade80' : accent}`,
        padding:'14px 12px', cursor:'pointer',
        opacity: isDragging ? 0.4 : 1,
        display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
        minHeight:'180px',
        transition:'opacity 0.15s, border-color 0.1s',
        userSelect:'none',
        boxShadow: isSelected ? '0 0 12px rgba(74,222,128,0.3)' : 'none',
        position:'relative',
      }}>
      <span style={{ position:'absolute', top:'7px', right:'9px', fontFamily:'var(--font-mono)', fontSize:'10px', color:accent, opacity:0.7 }}>#{id}</span>

      {cardData?.sprite
        ? <img src={cardData.staticSprite || cardData.sprite} alt={name} style={{ width:'96px', height:'96px', imageRendering:'pixelated' }} />
        : <div style={{ width:'96px', height:'96px', background:'var(--grey-700)', opacity:0.4 }} />
      }

      <div style={{ fontFamily:'var(--font-display)', fontSize:'13px', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--white)', textAlign:'center', lineHeight:1.2 }}>
        {name.replace(/-/g, ' ')}
      </div>

      <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', justifyContent:'center' }}>
        {type1 && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', color:TYPE_COLORS[type1]||'#888', letterSpacing:'0.06em', border:`1px solid ${TYPE_COLORS[type1]||'#888'}`, padding:'1px 6px', background:`${TYPE_BG[type1]||'#222'}` }}>{type1}</span>}
        {type2 && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', color:TYPE_COLORS[type2]||'#888', letterSpacing:'0.06em', border:`1px solid ${TYPE_COLORS[type2]||'#888'}`, padding:'1px 6px', background:`${TYPE_BG[type2]||'#222'}` }}>{type2}</span>}
      </div>

      {/* Add button opacity and pointer-events are controlled by the .team-full CSS class on the parent. */}
      <button
        onClick={e => { e.stopPropagation(); onAdd(name); }}
        className="pokemon-card-add"
        style={{ width:'100%', background:'none', border:'1px solid var(--white)', color:'var(--white)', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', padding:'5px 0', marginTop:'2px', transition:'opacity 0.1s' }}>
        Add
      </button>
    </div>
  );
});

export default PokemonCard;
