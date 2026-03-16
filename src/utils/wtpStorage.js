const STORAGE_PREFIX = 'pokiportal:wtp';

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

function statsKey(modeKey) {
  return `${STORAGE_PREFIX}:stats:${modeKey}`;
}

function dailyKey() {
  return `${STORAGE_PREFIX}:daily-progress`;
}

export function getDefaultModeStats() {
  return {
    gamesPlayed: 0,
    correct: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
  };
}

export function getModeStats(modeKey) {
  return {
    ...getDefaultModeStats(),
    ...readJson(statsKey(modeKey), {}),
  };
}

export function recordModeResult(modeKey, isCorrect) {
  const current = getModeStats(modeKey);
  const next = {
    gamesPlayed: current.gamesPlayed + 1,
    correct: current.correct + (isCorrect ? 1 : 0),
    score: current.score + (isCorrect ? 1 : 0),
    streak: isCorrect ? current.streak + 1 : 0,
    bestStreak: isCorrect ? Math.max(current.bestStreak, current.streak + 1) : current.bestStreak,
  };

  writeJson(statsKey(modeKey), next);
  return next;
}

export function getDailyProgress() {
  return readJson(dailyKey(), {
    date: null,
    completed: false,
    pokemonName: null,
    isCorrect: null,
    guess: '',
  });
}

export function setDailyProgress(progress) {
  writeJson(dailyKey(), progress);
}
