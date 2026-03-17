/*
* wtpStorage.js
* Utility functions for storing and retrieving player statistics for the "Who's That Pokémon?" game modes using localStorage.
* Note: This implementation assumes that localStorage is available and may not work correctly in private browsing modes or environments without localStorage support. 
* It also does not implement any data expiration or cleanup, so stats will persist indefinitely unless manually cleared by the user.
*/

import { WTP_GAME_TYPES, WTP_MODES } from '../data/wtpModes.js';

const STORAGE_PREFIX = 'pokiportal:wtp';
const STATS_V2_KEY = `${STORAGE_PREFIX}:stats:v2`;

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function legacyStatsKey(modeKey) {
  return `${STORAGE_PREFIX}:stats:${modeKey}`;
}

function dailyKey() {
  return `${STORAGE_PREFIX}:daily-progress`;
}

export function getDefaultModeStats() {
  return {
    roundsPlayed: 0,
    correctGuesses: 0,
    incorrectGuesses: 0,
    allTimeCorrect: 0,
    points: 0,
    totalHintsUsed: 0,
    totalTimeMs: 0,
    bestRoundScore: 0,
    bestRunScore: 0,
    currentStreak: 0,
    bestStreak: 0,
    runsPlayed: 0,
    completedRuns: 0,
    perfectRuns: 0,
    totalRoundsScheduled: 0,
    lastPlayedAt: null,
    score: 0,
  };
}
 // Base stats structure for a game mode or category, with all fields initialized to default values.
function withComputedStats(stats) {
  const roundsPlayed = stats.roundsPlayed || 0;
  const correctGuesses = stats.correctGuesses || 0;
  const accuracy = roundsPlayed ? Math.round((correctGuesses / roundsPlayed) * 100) : 0;
  const averageHintsUsed = roundsPlayed ? Number((stats.totalHintsUsed / roundsPlayed).toFixed(2)) : 0;
  const averageTimeSeconds = roundsPlayed ? Number((stats.totalTimeMs / roundsPlayed / 1000).toFixed(1)) : 0;
  const averageRunScore = stats.completedRuns ? Math.round(stats.points / stats.completedRuns) : 0;

  return {
    ...getDefaultModeStats(),
    ...stats,
    accuracy,
    averageHintsUsed,
    averageTimeSeconds,
    averageRunScore,
    score: stats.allTimeCorrect ?? stats.score ?? 0,
  };
}

function createModeBucket() {
  return {
    overall: getDefaultModeStats(),
    categories: Object.fromEntries(WTP_GAME_TYPES.map((type) => [type.key, getDefaultModeStats()])),
    setups: {},
  };
}

function createStatsStore() {
  return {
    version: 2,
    modes: Object.fromEntries(WTP_MODES.map((mode) => [mode.key, createModeBucket()])),
  };
}

// Accumulates stats by summing additive fields and taking the max of best scores/streaks.
function accumulateStats(base, delta) {
  return {
    roundsPlayed: base.roundsPlayed + delta.roundsPlayed,
    correctGuesses: base.correctGuesses + delta.correctGuesses,
    incorrectGuesses: base.incorrectGuesses + delta.incorrectGuesses,
    allTimeCorrect: base.allTimeCorrect + delta.allTimeCorrect,
    points: base.points + delta.points,
    totalHintsUsed: base.totalHintsUsed + delta.totalHintsUsed,
    totalTimeMs: base.totalTimeMs + delta.totalTimeMs,
    bestRoundScore: Math.max(base.bestRoundScore, delta.bestRoundScore),
    bestRunScore: Math.max(base.bestRunScore, delta.bestRunScore),
    currentStreak: delta.currentStreak === undefined ? base.currentStreak : delta.currentStreak,
    bestStreak: Math.max(base.bestStreak, delta.bestStreak),
    runsPlayed: base.runsPlayed + delta.runsPlayed,
    completedRuns: base.completedRuns + delta.completedRuns,
    perfectRuns: base.perfectRuns + delta.perfectRuns,
    totalRoundsScheduled: base.totalRoundsScheduled + delta.totalRoundsScheduled,
    lastPlayedAt: [base.lastPlayedAt, delta.lastPlayedAt].filter(Boolean).sort().at(-1) || null,
    score: base.score + delta.score,
  };
}

// Merges two stats objects, summing additive fields and taking the max of best scores/streaks. 
// If both have roundsPlayed > 0, currentStreak is reset to null to avoid confusion. Otherwise, it takes the non-zero streak or retains the existing one. 
// This is used when combining stats from different buckets where we can't be sure if they are sequential or not.
function mergeStats(base, incoming) {
  return {
    roundsPlayed: base.roundsPlayed + incoming.roundsPlayed,
    correctGuesses: base.correctGuesses + incoming.correctGuesses,
    incorrectGuesses: base.incorrectGuesses + incoming.incorrectGuesses,
    allTimeCorrect: base.allTimeCorrect + incoming.allTimeCorrect,
    points: base.points + incoming.points,
    totalHintsUsed: base.totalHintsUsed + incoming.totalHintsUsed,
    totalTimeMs: base.totalTimeMs + incoming.totalTimeMs,
    bestRoundScore: Math.max(base.bestRoundScore, incoming.bestRoundScore),
    bestRunScore: Math.max(base.bestRunScore, incoming.bestRunScore),
    currentStreak: base.roundsPlayed > 0 && incoming.roundsPlayed > 0 ? null : (base.currentStreak ?? incoming.currentStreak),
    bestStreak: Math.max(base.bestStreak, incoming.bestStreak),
    runsPlayed: base.runsPlayed + incoming.runsPlayed,
    completedRuns: base.completedRuns + incoming.completedRuns,
    perfectRuns: base.perfectRuns + incoming.perfectRuns,
    totalRoundsScheduled: base.totalRoundsScheduled + incoming.totalRoundsScheduled,
    lastPlayedAt: [base.lastPlayedAt, incoming.lastPlayedAt].filter(Boolean).sort().at(-1) || null,
    score: base.score + incoming.score,
  };
}

// Aggregates stats from multiple buckets by merging their overall or category stats, depending on the specified gameType.
function aggregateBuckets(buckets, gameType) {
  return buckets.reduce((combined, bucket) => mergeStats(combined, getBucketStats(bucket, gameType)), getDefaultModeStats());
}

// Builds a stats object from legacy storage format for a given mode key. Returns null if no legacy data is found for that mode.
function buildLegacyFreeplayStats(modeKey) {
  const legacy = readJson(legacyStatsKey(modeKey), null);
  if (!legacy) return null;

  return {
    ...getDefaultModeStats(),
    roundsPlayed: legacy.gamesPlayed || 0,
    correctGuesses: legacy.correct || 0,
    incorrectGuesses: Math.max((legacy.gamesPlayed || 0) - (legacy.correct || 0), 0),
    allTimeCorrect: legacy.score || legacy.correct || 0,
    currentStreak: legacy.streak || 0,
    bestStreak: legacy.bestStreak || 0,
    runsPlayed: legacy.gamesPlayed || 0,
    completedRuns: legacy.gamesPlayed || 0,
    totalRoundsScheduled: legacy.gamesPlayed || 0,
    score: legacy.score || legacy.correct || 0,
  };
}

// Migrates legacy stats from the old storage format to the new structured format. 
// It reads legacy stats for each mode, accumulates them into the new store structure, and saves the new store back to localStorage. 
// If no legacy data is found, it simply returns a new empty stats store.
function migrateLegacyStore() {
  const store = createStatsStore();
  let migrated = false;

  WTP_MODES.forEach((mode) => {
    const legacyStats = buildLegacyFreeplayStats(mode.key);
    if (!legacyStats) return;

    migrated = true;
    store.modes[mode.key].overall = accumulateStats(store.modes[mode.key].overall, legacyStats);
    store.modes[mode.key].categories.freeplay = accumulateStats(store.modes[mode.key].categories.freeplay, legacyStats);
  });

  if (migrated) {
    writeJson(STATS_V2_KEY, store);
  }

  return store;
}

// Retrieves the stats store from localStorage. If the stored version is outdated, it migrates legacy data to the new format.
function getStatsStore() {
  const existing = readJson(STATS_V2_KEY, null);
  if (existing?.version === 2) {
    const defaultStore = createStatsStore();
    return {
      ...defaultStore,
      ...existing,
      modes: WTP_MODES.reduce((modes, mode) => {
        const savedMode = existing.modes?.[mode.key] || {};
        modes[mode.key] = {
          ...defaultStore.modes[mode.key],
          ...savedMode,
          categories: {
            ...defaultStore.modes[mode.key].categories,
            ...(savedMode.categories || {}),
          },
        };
        return modes;
      }, {}),
    };
  }

  return migrateLegacyStore();
}

// Saves the provided stats store to localStorage under the defined key. This should be called after any updates to the stats store to persist changes.
function writeStatsStore(store) {
  writeJson(STATS_V2_KEY, store);
}

// Retrieves or creates a setup bucket within a mode bucket based on the provided setup value. 
// If the setup value is falsy, it returns null. If the setup bucket for the given value does not exist, it initializes it with a new mode bucket structure. 
// This allows for dynamic tracking of stats for different setups within a game mode.
function getOrCreateSetupBucket(modeBucket, setupValue) {
  if (!setupValue) return null;
  if (!modeBucket.setups[setupValue]) {
    modeBucket.setups[setupValue] = createModeBucket();
  }
  return modeBucket.setups[setupValue];
}

// Updates the overall and category stats within a given bucket by applying the provided delta. 
function updateBucketStats(bucket, gameType, delta) {
  bucket.overall = accumulateStats(bucket.overall, delta);
  bucket.categories[gameType] = accumulateStats(bucket.categories[gameType], delta);
}

// Records a stats update for a specific mode, game type, and setup value by applying the provided delta to the relevant buckets in the stats store.
function recordStatsDelta(modeKey, gameType, setupValue, delta) {
  const store = getStatsStore();
  const modeBucket = store.modes[modeKey] || createModeBucket();
  store.modes[modeKey] = modeBucket;

  updateBucketStats(modeBucket, gameType, delta);

  const setupBucket = getOrCreateSetupBucket(modeBucket, setupValue);
  if (setupBucket) {
    updateBucketStats(setupBucket, gameType, delta);
  }

  writeStatsStore(store);
  return getModeStats(modeKey, { gameType, setupValue });
}

// Records the outcome of a freeplay round
export function recordFreeplayRound({ modeKey, setupValue, isCorrect, hintsUsed, timeMs }) {
  const current = getModeStats(modeKey, { gameType: 'freeplay', setupValue });
  const nextStreak = isCorrect ? current.currentStreak + 1 : 0;
  const now = new Date().toISOString();
  const delta = {
    ...getDefaultModeStats(),
    roundsPlayed: 1,
    correctGuesses: isCorrect ? 1 : 0,
    incorrectGuesses: isCorrect ? 0 : 1,
    allTimeCorrect: isCorrect ? 1 : 0,
    totalHintsUsed: hintsUsed,
    totalTimeMs: timeMs,
    currentStreak: nextStreak,
    bestStreak: isCorrect ? Math.max(current.bestStreak, nextStreak) : current.bestStreak,
    runsPlayed: 1,
    completedRuns: 1,
    totalRoundsScheduled: 1,
    lastPlayedAt: now,
    score: isCorrect ? 1 : 0,
  };

  return recordStatsDelta(modeKey, 'freeplay', setupValue, delta);
}

// Records the outcome of a completed challenge run, including the number of rounds played, correct guesses, hints used, total time, and points scored.
export function recordChallengeRun({
  modeKey,
  gameType,
  setupValue,
  roundsPlayed,
  correctGuesses,
  hintsUsed,
  totalTimeMs,
  points,
  bestRoundScore,
}) {
  const now = new Date().toISOString();
  const delta = {
    ...getDefaultModeStats(),
    roundsPlayed,
    correctGuesses,
    incorrectGuesses: Math.max(roundsPlayed - correctGuesses, 0),
    allTimeCorrect: correctGuesses,
    points,
    totalHintsUsed: hintsUsed,
    totalTimeMs,
    bestRoundScore,
    bestRunScore: points,
    currentStreak: null,
    bestStreak: 0,
    runsPlayed: 1,
    completedRuns: 1,
    perfectRuns: correctGuesses === roundsPlayed ? 1 : 0,
    totalRoundsScheduled: roundsPlayed,
    lastPlayedAt: now,
    score: correctGuesses,
  };

  return recordStatsDelta(modeKey, gameType, setupValue, delta);
}

// Retrieves the stats for a specific bucket based on the provided game type. 
function getBucketStats(bucket, gameType) {
  if (!bucket) return withComputedStats(getDefaultModeStats());
  if (!gameType || gameType === 'all') return withComputedStats(bucket.overall || getDefaultModeStats());
  return withComputedStats(bucket.categories?.[gameType] || getDefaultModeStats());
}

// Retrieves the stats for a given mode key, game type, and setup value. If modeKey is 'all', it aggregates stats across all modes.
export function getModeStats(modeKey, { gameType = 'all', setupValue = 'all' } = {}) {
  const store = getStatsStore();
  const normalizedSetupValue = setupValue || 'all';

  if (modeKey === 'all') {
    const aggregate = Object.values(store.modes).reduce((combined, modeBucket) => {
      const bucket = normalizedSetupValue === 'all' ? modeBucket : modeBucket.setups?.[normalizedSetupValue];
      return mergeStats(combined, getBucketStats(bucket, gameType));
    }, getDefaultModeStats());
    return withComputedStats(aggregate);
  }

  const modeMeta = WTP_MODES.find((mode) => mode.key === modeKey) || null;
  const modeBucket = store.modes[modeKey] || createModeBucket();

  if (modeMeta?.setup && normalizedSetupValue === 'all') {
    const setupBuckets = Object.values(modeBucket.setups || {});
    return withComputedStats(aggregateBuckets(setupBuckets, gameType));
  }

  const selectedBucket = normalizedSetupValue !== 'all'
    ? modeBucket.setups?.[normalizedSetupValue]
    : modeBucket;

  return getBucketStats(selectedBucket, gameType);
}

// Retrieves a snapshot of the entire stats store with computed fields for all modes, game types, and setups. 
// This is useful for displaying comprehensive stats in a UI without needing to compute them on the fly.
export function getWtpStatsSnapshot() {
  const store = getStatsStore();
  return WTP_MODES.reduce((snapshot, mode) => {
    snapshot[mode.key] = {
      overall: withComputedStats(store.modes[mode.key]?.overall || getDefaultModeStats()),
      categories: Object.fromEntries(
        WTP_GAME_TYPES.map((type) => [type.key, withComputedStats(store.modes[mode.key]?.categories?.[type.key] || getDefaultModeStats())]),
      ),
      setups: Object.fromEntries(
        Object.entries(store.modes[mode.key]?.setups || {}).map(([setupValue, bucket]) => [
          setupValue,
          {
            overall: withComputedStats(bucket.overall || getDefaultModeStats()),
            categories: Object.fromEntries(
              WTP_GAME_TYPES.map((type) => [type.key, withComputedStats(bucket.categories?.[type.key] || getDefaultModeStats())]),
            ),
          },
        ]),
      ),
    };
    return snapshot;
  }, {});
}
 // Retrieves the player's progress for the daily challenge, including whether they've completed it, their guess, and the timestamp of completion.
export function getDailyProgress() {
  const progress = readJson(dailyKey(), {
    date: null,
    completed: false,
    pokemonName: null,
    isCorrect: null,
    guess: '',
    completedAt: null,
  });

  // Legacy entries saved before timestamp-based daily tracking are unreliable
  // around timezone boundaries, so treat them as incomplete.
  if (progress.completed && !progress.completedAt) {
    return {
      ...progress,
      completed: false,
    };
  }

  return progress;
}

export function setDailyProgress(progress) {
  writeJson(dailyKey(), progress);
}
