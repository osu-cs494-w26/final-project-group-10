// SelectPage.jsx — Colin Totten
// Team selection screen — search Gen 1 list, add Pokemon, open customize popup.

import React, { useState, useEffect } from 'react';
import { GEN1_POKEMON } from '../utils/constants.js';
import { usePokemonData } from '../hooks/usePokemonData.js';
import CustomizePopup from '../components/CustomizePopup.jsx';

// One of the 6 team slots in the grid — shows sprite, name, item
function TeamSlot({ index, pokemon, onRemove, onClick }) {
  const filled = !!pokemon;
  return (
    <div onClick={() => filled && onClick()} style={{
      background: filled ? 'var(--grey-800)' : 'var(--grey-900)',
      border: `1px solid ${filled ? 'var(--border-lt)' : 'var(--border)'}`,
      minHeight: '160px', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding:'12px 8px',
      position:'relative', cursor: filled ? 'pointer' : 'default', transition:'background 0.15s',
    }}
    onMouseEnter={e => { if(filled) e.currentTarget.style.background = 'var(--grey-700)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = filled ? 'var(--grey-800)' : 'var(--grey-900)'; }}>
      {filled && (
        <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{
          position:'absolute', top:'6px', right:'8px', background:'none', border:'none',
          color:'var(--white)', cursor:'pointer', fontSize:'15px', lineHeight:1, padding:'2px 4px',
        }}>x</button>
      )}
      {filled ? (
        <>
          {/* Use official artwork sprite - same as customize popup */}
          {pokemon.cachedData?.spritePixel || pokemon.cachedData?.sprite
            ? <img src={pokemon.cachedData.sprite} alt={pokemon.name} style={{ width:'80px', height:'80px', objectFit:'contain' }} />
            : <div style={{ width:'80px', height:'80px', background:'var(--grey-700)' }} />
          }
          <div style={{ fontFamily:'var(--font-display)', fontSize:'13px', textTransform:'uppercase', marginTop:'6px', letterSpacing:'0.06em', color:'var(--white)' }}>
            {pokemon.name.replace(/-/g,' ')}
          </div>
          {pokemon.item && (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-400)', marginTop:'2px' }}>
              {pokemon.item.name || pokemon.item}
            </div>
          )}
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-600)', marginTop:'4px' }}>click to edit</div>
        </>
      ) : (
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-600)' }}>Slot {index}</div>
      )}
    </div>
  );
}

// A single row in the searchable pokemon list on the right
function PokemonRow({ name, sprite, inTeam, teamFull, onAdd }) {
  const id = GEN1_POKEMON.indexOf(name) + 1;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 10px', borderBottom:'1px solid var(--border)', background: inTeam ? 'rgba(255,255,255,0.03)' : 'transparent', transition:'background 0.1s' }}
      onMouseEnter={e => { if(!inTeam) e.currentTarget.style.background = 'var(--grey-800)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = inTeam ? 'rgba(255,255,255,0.03)' : 'transparent'; }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-600)', width:'26px', flexShrink:0, textAlign:'right' }}>#{id}</span>
      {sprite
        ? <img src={sprite} alt={name} style={{ width:'32px', height:'32px', imageRendering:'pixelated', flexShrink:0 }} />
        : <div style={{ width:'32px', height:'32px', background:'var(--grey-800)', flexShrink:0 }} />
      }
      <span style={{ flex:1, fontFamily:'var(--font-display)', fontSize:'13px', textTransform:'capitalize', letterSpacing:'0.04em', color: inTeam ? 'var(--grey-300)' : 'var(--white)' }}>
        {name.replace(/-/g,' ')}
      </span>
      <button disabled={inTeam || teamFull} onClick={onAdd} style={{
        background: inTeam ? 'transparent' : teamFull ? 'transparent' : 'var(--grey-700)',
        border: `1px solid ${inTeam ? 'var(--border)' : 'var(--border-mid)'}`,
        color: inTeam ? 'var(--grey-600)' : teamFull ? 'var(--grey-700)' : 'var(--white)',
        padding:'3px 10px', cursor: inTeam || teamFull ? 'not-allowed' : 'pointer',
        fontFamily:'var(--font-mono)', fontSize:'11px', flexShrink:0,
      }}>
        {inTeam ? 'In team' : 'Add'}
      </button>
    </div>
  );
}

export default function SelectPage({ setPage, team, setTeam }) {
  const [search,          setSearch]          = useState('');
  const [customizeTarget, setCustomizeTarget] = useState(null);
  const { sprites, fetchBasic, prefetchFull } = usePokemonData();

  const filtered = GEN1_POKEMON.filter(n =>
    n.replace(/-/g,' ').toLowerCase().includes(search.toLowerCase().trim())
  );

  useEffect(() => { filtered.slice(0, 30).forEach(n => fetchBasic(n)); }, [search]);
  useEffect(() => { team.forEach(p => { if(!p.cachedData) fetchBasic(p.name); }); }, [team]);

  // Fetch all data for a pokemon immediately when adding — so customize opens instantly
  const addToTeam = async (name) => {
    if (team.length >= 6 || team.find(p => p.name === name)) return;
    // Prefetch all data immediately when adding - so customize popup opens instantly
    const data = await prefetchFull(name);
    setTeam(prev => [...prev, {
      name,
      id:          data.id,
      moves:       data.moves.slice(0, 4),
      item:        null,
      ability:     data.abilities[0] || null,
      cachedData:  data,
    }]);
  };

  // Merge saved customizations back into the team array
  const handleSave = (updated) =>
    setTeam(prev => prev.map(p => p.name === updated.name ? updated : p));

  const canStart = team.length === 6;

  return (
    <div style={{ minHeight:'calc(100vh - var(--nav-h))', background:'var(--black)', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'var(--grey-900)', borderBottom:'1px solid var(--border)', padding:'16px 2rem', textAlign:'center' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'22px', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--white)' }}>Pick Your Team</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-500)', marginTop:'4px' }}>{team.length} / 6 selected</div>
      </div>

      <div style={{ flex:1, display:'flex', gap:'1rem', overflow:'hidden', padding:'1.5rem' }}>
        {/* Left: team grid + start */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'1rem', minWidth:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'var(--border)' }}>
            {[...Array(6)].map((_,i) => {
              const poke = team[i] || null;
              return (
                <TeamSlot key={i} index={i+1} pokemon={poke}
                  onRemove={() => setTeam(prev => prev.filter(p => p.name !== poke.name))}
                  onClick={() => setCustomizeTarget(poke)} />
              );
            })}
          </div>

          <button disabled={!canStart} onClick={() => canStart && setPage('battle')} style={{
            background: canStart ? 'var(--white)' : 'var(--grey-900)',
            border: `1px solid ${canStart ? 'var(--white)' : 'var(--border)'}`,
            color: canStart ? 'var(--black)' : 'var(--grey-600)',
            padding:'16px', cursor: canStart ? 'pointer' : 'not-allowed',
            fontFamily:'var(--font-display)', fontSize:'18px', letterSpacing:'0.2em', textTransform:'uppercase', transition:'all 0.15s',
          }}
          onMouseEnter={e => { if(canStart) e.currentTarget.style.background = 'var(--grey-100)'; }}
          onMouseLeave={e => { if(canStart) e.currentTarget.style.background = 'var(--white)'; }}>
            {canStart ? 'Start Battle' : `Need ${6-team.length} more Pokemon`}
          </button>
        </div>

        {/* Right: search list */}
        <div style={{ width:'260px', minWidth:'260px', background:'var(--grey-900)', border:'1px solid var(--border)', display:'flex', flexDirection:'column', maxHeight:'520px' }}>
          <div style={{ padding:'10px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Pokemon..."
              style={{ width:'100%', background:'var(--grey-800)', border:'1px solid var(--border-mid)', padding:'8px 10px', color:'var(--white)', fontSize:'13px', fontFamily:'var(--font-mono)', outline:'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--border-lt)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border-mid)'} />
          </div>
          <div style={{ overflowY:'auto', flex:1 }}>
            {filtered.map(name => {
              if (!sprites[name]) fetchBasic(name);
              return (
                <PokemonRow key={name} name={name} sprite={sprites[name]}
                  inTeam={!!team.find(p => p.name === name)}
                  teamFull={team.length >= 6}
                  onAdd={() => addToTeam(name)} />
              );
            })}
          </div>
        </div>
      </div>

      {customizeTarget && (
        <CustomizePopup
          pokemon={customizeTarget}
          onClose={() => setCustomizeTarget(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
