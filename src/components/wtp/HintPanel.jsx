import React from 'react';

const HINT_ORDER = [
  { key: 'generation', label: 'Generation' },
  { key: 'types', label: 'Type' },
  { key: 'size', label: 'Size' },
  { key: 'flavor', label: 'Pokédex Entry' },
  { key: 'ability', label: 'Ability' },
  { key: 'letter', label: 'First Letter' },
];

export default function HintPanel({ mode, hintList, remainingHints, onRevealHint, roundState }) {
  const revealedHints = new Map(hintList.map((hint) => [hint.key, hint.value]));

  return (
    <section style={{ background:'rgba(0,0,0,0.80)', border:'1px solid var(--border)', padding:'24px', minHeight:'540px', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', justifyContent:'space-between', gap:'12px', alignItems:'flex-start', marginBottom:'18px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'24px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>
          Hints
        </div>
        {mode.allowsHints ? (
          <button
            type="button"
            onClick={onRevealHint}
            disabled={roundState !== 'playing' || remainingHints === 0}
            style={{
              background:'transparent',
              border:'1px solid var(--border-lt)',
              color:'var(--white)',
              padding:'10px 14px',
              cursor:roundState !== 'playing' || remainingHints === 0 ? 'not-allowed' : 'pointer',
              opacity:roundState !== 'playing' || remainingHints === 0 ? 0.45 : 1,
              fontFamily:'var(--font-display)',
              fontSize:'12px',
              letterSpacing:'0.12em',
              textTransform:'uppercase',
            }}
          >
            Reveal Hint
          </button>
        ) : null}
      </div>

      {!mode.allowsHints ? (
        <div style={{ flex:1, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-300)', lineHeight:1.8, textAlign:'center' }}>Hard Mode disables hints entirely.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px', flex:1 }}>
          {HINT_ORDER.map((hint) => {
            const value = revealedHints.get(hint.key);
            const isRevealed = revealedHints.has(hint.key);

            return (
              <div key={hint.key} style={{ border:'1px solid rgba(255,255,255,0.06)', padding:'12px', background:isRevealed ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', display:'flex', flexDirection:'column', gap:'5px', minHeight:hint.key === 'flavor' ? '92px' : '60px', justifyContent:'center' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)' }}>{hint.label}</span>
                <strong style={{ fontFamily:'var(--font-display)', fontWeight:500, letterSpacing:'0.06em', textTransform:isRevealed ? 'uppercase' : 'none', color:isRevealed ? 'var(--white)' : 'var(--grey-500)', lineHeight:1.5 }}>
                  {isRevealed ? value : 'Hidden'}
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
