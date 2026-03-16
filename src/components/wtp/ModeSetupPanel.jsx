import React from 'react';

import { getModeSetupOptions } from '../../data/wtpModes.js';

function getPromptLabel(setupKey) {
  switch (setupKey) {
    case 'generation':
      return 'Choose a generation';
    case 'type':
      return 'Choose a type';
    case 'color':
      return 'Choose a color';
    case 'evolution':
      return 'Choose an evolution stage';
    default:
      return 'Choose an option';
  }
}

export default function ModeSetupPanel({ mode, setupValue, onSelect, onStart, onClose, loading, isLocked = false }) {
  const options = getModeSetupOptions(mode.setup);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', zIndex:250 }}>
      <section style={{ width:'100%', maxWidth:'720px', background:'rgba(10,10,10,0.98)', border:`1px solid ${mode.accent}`, boxShadow:'0 24px 60px rgba(0,0,0,0.45)', padding:'28px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', gap:'12px', alignItems:'flex-start', marginBottom:'14px' }}>
          <div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.22em', color:mode.accent, marginBottom:'10px' }}>Mode Setup</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'28px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', marginBottom:'8px' }}>
              {mode.title}
            </div>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-300)', lineHeight:1.8 }}>
              {getPromptLabel(mode.setup)} before the round begins.
            </p>
          </div>
          {!isLocked && onClose ? (
            <button
              type="button"
              onClick={onClose}
              style={{ background:'transparent', border:'1px solid var(--border-lt)', color:'var(--white)', padding:'8px 12px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'12px', letterSpacing:'0.12em', textTransform:'uppercase' }}
            >
              Close
            </button>
          ) : null}
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', marginTop:'18px' }}>
          {options.map((option) => {
            const active = setupValue === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option)}
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

        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginTop:'24px' }}>
          <button
            type="button"
            disabled={!setupValue || loading}
            onClick={onStart}
            style={{
              background:'rgba(255,255,255,0.08)',
              border:'1px solid var(--white)',
              color:'var(--white)',
              padding:'11px 18px',
              cursor:!setupValue || loading ? 'not-allowed' : 'pointer',
              opacity:!setupValue || loading ? 0.45 : 1,
              fontFamily:'var(--font-display)',
              fontSize:'13px',
              letterSpacing:'0.12em',
              textTransform:'uppercase',
            }}
          >
            {loading ? 'Loading…' : isLocked ? 'Start Round' : 'Apply Selection'}
          </button>
        </div>
      </section>
    </div>
  );
}
