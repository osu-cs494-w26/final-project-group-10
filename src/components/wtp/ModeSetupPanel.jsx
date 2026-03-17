/*
* ModeSetupPanel.jsx
* React component that renders a modal panel for selecting the game type and mode setup options in the "Who's That Pokémon?" game mode. 
* It displays available game types, mode-specific setup options, and a start button to begin the game session with the selected configuration. 
*/

import React from 'react';

import {
  getAvailableGameTypes,
  getGameTypeByKey,
  getModeSetupLabel,
  getModeSetupOptions,
} from '../../data/wtpModes.js';

function sectionLabelStyle() {
  return {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: 'var(--grey-500)',
    marginBottom: '12px',
  };
}

export default function ModeSetupPanel({
  mode,
  gameTypeKey,
  setupValue,
  onSelectGameType,
  onSelectSetup,
  onStart,
  onClose,
  loading,
  canClose = false,
  closeLabel = 'Close',
}) {
  const setupOptions = getModeSetupOptions(mode.setup);
  const gameTypes = getAvailableGameTypes(mode);
  const selectedGameType = getGameTypeByKey(gameTypeKey || gameTypes[0]?.key || 'freeplay');
  const requiresSetup = !!mode.setup;
  const canStart = !!gameTypeKey && (!requiresSetup || !!setupValue);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', zIndex:250 }}>
      <section style={{ width:'100%', maxWidth:'860px', background:'rgba(10,10,10,0.98)', border:`1px solid ${mode.accent}`, boxShadow:'0 24px 60px rgba(0,0,0,0.45)', padding:'28px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', gap:'12px', alignItems:'flex-start', marginBottom:'18px', flexWrap:'wrap' }}>
          <div style={{ maxWidth:'620px' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.22em', color:mode.accent, marginBottom:'10px' }}>Mode Setup</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'28px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', marginBottom:'8px' }}>
              {mode.title}
            </div>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-300)', lineHeight:1.8, margin:0 }}>
              Choose your game type to start playing.
            </p>
          </div>
          {canClose && onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              style={{ background:'transparent', border:'1px solid var(--border-lt)', color:'var(--white)', width:'40px', height:'40px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'28px', fontWeight:600, letterSpacing:0, textTransform:'uppercase', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, padding:0 }}
            >
              ×
            </button>
          ) : null}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:requiresSetup ? 'minmax(0, 1.25fr) minmax(0, 1fr)' : '1fr', gap:'18px' }}>
          <div style={{ border:'1px solid rgba(255,255,255,0.08)', padding:'18px', background:'rgba(255,255,255,0.02)' }}>
            <div style={sectionLabelStyle()}>Game Category</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px, 1fr))', gap:'10px' }}>
              {gameTypes.map((gameType) => {
                const active = gameType.key === gameTypeKey;
                return (
                  <button
                    key={gameType.key}
                    type="button"
                    onClick={() => onSelectGameType(gameType)}
                    style={{
                      textAlign: 'left',
                      padding: '14px',
                      border: `1px solid ${active ? mode.accent : 'var(--border-mid)'}`,
                      background: active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                      color: 'var(--white)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      minHeight: '120px',
                    }}
                  >
                    <strong style={{ fontFamily:'var(--font-display)', fontSize:'16px', letterSpacing:'0.08em', textTransform:'uppercase' }}>{gameType.shortLabel}</strong>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:mode.accent, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                      {gameType.roundLimit ? `${gameType.roundLimit} scored rounds` : 'Unlimited rounds'}
                    </span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', lineHeight:1.6, color:'var(--grey-300)' }}>{gameType.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {requiresSetup ? (
            <div style={{ border:'1px solid rgba(255,255,255,0.08)', padding:'18px', background:'rgba(255,255,255,0.02)' }}>
              <div style={sectionLabelStyle()}>Mode Selection</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-300)', lineHeight:1.7, marginBottom:'14px' }}>
                {getModeSetupLabel(mode.setup)}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
                {setupOptions.map((option) => {
                  const active = setupValue === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onSelectSetup(option)}
                      style={{
                        padding:'10px 14px',
                        border:`1px solid ${active ? mode.accent : 'var(--border-mid)'}`,
                        background: active ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.02)',
                        color:'var(--white)',
                        fontFamily:'var(--font-display)',
                        fontSize:'13px',
                        textTransform:'uppercase',
                        letterSpacing:'0.08em',
                        cursor:'pointer',
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', gap:'12px', flexWrap:'wrap', marginTop:'22px', alignItems:'center' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-400)', lineHeight:1.7 }}>
            Selected: {selectedGameType.label}{requiresSetup && setupValue ? ` • ${setupOptions.find((option) => option.value === setupValue)?.label || setupValue}` : ''}
          </div>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            <button
              type="button"
              disabled={!canStart || loading}
              onClick={onStart}
              style={{
                background:'rgba(255,255,255,0.08)',
                border:'1px solid var(--white)',
                color:'var(--white)',
                padding:'11px 18px',
                cursor:!canStart || loading ? 'not-allowed' : 'pointer',
                opacity:!canStart || loading ? 0.45 : 1,
                fontFamily:'var(--font-display)',
                fontSize:'13px',
                letterSpacing:'0.12em',
                textTransform:'uppercase',
              }}
            >
              {loading ? 'Loading…' : 'Start Session'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
