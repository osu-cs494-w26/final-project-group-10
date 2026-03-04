// Will us when I add battle system

import React from 'react';

export default function SwitchPanel({ team, activeIdx, onSwitch }) {
  const available = team
    .map((p, i) => ({ ...p, idx: i }))
    .filter(p => !p.fainted && p.idx !== activeIdx);

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      background:     'rgba(0,0,0,0.85)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      zIndex:         500,
      animation:      'fadeInFast 0.2s ease',
    }}>
      <div style={{
        background:    'var(--grey-900)',
        border:        '1px solid var(--border-lt)',
        padding:       '24px',
        minWidth:      '400px',
        animation:     'popIn 0.25s ease both',
      }}>
        <div style={{
          fontFamily:    'var(--font-display)',
          fontSize:      '20px',
          fontWeight:    400,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom:  '16px',
          color:         'var(--white)',
        }}>
          Choose Next Pokemon
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {available.map(poke => {
            const pct = poke.hp / poke.maxHp;
            const hpColor = pct > 0.5 ? 'var(--hp-green)' : pct > 0.2 ? 'var(--hp-yellow)' : 'var(--hp-red)';

            return (
              <button
                key={poke.idx}
                onClick={() => onSwitch(poke.idx)}
                style={{
                  background:  'var(--grey-800)',
                  border:      '1px solid var(--border-mid)',
                  padding:     '12px 16px',
                  cursor:      'pointer',
                  textAlign:   'left',
                  display:     'flex',
                  alignItems:  'center',
                  gap:         '12px',
                  transition:  'all 0.15s',
                  color:       'var(--white)',
                  fontFamily:  'inherit',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-lt)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
              >
                {poke.sprite && (
                  <img src={poke.sprite} alt={poke.name} style={{ width:'48px', height:'48px', imageRendering:'pixelated' }} />
                )}
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'16px', letterSpacing:'0.05em', marginBottom:'4px' }}>
                    {poke.name}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ flex:1, height:'6px', background:'var(--grey-700)' }}>
                      <div style={{ width:`${pct*100}%`, height:'100%', background:hpColor, transition:'width 0.3s' }} />
                    </div>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-300)' }}>
                      {poke.hp}/{poke.maxHp}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
