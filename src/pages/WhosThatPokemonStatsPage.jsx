import React, { useMemo, useState } from 'react';

import {
  getAvailableGameTypes,
  getModeSetupLabel,
  getModeSetupOptions,
  WTP_MODES,
} from '../data/wtpModes.js';
import { getModeStats } from '../utils/wtpStorage.js';

function actionButtonStyle(primary = false) {
  return {
    background: primary ? 'rgba(255,255,255,0.08)' : 'transparent',
    border: primary ? '1px solid var(--white)' : '1px solid var(--border-lt)',
    color: 'var(--white)',
    padding: '11px 18px',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  };
}

function createDefaultFilters() {
  return {
    all: { gameType: 'all', setupValue: 'all' },
    ...Object.fromEntries(WTP_MODES.map((mode) => [mode.key, { gameType: 'all', setupValue: 'all' }])),
  };
}

function formatPercentage(value) {
  return `${value}%`;
}

function formatSeconds(value) {
  return `${value}s`;
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label style={{ display:'flex', flexDirection:'column', gap:'8px', minWidth:'180px', flex:'0 1 200px' }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)' }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          background:'rgba(255,255,255,0.02)',
          border:'1px solid var(--border-mid)',
          color:'var(--white)',
          padding:'10px 12px',
          fontFamily:'var(--font-mono)',
          fontSize:'12px',
          boxShadow:'none',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} style={{ background:'#111', color:'#fff' }}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatCard({ label, value, accent = 'var(--white)' }) {
  return (
    <div style={{ padding:'14px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.02)', display:'flex', flexDirection:'column', gap:'6px' }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--grey-500)' }}>
        {label}
      </span>
      <strong style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:accent }}>
        {value}
      </strong>
    </div>
  );
}

function StatsGrid({ stats, accent, gameTypeKey = 'all', freeplayStreak = null }) {
  const isFreeplayView = gameTypeKey === 'freeplay';
  const isChallengeView = gameTypeKey.startsWith('challenge-');
  const isAllCategoriesView = gameTypeKey === 'all';

  const statItems = [
    { label: 'Rounds Played', value: stats.roundsPlayed, accent },
    { label: 'Correct Guesses', value: stats.allTimeCorrect, accent: 'var(--white)' },
    { label: 'Accuracy', value: formatPercentage(stats.accuracy), accent: 'var(--white)' },
    { label: 'Avg Guess Time', value: formatSeconds(stats.averageTimeSeconds), accent: 'var(--white)' },
    { label: 'Avg Hints Used', value: stats.averageHintsUsed, accent: 'var(--white)' },
    {
      label: isFreeplayView || isAllCategoriesView ? 'Freeplay Streak' : 'Points',
      value: isFreeplayView ? (stats.currentStreak ?? 0) : (isAllCategoriesView ? (freeplayStreak ?? 0) : stats.points),
      accent: 'var(--white)',
    },
    ...(isFreeplayView
      ? [{ label: 'Best Streak', value: stats.bestStreak, accent: 'var(--white)' }]
      : []),
    ...(!isFreeplayView && !isChallengeView && !isAllCategoriesView
      ? [
          { label: 'Best Streak', value: stats.bestStreak, accent: 'var(--white)' },
          { label: 'Current Streak', value: stats.currentStreak ?? 'N/A', accent: 'var(--white)' },
        ]
      : []),
    ...(!isFreeplayView
      ? [
          { label: 'Completed Runs', value: stats.completedRuns, accent: 'var(--white)' },
          { label: 'Perfect Runs', value: stats.perfectRuns, accent: 'var(--white)' },
          { label: 'Best Run Score', value: stats.bestRunScore, accent: 'var(--white)' },
          { label: 'Best Round Score', value: stats.bestRoundScore, accent: 'var(--white)' },
        ]
      : []),
  ];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'12px' }}>
      {statItems.map((item) => (
        <StatCard key={item.label} label={item.label} value={item.value} accent={item.accent} />
      ))}
    </div>
  );
}

function ModeStatsPanel({ mode, filters, onFiltersChange }) {
  const availableGameTypes = getAvailableGameTypes(mode);
  const setupOptions = mode.setup ? getModeSetupOptions(mode.setup) : [];
  const stats = getModeStats(mode.key, filters);
  const freeplayStats = filters.gameType === 'all'
    ? getModeStats(mode.key, { gameType: 'freeplay', setupValue: filters.setupValue })
    : null;

  const gameTypeOptions = [
    { value: 'all', label: 'All Categories' },
    ...availableGameTypes.map((gameType) => ({ value: gameType.key, label: gameType.label })),
  ];

  const poolOptions = [
    { value: 'all', label: 'All Selections' },
    ...setupOptions.map((option) => ({ value: option.value, label: option.label })),
  ];

  return (
    <section
      style={{
        background:`linear-gradient(180deg, ${mode.glow} 0%, rgba(0,0,0,0.84) 28%)`,
        borderTop:`1px solid ${mode.accent}`,
        borderRight:`1px solid ${mode.accent}`,
        borderBottom:'1px solid var(--border)',
        borderLeft:`4px solid ${mode.accent}`,
        padding:'24px',
        display:'flex',
        flexDirection:'column',
        gap:'20px',
      }}
    >
        <div style={{ display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'flex-start', flexWrap:'wrap' }}>
        <div style={{ maxWidth:'540px' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'30px', letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--white)', marginBottom:'8px' }}>
            {mode.title}
          </div>
          <p style={{ margin:0, fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-300)', lineHeight:1.8 }}>
            {mode.description}
          </p>
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:mode.accent, letterSpacing:'0.08em', textTransform:'uppercase' }}>
          Mode Breakdown
        </div>
      </div>

      <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
        <FilterSelect
          label="Game Category"
          value={filters.gameType}
          onChange={(gameType) => onFiltersChange({ ...filters, gameType })}
          options={gameTypeOptions}
        />
        {mode.setup ? (
          <FilterSelect
            label={getModeSetupLabel(mode.setup)}
            value={filters.setupValue}
            onChange={(setupValue) => onFiltersChange({ ...filters, setupValue })}
            options={poolOptions}
          />
        ) : null}
      </div>

      <StatsGrid
        stats={stats}
        accent={mode.accent}
        gameTypeKey={filters.gameType}
        freeplayStreak={freeplayStats?.currentStreak ?? null}
      />
    </section>
  );
}

export default function WhosThatPokemonStatsPage({ onBack }) {
  const [filtersByScope, setFiltersByScope] = useState(createDefaultFilters);

  const globalStats = getModeStats('all', filtersByScope.all);
  const globalFreeplayStats = filtersByScope.all.gameType === 'all'
    ? getModeStats('all', { gameType: 'freeplay', setupValue: 'all' })
    : null;
  const globalGameTypeOptions = useMemo(() => {
    const uniqueTypes = new Map();
    WTP_MODES.forEach((mode) => {
      getAvailableGameTypes(mode).forEach((gameType) => {
        uniqueTypes.set(gameType.key, gameType.label);
      });
    });
    return [
      { value: 'all', label: 'All Categories' },
      ...Array.from(uniqueTypes.entries()).map(([value, label]) => ({ value, label })),
    ];
  }, []);

  return (
    <div style={{ minHeight:'calc(100vh - var(--nav-h))', display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 24px', gap:'24px', position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:'1180px', display:'flex', flexDirection:'column', gap:'24px' }}>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          <button type="button" style={actionButtonStyle(false)} onClick={onBack}>
            ← Back
          </button>
        </div>

        <section style={{ background:'rgba(0,0,0,0.82)', border:'1px solid var(--border)', padding:'24px', display:'flex', flexDirection:'column', gap:'18px' }}>
          <div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.22em', color:'var(--grey-500)', marginBottom:'8px' }}>
              Who's That Pokemon
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'34px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--white)', marginBottom:'8px' }}>
              Stats Center
            </div>
            <p style={{ margin:0, fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-300)', lineHeight:1.8 }}>
              View your journey as a Pokémon trainer! Analyze your performance across different game modes and categories, track your progress over time, and discover insights about your gameplay style. Use these stats to identify your strengths, find areas for improvement, and set new goals as you continue to challenge yourself.
            </p>
          </div>
        </section>

        <section style={{ background:'linear-gradient(180deg, rgba(139,211,255,0.14) 0%, rgba(0,0,0,0.84) 28%)', border:'1px solid #8bd3ff', padding:'24px', display:'flex', flexDirection:'column', gap:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'flex-start', flexWrap:'wrap' }}>
            <div style={{ maxWidth:'540px' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.18em', color:'#8bd3ff', marginBottom:'8px' }}>
                Global Summary
              </div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'30px', letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--white)', marginBottom:'8px' }}>
                All Modes
              </div>
              <p style={{ margin:0, fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-300)', lineHeight:1.8 }}>
                Aggregate totals across every Who&apos;s That Pokémon mode.
              </p>
            </div>
          </div>

          <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
            <FilterSelect
              label="Game Category"
              value={filtersByScope.all.gameType}
              onChange={(gameType) => setFiltersByScope((current) => ({
                ...current,
                all: { ...current.all, gameType },
              }))}
              options={globalGameTypeOptions}
            />
          </div>

          <StatsGrid
            stats={globalStats}
            accent="#8bd3ff"
            gameTypeKey={filtersByScope.all.gameType}
            freeplayStreak={globalFreeplayStats?.currentStreak ?? null}
          />
        </section>

        {WTP_MODES.map((mode) => (
          <ModeStatsPanel
            key={mode.key}
            mode={mode}
            filters={filtersByScope[mode.key]}
            onFiltersChange={(nextFilters) => setFiltersByScope((current) => ({
              ...current,
              [mode.key]: nextFilters,
            }))}
          />
        ))}
      </div>
    </div>
  );
}
