/*
 * SaveSlotPanel.jsx Sidebar listing all 10 Supabase save slots with
 * load, overwrite, and delete actions. Renders as a fixed sidebar on
 * desktop or a full-screen slide-down panel on mobile.
 */

import React, { useState } from 'react';

// Renders the 10 save slots with load, overwrite, and delete buttons.
export default function SaveSlotPanel({ slots, currentTeam, onSave, onLoad, onDelete, saving, teamName, onTeamNameChange, isMobileDropdown, onClose }) {
  const canSave = currentTeam.length === 6;
  const [confirmDelete, setConfirmDelete] = useState(null);

  const inner = (
    <>
      <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--grey-400)' }}>Save Slots</div>
          {isMobileDropdown && (
            <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--grey-400)', cursor:'pointer', fontSize:'18px', lineHeight:1, padding:'0 4px' }}>✕</button>
          )}
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-600)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'4px' }}>Team Name</div>
        <input
          value={teamName}
          onChange={e => onTeamNameChange(e.target.value)}
          placeholder="My Team"
          maxLength={24}
          style={{ width:'100%', background:'var(--grey-800)', border:'1px solid var(--border-mid)', color:'var(--white)', fontFamily:'var(--font-display)', fontSize:'12px', letterSpacing:'0.06em', padding:'6px 8px', outline:'none', textTransform:'uppercase' }}
          onFocus={e => e.target.style.borderColor = 'var(--border-lt)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
        />
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color: canSave ? 'var(--grey-500)' : 'var(--grey-700)', marginTop:'6px' }}>
          {canSave ? '6/6 Pokémon pick a slot to save' : `${currentTeam.length}/6 Pokémon needed`}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'10px 12px', display:'flex', flexDirection:'column', gap:'6px' }}>
        {Array.from({ length: 10 }, (_, i) => {
          const slot    = slots[i];
          const hasData = slot && slot.pokemon && slot.pokemon.length > 0;
          return (
            <div key={i} style={{ background: hasData ? 'var(--grey-800)' : 'var(--grey-900)', border:'1px solid var(--border)', padding:'10px 12px', display:'flex', flexDirection:'column', gap:'6px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-400)', letterSpacing:'0.1em' }}>
                  SLOT {String(i + 1).padStart(2, '0')}
                </span>
                {hasData && (
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--grey-600)' }}>
                    {slot.pokemon.length}/6
                  </span>
                )}
              </div>

              {hasData ? (
                <>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'12px', color:'var(--white)', letterSpacing:'0.06em', textTransform:'uppercase', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {slot.name || `Team ${i + 1}`}
                  </div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-500)' }}>
                    {slot.pokemon.map(p => p.name.replace(/-/g, ' ')).join(', ')}
                  </div>
                  <div style={{ display:'flex', gap:'5px', marginTop:'2px' }}>
                    <button onClick={() => onLoad(i)} style={{ flex:1, background:'transparent', border:'1px solid var(--border-lt)', color:'var(--grey-200)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.08em', textTransform:'uppercase', padding:'4px 0', transition:'all 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      Load
                    </button>
                    <button onClick={() => canSave && onSave(i)} disabled={!canSave || saving}
                      style={{ flex:1, background: canSave ? 'rgba(64,144,208,0.15)' : 'transparent', border:`1px solid ${canSave ? '#4090d0' : 'var(--border)'}`, color: canSave ? '#4090d0' : 'var(--grey-700)', cursor: canSave ? 'pointer' : 'not-allowed', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.08em', textTransform:'uppercase', padding:'4px 0', transition:'all 0.1s' }}
                      onMouseEnter={e => { if (canSave) e.currentTarget.style.background = 'rgba(64,144,208,0.25)'; }}
                      onMouseLeave={e => { if (canSave) e.currentTarget.style.background = 'rgba(64,144,208,0.15)'; }}>
                      {saving ? '…' : 'Overwrite'}
                    </button>
                    {confirmDelete === i ? (
                      <>
                        <button onClick={() => { onDelete(i); setConfirmDelete(null); }}
                          style={{ flex:1, background:'rgba(200,50,50,0.25)', border:'1px solid #c03030', color:'#ff6060', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.08em', textTransform:'uppercase', padding:'4px 0', transition:'all 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,50,50,0.45)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,50,50,0.25)'}>
                          Sure?
                        </button>
                        <button onClick={() => setConfirmDelete(null)}
                          style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--grey-500)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', padding:'4px 6px', transition:'all 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--grey-500)'}>
                          ✕
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(i)}
                        style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--grey-600)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.08em', textTransform:'uppercase', padding:'4px 6px', transition:'all 0.1s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#c03030'; e.currentTarget.style.color = '#ff6060'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--grey-600)'; }}>
                        Del
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <button onClick={() => canSave && onSave(i)} disabled={!canSave || saving}
                  style={{ background: canSave ? 'rgba(64,144,208,0.12)' : 'transparent', border:`1px solid ${canSave ? '#4090d0' : 'var(--border)'}`, color: canSave ? '#4090d0' : 'var(--grey-700)', cursor: canSave ? 'pointer' : 'not-allowed', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.08em', textTransform:'uppercase', padding:'5px', transition:'all 0.1s' }}>
                  {saving ? 'Saving…' : canSave ? '+ Save Here' : 'Empty'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  // On mobile renders as a fixed full-screen panel sliding down below the nav.
  if (isMobileDropdown) {
    return (
      <div style={{ position:'fixed', top:'calc(var(--nav-h) + 52px)', left:0, right:0, bottom:0, zIndex:50, background:'var(--grey-900)', borderTop:'2px solid #4090d0', display:'flex', flexDirection:'column', overflow:'hidden', animation:'fadeIn 0.2s ease' }}>
        {inner}
      </div>
    );
  }

  return <div className="battle-builder-slots">{inner}</div>;
}
