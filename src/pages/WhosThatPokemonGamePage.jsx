/*
WhosThatPokemonGamePage.jsx
Main game page for "Who's That Pokémon?" mode, handling game setup, gameplay, and run summary.
*/

import React, { useMemo, useState } from 'react';

import HintPanel from '../components/wtp/HintPanel.jsx';
import ModeSetupPanel from '../components/wtp/ModeSetupPanel.jsx';
import ScorePanel from '../components/wtp/ScorePanel.jsx';
import { getGameTypeByKey, WTP_MODE_MAP } from '../data/wtpModes.js';
import { useWhosThatPokemonGame } from '../hooks/useWhosThatPokemonGame.js';

// Helper functions for validating config, getting default config, button styles, reveal colors, and date shifting for daily override testing.

function hasValidConfig(mode, config) {
  return !!config?.gameType && (!mode.setup || !!config?.setup?.value);
}

function getDefaultConfigForMode(mode, initialConfig) {
  if (initialConfig) return initialConfig;
  if (mode.key === 'daily') {
    return { gameType: 'freeplay', setup: null };
  }
  return null;
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

function getRevealColor(result) {
  if (!result) return 'var(--white)';
  return result.isCorrect ? '#7dff96' : '#ff8b8b';
}

function shiftDateString(dateString, dayDelta) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day + dayDelta);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

// Modal shown at the end of a run, summarizing performance and offering next steps.
function RunSummaryModal({ mode, gameType, summary, onTryAgain, onBackToModes, onChangeSetup }) {
  if (!summary) return null;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', zIndex:260 }}>
      <section style={{ width:'100%', maxWidth:'760px', background:'rgba(10,10,10,0.98)', border:`1px solid ${mode.accent}`, boxShadow:'0 24px 60px rgba(0,0,0,0.45)', padding:'28px' }}>
        <div style={{ marginBottom:'18px' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.22em', color:mode.accent, marginBottom:'10px' }}>Run Complete</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'32px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', marginBottom:'8px' }}>
            {mode.title} • {gameType.shortLabel}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:'12px', marginBottom:'16px' }}>
          <div style={{ padding:'12px', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)', marginBottom:'6px' }}>Score</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'24px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>
              {summary.totalScore}
            </div>
          </div>
          <div style={{ padding:'12px', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)', marginBottom:'6px' }}>Correct Guesses</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'24px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>
              {summary.correctGuesses} / {summary.roundsPlayed}
            </div>
          </div>
          <div style={{ padding:'12px', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)', marginBottom:'6px' }}>Avg Guess Time</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'24px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>
              {summary.averageTimeSeconds}s
            </div>
          </div>
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', marginBottom:'20px' }}>
          {summary.isNewBestRun ? (
            <span style={{ border:`1px solid ${mode.accent}`, color:mode.accent, padding:'8px 10px', fontFamily:'var(--font-mono)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.12em', background:'rgba(255,255,255,0.04)' }}>
              New Best Run
            </span>
          ) : null}
          {summary.isNewBestRound ? (
            <span style={{ border:'1px solid #8bd3ff', color:'#8bd3ff', padding:'8px 10px', fontFamily:'var(--font-mono)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.12em', background:'rgba(255,255,255,0.04)' }}>
              New Best Round
            </span>
          ) : null}
          {summary.perfectRun ? (
            <span style={{ border:'1px solid #63d471', color:'#63d471', padding:'8px 10px', fontFamily:'var(--font-mono)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.12em', background:'rgba(255,255,255,0.04)' }}>
              Perfect Run
            </span>
          ) : null}
          {!summary.isNewBestRun && summary.previousBestRunScore > 0 ? (
            <span style={{ border:'1px solid var(--border-lt)', color:'var(--grey-300)', padding:'8px 10px', fontFamily:'var(--font-mono)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.12em', background:'rgba(255,255,255,0.02)' }}>
              Best Run To Beat: {summary.previousBestRunScore}
            </span>
          ) : null}
        </div>

        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          <button type="button" style={actionButtonStyle(true, false)} onClick={onTryAgain}>
            Try Again
          </button>
          <button type="button" style={actionButtonStyle(false, false)} onClick={onChangeSetup}>
            Change Setup
          </button>
          <button type="button" style={actionButtonStyle(false, false)} onClick={onBackToModes}>
            Back To Game Modes
          </button>
        </div>
      </section>
    </div>
  );
}

// Main game page component managing state for game setup, gameplay, and run summary display.
export default function WhosThatPokemonGamePage({
  modeKey,
  initialConfig,
  onBackToModes,
  onUpdateSession,
  onViewPokedex,
  onViewStats,
}) {
  const mode = WTP_MODE_MAP[modeKey] || WTP_MODE_MAP.classic;
  const resolvedInitialConfig = getDefaultConfigForMode(mode, initialConfig);
  const [draftConfig, setDraftConfig] = useState(resolvedInitialConfig || { gameType: 'freeplay', setup: null });
  const [selectedConfig, setSelectedConfig] = useState(resolvedInitialConfig || null);
  const [setupModalOpen, setSetupModalOpen] = useState(mode.key === 'daily' ? false : !hasValidConfig(mode, resolvedInitialConfig));
  const [showRunResults, setShowRunResults] = useState(false);
  const {
    advanceRound,
    canAdvanceRound,
    canSubmit,
    dailyDate,
    dailyLocked,
    dailyOverrideDate,
    error,
    gameType,
    guess,
    hintList,
    result,
    restartSession,
    round,
    roundState,
    runSummary,
    session,
    setDailyTestDate,
    setGuess,
    revealNextHint,
    remainingHints,
    stats,
    submitGuess,
  } = useWhosThatPokemonGame(mode.key, selectedConfig);

  const selectedGameType = useMemo(
    () => getGameTypeByKey(selectedConfig?.gameType || draftConfig?.gameType || 'freeplay'),
    [draftConfig?.gameType, selectedConfig?.gameType],
  );

  const handleSetupStart = () => {
    if (!hasValidConfig(mode, draftConfig)) return;
    setSelectedConfig(draftConfig);
    onUpdateSession(mode.key, draftConfig);
    setShowRunResults(false);
    setSetupModalOpen(false);
  };

  const handleSetupClose = () => {
    if (hasValidConfig(mode, selectedConfig)) {
      setSetupModalOpen(false);
      return;
    }

    onBackToModes({ preserveScroll: true });
  };

  const handleStartNext = () => {
    if (gameType.roundLimit === null) {
      setShowRunResults(false);
      restartSession();
      return;
    }

    if (session.runComplete) {
      setShowRunResults(false);
      restartSession();
      return;
    }

    setShowRunResults(false);
    advanceRound();
  };

  const setupLabel = selectedConfig?.setup?.label || null;
  const showHintPanel = mode.allowsHints;
  const primaryActionLabel = gameType.roundLimit === null
    ? 'Play Again'
    : (session.runComplete ? 'Start New Run' : 'Next Pokemon');
  // localhost-only daily override controls available for future testing
  const showDailyTestControls = false && mode.key === 'daily' && typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const showDailyRestrictionNotice = mode.key === 'daily' && (dailyLocked || roundState === 'resolved');
  const showRoundScore = gameType.roundLimit !== null && result?.metrics;

  return (
    <div style={{ minHeight:'calc(100vh - var(--nav-h))', display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 24px', gap:'24px', position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:'1180px', display:'flex', flexDirection:'column', gap:'24px' }}>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          <button type="button" style={{ ...actionButtonStyle(false, false), alignSelf:'flex-start' }} onClick={onBackToModes}>
            ← Back To Game Modes
          </button>
          <button type="button" style={{ ...actionButtonStyle(false, false), alignSelf:'flex-start' }} onClick={onViewStats}>
            View Stats
          </button>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'stretch', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'stretch', gap:'16px', flexWrap:'wrap', justifyContent:'flex-start', flex:'1 1 0' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'center', gap:'6px', padding:'12px 16px', border:`1px solid ${mode.accent}`, background:'rgba(255,255,255,0.02)', minWidth:'240px', flex:'1 1 0' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.22em', color:mode.accent }}>Active Mode</span>
              <strong style={{ fontFamily:'var(--font-display)', fontSize:'24px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', lineHeight:1 }}>{mode.title}</strong>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.16em', color:'var(--grey-400)' }}>{mode.subtitle}</span>
            </div>
            {mode.key !== 'daily' ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', padding:'12px 16px', border:'1px solid var(--border-lt)', background:'rgba(255,255,255,0.02)', minWidth:'360px', flex:'1 1 0' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)' }}>Session Setup</span>
                  <strong style={{ fontFamily:'var(--font-display)', fontSize:'18px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)' }}>
                    {selectedGameType.label}
                  </strong>
                  {setupLabel ? (
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--grey-400)' }}>{setupLabel}</span>
                  ) : null}
                </div>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'flex-end' }}>
                  {gameType.roundLimit ? (
                    <button
                      type="button"
                      style={{ ...actionButtonStyle(false, false), whiteSpace:'nowrap' }}
                      onClick={() => {
                        setShowRunResults(false);
                        restartSession();
                      }}
                    >
                      Restart
                    </button>
                  ) : null}
                  <button
                    type="button"
                    style={{ ...actionButtonStyle(false, false), whiteSpace:'nowrap' }}
                    onClick={() => {
                      setDraftConfig(selectedConfig || draftConfig);
                      setSetupModalOpen(true);
                    }}
                  >
                    Change Setup
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {showDailyTestControls ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap', padding:'12px 16px', border:'1px dashed rgba(139,211,255,0.4)', background:'rgba(139,211,255,0.06)' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'#8bd3ff' }}>Local Test Override</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-300)' }}>
                Daily date: {dailyDate}{dailyOverrideDate ? ' (override active)' : ' (real day)'}
              </span>
            </div>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <button type="button" style={actionButtonStyle(false, false)} onClick={() => setDailyTestDate(shiftDateString(dailyDate, -1))}>
                Previous Day
              </button>
              <button type="button" style={actionButtonStyle(false, false)} onClick={() => setDailyTestDate(shiftDateString(dailyDate, 1))}>
                Next Day
              </button>
              <button type="button" style={actionButtonStyle(false, false)} onClick={() => setDailyTestDate(null)}>
                Use Real Day
              </button>
            </div>
          </div>
        ) : null}

        {setupModalOpen ? (
          <ModeSetupPanel
            mode={mode}
            gameTypeKey={draftConfig?.gameType || ''}
            setupValue={draftConfig?.setup?.value || ''}
            onSelectGameType={(nextGameType) => setDraftConfig((current) => ({ ...(current || {}), gameType: nextGameType.key }))}
            onSelectSetup={(option) => setDraftConfig((current) => ({ ...(current || {}), setup: { label: option.label, value: option.value } }))}
            onStart={handleSetupStart}
            onClose={handleSetupClose}
            loading={roundState === 'loading'}
            canClose
            closeLabel={hasValidConfig(mode, selectedConfig) ? 'Close' : 'Back To Modes'}
          />
        ) : null}

        {gameType.roundLimit && session.runComplete && runSummary && showRunResults && !setupModalOpen ? (
          <RunSummaryModal
            mode={mode}
            gameType={gameType}
            summary={runSummary}
            onTryAgain={() => {
              setShowRunResults(false);
              restartSession();
            }}
            onBackToModes={onBackToModes}
            onChangeSetup={() => {
              setShowRunResults(false);
              setDraftConfig(selectedConfig || draftConfig);
              setSetupModalOpen(true);
            }}
          />
        ) : null}

        <div style={{ display:'grid', gridTemplateColumns:showHintPanel ? 'minmax(0, 1.55fr) minmax(280px, 0.9fr)' : '1fr', gap:'18px', alignItems:'start' }}>
          <section style={{ background:'rgba(0,0,0,0.80)', border:'1px solid var(--border)', padding:'24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', gap:'12px', alignItems:'flex-start', marginBottom:'18px', flexWrap:'wrap' }}>
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.22em', color:'var(--grey-500)', marginBottom:'8px' }}>
                  {gameType.roundLimit ? `Round ${session.currentRoundNumber} of ${gameType.roundLimit}` : 'Freeplay Round'}
                </div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'30px', letterSpacing:'0.08em', textTransform:'uppercase', color:getRevealColor(result) }}>
                  {roundState === 'resolved' && round ? `It was ${round.displayName}!` : "Who's That Pokémon?"}
                </div>
              </div>
              {round ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' }}>
                  <div style={{ fontFamily:'var(--font-mono)', color:mode.accent, letterSpacing:'0.18em', textTransform:'uppercase' }}>#{String(round.id).padStart(4, '0')}</div>
                  {showRoundScore ? (
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'30px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--white)', textAlign:'right', lineHeight:1 }}>
                      Score: {result.metrics.roundScore}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {error ? <div style={{ border:'1px solid rgba(198,77,77,0.4)', background:'rgba(198,77,77,0.15)', color:'#ffc0c0', padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:'12px', lineHeight:1.7, marginBottom:'16px' }}>{error}</div> : null}
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

            {showDailyRestrictionNotice ? (
              <div style={{ border:'1px solid rgba(86,143,212,0.36)', background:'rgba(86,143,212,0.14)', color:'#bbddff', padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:'12px', lineHeight:1.7, marginTop:'16px' }}>
                Daily Challenge only allows one guess per day. You can review today&apos;s result, but not replay it until tomorrow.
              </div>
            ) : null}

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
                  style={{ flex:'1 1 260px', minWidth:0, background:'rgba(255,255,255,0.02)', border:'1px solid var(--border-mid)', color:roundState === 'playing' ? 'var(--white)' : 'var(--grey-300)', padding:'14px 16px', fontFamily:'var(--font-ui)', fontSize:'16px', opacity:roundState === 'playing' ? 1 : 0.85, outline:'none', boxShadow:'none' }}
                  onFocus={(event) => {
                    event.currentTarget.style.boxShadow = `0 0 0 1px ${mode.accent}, 0 0 12px ${mode.glow}`;
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.boxShadow = 'none';
                  }}
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
                {!(gameType.roundLimit && session.runComplete) ? (
                  <button
                    type="button"
                    style={actionButtonStyle(true, gameType.key === 'freeplay' ? mode.key === 'daily' && dailyLocked : false)}
                    onClick={handleStartNext}
                    disabled={gameType.key === 'freeplay' ? mode.key === 'daily' && dailyLocked : false}
                  >
                    {primaryActionLabel}
                  </button>
                ) : null}
                {gameType.roundLimit && session.runComplete && runSummary ? (
                  <button type="button" style={actionButtonStyle(false, false)} onClick={() => setShowRunResults(true)}>
                    View Results
                  </button>
                ) : null}
                {canAdvanceRound || (gameType.roundLimit && session.runComplete) ? null : (
                  <button type="button" style={actionButtonStyle(false, false)} onClick={onBackToModes}>
                    Back To Game Modes
                  </button>
                )}
                {onViewPokedex && round ? (
                  <button type="button" style={actionButtonStyle(false, false)} onClick={() => onViewPokedex(round.speciesName)}>
                    Open Full Pokédex Page
                  </button>
                ) : null}
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

        <ScorePanel mode={mode} stats={stats} gameType={gameType} session={session} setupLabel={setupLabel} />
      </div>
    </div>
  );
}
