import React, { useState } from 'react';

import HintPanel from '../components/wtp/HintPanel.jsx';
import ModeSetupPanel from '../components/wtp/ModeSetupPanel.jsx';
import ScorePanel from '../components/wtp/ScorePanel.jsx';
import { WTP_MODE_MAP } from '../data/wtpModes.js';
import { useWhosThatPokemonGame } from '../hooks/useWhosThatPokemonGame.js';

function formatAnswerState(result) {
  return result?.isCorrect ? 'Correct' : 'Incorrect';
}

function actionButtonStyle(primary = false, disabled = false) {
  return {
    background: primary ? 'rgba(255,255,255,0.08)' : 'transparent',
    border: primary ? '1px solid var(--white)' : '1px solid var(--border-lt)',
    color: 'var(--white)',
    padding: '11px 18px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  };
}

export default function WhosThatPokemonGamePage({
  modeKey,
  initialSetup,
  onBackToModes,
  onUpdateSession,
  onViewPokedex,
}) {
  const mode = WTP_MODE_MAP[modeKey] || WTP_MODE_MAP.classic;
  const [draftSetup, setDraftSetup] = useState(initialSetup || null);
  const [selectedSetup, setSelectedSetup] = useState(initialSetup || null);
  const [setupModalOpen, setSetupModalOpen] = useState(!initialSetup && !!mode.setup);
  const {
    canSubmit,
    dailyLocked,
    error,
    guess,
    hintList,
    loadRound,
    result,
    round,
    roundState,
    setGuess,
    revealNextHint,
    remainingHints,
    setupReady,
    showDexEntry,
    setShowDexEntry,
    stats,
    submitGuess,
  } = useWhosThatPokemonGame(mode.key, selectedSetup);

  const handleSetupSelect = (option) => {
    setDraftSetup({ label: option.label, value: option.value });
  };

  const handleSetupStart = () => {
    if (!draftSetup) return;
    setSelectedSetup(draftSetup);
    onUpdateSession(mode.key, draftSetup);
    setSetupModalOpen(false);
  };

  const handlePlayAgain = () => {
    if (mode.key === 'daily' && dailyLocked) return;
    loadRound();
  };

  const showHintPanel = mode.allowsHints;

  return (
    <div style={{ minHeight:'calc(100vh - var(--nav-h))', display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 24px', gap:'24px', position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:'1180px', display:'flex', flexDirection:'column', gap:'24px' }}>
        <button type="button" style={{ ...actionButtonStyle(false, false), alignSelf:'flex-start' }} onClick={onBackToModes}>
          ← Back To Game Modes
        </button>

        <div style={{ display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'stretch', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'stretch', gap:'16px', flexWrap:'wrap', justifyContent:'flex-start', flex:'1 1 0' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'center', gap:'6px', padding:'12px 16px', border:`1px solid ${mode.accent}`, background:'rgba(255,255,255,0.02)', minWidth:'240px', flex:'1 1 0' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.22em', color:mode.accent }}>Active Mode</span>
              <strong style={{ fontFamily:'var(--font-display)', fontSize:'24px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', lineHeight:1 }}>{mode.title}</strong>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.16em', color:'var(--grey-400)' }}>{mode.subtitle}</span>
            </div>
            {mode.setup ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', padding:'12px 16px', border:'1px solid var(--border-lt)', background:'rgba(255,255,255,0.02)', minWidth:'320px' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)' }}>Current Selection</span>
                  <strong style={{ fontFamily:'var(--font-display)', fontSize:'18px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>
                    {selectedSetup?.label || 'Not Set'}
                  </strong>
                </div>
                <button
                  type="button"
                  style={{ ...actionButtonStyle(false, false), whiteSpace:'nowrap' }}
                  onClick={() => {
                    setDraftSetup(selectedSetup);
                    setSetupModalOpen(true);
                  }}
                >
                  Change Selection
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {mode.setup && setupModalOpen ? (
          <ModeSetupPanel
            mode={mode}
            setupValue={draftSetup?.value || ''}
            onSelect={handleSetupSelect}
            onStart={handleSetupStart}
            onClose={() => setSetupModalOpen(false)}
            loading={roundState === 'loading'}
            isLocked={!setupReady}
          />
        ) : null}

        <div style={{ display:'grid', gridTemplateColumns:showHintPanel ? 'minmax(0, 1.55fr) minmax(280px, 0.9fr)' : '1fr', gap:'18px', alignItems:'start' }}>
          <section style={{ background:'rgba(0,0,0,0.80)', border:'1px solid var(--border)', padding:'24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', gap:'12px', alignItems:'flex-start', marginBottom:'18px', flexWrap:'wrap' }}>
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.22em', color:'var(--grey-500)', marginBottom:'8px' }}>Round</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'30px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>Who's That Pokémon?</div>
              </div>
              {round ? <div style={{ fontFamily:'var(--font-mono)', color:mode.accent, letterSpacing:'0.18em', textTransform:'uppercase' }}>#{String(round.id).padStart(4, '0')}</div> : null}
            </div>

            {error ? <div style={{ border:'1px solid rgba(198,77,77,0.4)', background:'rgba(198,77,77,0.15)', color:'#ffc0c0', padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:'12px', lineHeight:1.7, marginBottom:'16px' }}>{error}</div> : null}
            {dailyLocked ? (
              <div style={{ border:'1px solid rgba(86,143,212,0.36)', background:'rgba(86,143,212,0.14)', color:'#bbddff', padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:'12px', lineHeight:1.7, marginBottom:'16px' }}>
                Daily Challenge is already complete for today. You can review today’s result, but not replay it until tomorrow.
              </div>
            ) : null}
            {result ? (
              <div style={{ border:result.isCorrect ? '1px solid rgba(88,180,105,0.45)' : '1px solid rgba(198,77,77,0.4)', background:result.isCorrect ? 'rgba(88,180,105,0.15)' : 'rgba(198,77,77,0.15)', color:result.isCorrect ? '#b8ffc4' : '#ffc0c0', padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:'12px', lineHeight:1.7, marginBottom:'16px' }}>
                {formatAnswerState(result)}: {result.isCorrect ? 'You identified the Pokemon.' : `${round?.displayName} was the answer.`}
              </div>
            ) : null}

            <div style={{ position:'relative', minHeight:'380px', border:'1px solid rgba(255,255,255,0.08)', background:'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 18%, rgba(255,255,255,0.04) 36%, rgba(255,255,255,0.022) 56%, rgba(255,255,255,0.014) 74%, rgba(255,255,255,0.02) 100%), linear-gradient(180deg, rgba(30,30,30,0.92), rgba(20,20,20,0.98))', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', boxShadow:'inset 0 0 56px rgba(255,255,255,0.035)' }}>
              {round?.image ? (
                <img
                  src={round.image}
                  alt={roundState === 'resolved' ? round.displayName : 'Pokemon silhouette'}
                  style={{
                    width:'min(76%, 340px)',
                    objectFit:'contain',
                    filter: roundState === 'resolved' ? 'brightness(1) saturate(1)' : 'brightness(0.08) saturate(0) contrast(1.18) drop-shadow(0 0 18px rgba(255,255,255,0.05))',
                    transform: roundState === 'resolved' ? 'scale(1)' : 'scale(1.06)',
                    transition:'filter 0.55s ease, transform 0.55s ease, opacity 0.55s ease',
                    animation: roundState === 'resolved' ? 'popIn 0.45s ease both' : 'none',
                    opacity: roundState === 'resolved' ? 1 : 0.96,
                  }}
                />
              ) : round?.sprite ? (
                <img
                  src={round.sprite}
                  alt={roundState === 'resolved' ? round.displayName : 'Pokemon silhouette'}
                  style={{
                    width:'min(76%, 340px)',
                    objectFit:'contain',
                    imageRendering:'pixelated',
                    filter: roundState === 'resolved' ? 'brightness(1) saturate(1)' : 'brightness(0.08) saturate(0) contrast(1.18) drop-shadow(0 0 18px rgba(255,255,255,0.05))',
                    transform: roundState === 'resolved' ? 'scale(1)' : 'scale(1.06)',
                    transition:'filter 0.55s ease, transform 0.55s ease, opacity 0.55s ease',
                    animation: roundState === 'resolved' ? 'popIn 0.45s ease both' : 'none',
                    opacity: roundState === 'resolved' ? 1 : 0.96,
                  }}
                />
              ) : (
                <div style={{ fontFamily:'var(--font-mono)', color:'var(--grey-400)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Loading artwork…</div>
              )}
            </div>

            <div style={{ marginTop:'20px' }}>
              <label htmlFor="wtp-guess" style={{ display:'block', marginBottom:'10px', fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--grey-400)' }}>
                Enter your guess
              </label>
              <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                <input
                  id="wtp-guess"
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  disabled={roundState !== 'playing'}
                  style={{ flex:'1 1 260px', minWidth:0, background:'rgba(255,255,255,0.02)', border:'1px solid var(--border-mid)', color:'var(--white)', padding:'14px 16px', fontFamily:'var(--font-ui)', fontSize:'16px' }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && canSubmit) {
                      submitGuess();
                    }
                  }}
                />
                <button type="button" style={actionButtonStyle(true, !canSubmit)} disabled={!canSubmit} onClick={submitGuess}>
                  Guess
                </button>
              </div>
            </div>

            {roundState === 'resolved' ? (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', marginTop:'20px' }}>
                <button type="button" style={actionButtonStyle(true, mode.key === 'daily' && dailyLocked)} onClick={handlePlayAgain} disabled={mode.key === 'daily' && dailyLocked}>
                  Play Again
                </button>
                <button type="button" style={actionButtonStyle(false, false)} onClick={onBackToModes}>
                  Back To Game Modes
                </button>
                <button type="button" style={actionButtonStyle(false, false)} onClick={() => setShowDexEntry((current) => !current)}>
                  View Pokedex Entry
                </button>
              </div>
            ) : null}

            {showDexEntry && round ? (
              <div style={{ marginTop:'18px', padding:'18px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)' }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.22em', color:'var(--grey-500)', marginBottom:'8px' }}>Pokedex Entry</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'28px', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--white)', marginBottom:'10px' }}>{round.displayName}</div>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-300)', lineHeight:1.8 }}>{round.flavorText || `${round.displayName} is listed as the ${round.genus}.`}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', marginTop:'14px' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--grey-300)' }}>{round.generationLabel}</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--grey-300)' }}>{round.types.join(' / ')}</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--grey-300)' }}>{round.color} group</span>
                </div>
                {onViewPokedex ? (
                  <button type="button" style={{ marginTop:'14px', padding:0, border:'none', background:'none', color:'var(--white)', cursor:'pointer', fontFamily:'var(--font-mono)', letterSpacing:'0.1em', textTransform:'uppercase' }} onClick={() => onViewPokedex(round.speciesName)}>
                    Open full Pokédex page
                  </button>
                ) : (
                  <div style={{ marginTop:'14px', fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-400)' }}>
                    App-level Pokédex handoff can be wired by passing `onViewPokedex(pokemonName)` into this page.
                  </div>
                )}
              </div>
            ) : null}
          </section>

          {showHintPanel ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
              <HintPanel
                mode={mode}
                hintList={hintList}
                remainingHints={remainingHints}
                onRevealHint={revealNextHint}
                roundState={roundState}
              />
            </div>
          ) : null}
        </div>

        <ScorePanel mode={mode} stats={result?.stats || stats} round={round} />
      </div>
    </div>
  );
}
