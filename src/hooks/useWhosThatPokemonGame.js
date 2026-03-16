import { useEffect, useMemo, useRef, useState } from 'react';

import { getGameTypeByKey, WTP_MODE_MAP } from '../data/wtpModes.js';
import { getModePokemonName, getPokemonRoundData, normalizePokemonGuess } from '../utils/wtpApi.js';
import {
  getDailyProgress,
  getModeStats,
  recordChallengeRun,
  recordFreeplayRound,
  setDailyProgress,
} from '../utils/wtpStorage.js';

const DAILY_TIMEZONE = 'America/Los_Angeles';
const DAILY_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: DAILY_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const DAILY_OVERRIDE_KEY = 'pokiportal:wtp:daily-date-override';

function buildHintSequence(round) {
  const hints = [
    {
      key: 'generation',
      label: 'Generation',
      value: round.generationLabel,
    },
    {
      key: 'types',
      label: 'Type',
      value: round.types.map((type) => type[0].toUpperCase() + type.slice(1)).join(' / '),
    },
    {
      key: 'size',
      label: 'Size',
      value: `${(round.height / 10).toFixed(1)} m tall, ${(round.weight / 10).toFixed(1)} kg`,
    },
    round.abilities.length
      ? {
          key: 'ability',
          label: 'Ability',
          value: round.abilities[0],
        }
      : null,
    {
      key: 'letter',
      label: 'First Letter',
      value: round.displayName.charAt(0),
    },
  ];

  if (round.flavorText) {
    hints.splice(3, 0, {
      key: 'flavor',
      label: 'Dex Entry',
      value: round.flavorText,
    });
  }

  return hints.filter(Boolean);
}

function getTodayKey() {
  return getTodayKeyForDate(new Date());
}

function getStoredDailyOverride() {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(DAILY_OVERRIDE_KEY);
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : null;
}

function getMsUntilNextLocalDay() {
  const now = new Date();
  const currentKey = getTodayKey();
  const probe = new Date(now.getTime());

  do {
    probe.setMinutes(probe.getMinutes() + 1);
  } while (getTodayKeyForDate(probe) === currentKey);

  return Math.max(probe.getTime() - now.getTime(), 1000);
}

function getTodayKeyForDate(date) {
  const parts = DAILY_DATE_FORMATTER.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value || '0000';
  const month = parts.find((part) => part.type === 'month')?.value || '00';
  const day = parts.find((part) => part.type === 'day')?.value || '00';
  return `${year}-${month}-${day}`;
}

function getDailyProgressKey(progress) {
  if (progress?.date) {
    return progress.date;
  }
  if (progress?.completedAt) {
    return getTodayKeyForDate(new Date(progress.completedAt));
  }
  return null;
}

function createSessionState(gameTypeKey) {
  const gameType = getGameTypeByKey(gameTypeKey || 'freeplay');
  return {
    gameTypeKey: gameType.key,
    roundLimit: gameType.roundLimit,
    currentRoundNumber: 1,
    roundsCompleted: 0,
    usedPokemon: [],
    totalScore: 0,
    bestRoundScore: 0,
    correctGuesses: 0,
    totalHintsUsed: 0,
    totalTimeMs: 0,
    runComplete: false,
    lastRoundMetrics: null,
  };
}

function calculateRoundScore({ isCorrect, timeMs, hintsUsed, roundNumber }) {
  if (!isCorrect) {
    return {
      total: 0,
      speedBonus: 0,
      hintPenalty: 0,
      roundBonus: 0,
    };
  }

  const seconds = timeMs / 1000;
  const speedBonus = Math.max(0, Math.round(60 - seconds));
  const hintPenalty = hintsUsed * 12;
  const roundBonus = Math.max(0, 8 - roundNumber) * 2;
  const total = Math.max(40, 100 + speedBonus + roundBonus - hintPenalty);

  return {
    total,
    speedBonus,
    hintPenalty,
    roundBonus,
  };
}

function getEmptyRoundState() {
  return {
    guess: '',
    result: null,
    revealedHints: 0,
    round: null,
    error: '',
  };
}

export function useWhosThatPokemonGame(modeKey, config) {
  const [round, setRound] = useState(null);
  const [guess, setGuess] = useState('');
  const [revealedHints, setRevealedHints] = useState(0);
  const [roundState, setRoundState] = useState('idle');
  const [result, setResult] = useState(null);
  const [runSummary, setRunSummary] = useState(null);
  const [error, setError] = useState('');
  const [roundNonce, setRoundNonce] = useState(0);
  const [session, setSession] = useState(() => createSessionState(config?.gameType));
  const [dailyOverrideDate, setDailyOverrideDate] = useState(() => getStoredDailyOverride());
  const [realDailyDate, setRealDailyDate] = useState(() => getTodayKey());
  const roundStartRef = useRef(0);
  const usedPokemonRef = useRef(session.usedPokemon);
  const submitLockRef = useRef(false);

  const mode = WTP_MODE_MAP[modeKey] || WTP_MODE_MAP.classic;
  const dailyDate = dailyOverrideDate || realDailyDate;
  const gameType = getGameTypeByKey(config?.gameType || 'freeplay');
  const setupReady = !!config?.gameType && (!mode.setup || !!config?.setup?.value);
  const setupValue = config?.setup?.value || null;
  const stats = getModeStats(mode.key, { gameType: gameType.key, setupValue: setupValue || 'all' });
  const dailyProgress = getDailyProgress();
  const dailyLocked = mode.key === 'daily' && getDailyProgressKey(dailyProgress) === dailyDate && dailyProgress.completed;

  useEffect(() => {
    usedPokemonRef.current = session.usedPokemon;
  }, [session.usedPokemon]);

  useEffect(() => {
    if (dailyOverrideDate) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setRealDailyDate(getTodayKey());
    }, getMsUntilNextLocalDay());

    return () => window.clearTimeout(timeoutId);
  }, [realDailyDate, dailyOverrideDate]);

  function setDailyTestDate(nextDate) {
    if (typeof window === 'undefined') return;

    if (nextDate) {
      window.localStorage.setItem(DAILY_OVERRIDE_KEY, nextDate);
      setDailyOverrideDate(nextDate);
      return;
    }

    window.localStorage.removeItem(DAILY_OVERRIDE_KEY);
    setDailyOverrideDate(null);
    setRealDailyDate(getTodayKey());
  }

  useEffect(() => {
    if (!setupReady) return undefined;

    const frame = window.requestAnimationFrame(() => {
      (async () => {
        try {
          submitLockRef.current = false;
          const pokemonName = await getModePokemonName(
            mode.key,
            config?.setup,
            dailyDate,
            usedPokemonRef.current,
          );
          const nextRound = await getPokemonRoundData(pokemonName);
          setRound(nextRound);

          if (dailyLocked && nextRound.speciesName === dailyProgress.pokemonName) {
            setGuess(dailyProgress.guess || '');
        setResult({
          isCorrect: !!dailyProgress.isCorrect,
          guess: dailyProgress.guess || '',
          metrics: null,
        });
        setRunSummary(null);
        setRevealedHints(mode.allowsHints ? buildHintSequence(nextRound).length : 0);
        setRoundState('resolved');
        return;
          }

          roundStartRef.current = performance.now();
          setRoundState('playing');
        } catch (loadError) {
          setError(loadError.message || 'Unable to load a Pokemon right now.');
          setRoundState('error');
        }
      })();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    config,
    dailyDate,
    dailyLocked,
    dailyProgress.guess,
    dailyProgress.isCorrect,
    dailyProgress.pokemonName,
    mode.allowsHints,
    mode.key,
    roundNonce,
    setupReady,
  ]);

  const hints = useMemo(() => {
    if (!round || !mode.allowsHints) return [];
    return buildHintSequence(round);
  }, [mode.allowsHints, round]);

  function submitGuess() {
    if (!round || roundState !== 'playing' || submitLockRef.current) return;
    submitLockRef.current = true;

    const normalizedGuess = normalizePokemonGuess(guess);
    const isCorrect = round.guessAliases.includes(normalizedGuess);
    const timeMs = Math.max(0, Math.round(performance.now() - roundStartRef.current));
    const hintsUsed = revealedHints;
    const scoreBreakdown = calculateRoundScore({
      isCorrect,
      timeMs,
      hintsUsed,
      roundNumber: session.currentRoundNumber,
    });

    if (mode.key === 'daily') {
      setDailyProgress({
        date: dailyDate,
        completed: true,
        pokemonName: round.speciesName,
        isCorrect,
        guess,
        completedAt: new Date().toISOString(),
      });
    }

    if (gameType.roundLimit === null) {
      const nextStats = recordFreeplayRound({
        modeKey: mode.key,
        setupValue,
        isCorrect,
        hintsUsed,
        timeMs,
      });

      setResult({
        isCorrect,
        guess,
        metrics: {
          timeMs,
          hintsUsed,
          roundScore: scoreBreakdown.total,
          ...scoreBreakdown,
        },
        stats: nextStats,
      });
      setRunSummary(null);
      setSession((current) => ({
        ...current,
        roundsCompleted: current.roundsCompleted + 1,
        lastRoundMetrics: {
          timeMs,
          hintsUsed,
          roundScore: scoreBreakdown.total,
        },
      }));
    } else {
      const nextRoundsCompleted = session.roundsCompleted + 1;
      const nextSession = {
        ...session,
        roundsCompleted: nextRoundsCompleted,
        currentRoundNumber: Math.min(nextRoundsCompleted + 1, session.roundLimit),
        correctGuesses: session.correctGuesses + (isCorrect ? 1 : 0),
        totalScore: session.totalScore + scoreBreakdown.total,
        bestRoundScore: Math.max(session.bestRoundScore, scoreBreakdown.total),
        totalHintsUsed: session.totalHintsUsed + hintsUsed,
        totalTimeMs: session.totalTimeMs + timeMs,
        usedPokemon: round?.speciesName
          ? [...session.usedPokemon, round.speciesName]
          : session.usedPokemon,
        runComplete: nextRoundsCompleted >= session.roundLimit,
        lastRoundMetrics: {
          timeMs,
          hintsUsed,
          roundScore: scoreBreakdown.total,
        },
      };

      const previousRunStats = nextSession.runComplete
        ? getModeStats(mode.key, { gameType: gameType.key, setupValue })
        : null;
      const completedRunStats = nextSession.runComplete
        ? recordChallengeRun({
            modeKey: mode.key,
            gameType: gameType.key,
            setupValue,
            roundsPlayed: nextSession.roundLimit,
            correctGuesses: nextSession.correctGuesses,
            hintsUsed: nextSession.totalHintsUsed,
            totalTimeMs: nextSession.totalTimeMs,
            points: nextSession.totalScore,
            bestRoundScore: nextSession.bestRoundScore,
          })
        : null;

      setSession(nextSession);
      setRunSummary(nextSession.runComplete ? {
        roundsPlayed: nextSession.roundLimit,
        correctGuesses: nextSession.correctGuesses,
        incorrectGuesses: nextSession.roundLimit - nextSession.correctGuesses,
        totalScore: nextSession.totalScore,
        averageTimeSeconds: Number((nextSession.totalTimeMs / nextSession.roundLimit / 1000).toFixed(1)),
        averageHintsUsed: Number((nextSession.totalHintsUsed / nextSession.roundLimit).toFixed(2)),
        perfectRun: nextSession.correctGuesses === nextSession.roundLimit,
        isNewBestRun: nextSession.totalScore > (previousRunStats?.bestRunScore || 0),
        isNewBestRound: nextSession.bestRoundScore > (previousRunStats?.bestRoundScore || 0),
        previousBestRunScore: previousRunStats?.bestRunScore || 0,
      } : null);

      setResult({
        isCorrect,
        guess,
        metrics: {
          timeMs,
          hintsUsed,
          roundScore: scoreBreakdown.total,
          ...scoreBreakdown,
        },
        stats: completedRunStats,
      });
    }

    setRevealedHints(hints.length);
    setRoundState('resolved');
  }

  function revealNextHint() {
    if (!mode.allowsHints || roundState !== 'playing') return;
    setRevealedHints((current) => Math.min(current + 1, hints.length));
  }

  function advanceRound() {
    submitLockRef.current = false;
    const nextState = getEmptyRoundState();
    setGuess(nextState.guess);
    setResult(nextState.result);
    setRevealedHints(nextState.revealedHints);
    setRound(nextState.round);
    setError(nextState.error);
    setRoundState('loading');
    setRoundNonce((value) => value + 1);
  }

  function restartSession() {
    submitLockRef.current = false;
    const nextState = getEmptyRoundState();
    setRunSummary(null);
    setGuess(nextState.guess);
    setResult(nextState.result);
    setRevealedHints(nextState.revealedHints);
    setRound(nextState.round);
    setError(nextState.error);
    setRoundState('loading');
    setSession(createSessionState(gameType.key));
    setRoundNonce((value) => value + 1);
  }

  const canSubmit = roundState === 'playing' && guess.trim().length > 0;
  const hintList = hints.slice(0, revealedHints);
  const isRunMode = gameType.roundLimit !== null;
  const canAdvanceRound = isRunMode && roundState === 'resolved' && !session.runComplete;
  const liveStats = result?.stats || stats;

  return {
    advanceRound,
    canAdvanceRound,
    canSubmit,
    dailyLocked,
    dailyDate,
    dailyOverrideDate,
    error,
    gameType,
    guess,
    hintList,
    mode,
    result,
    restartSession,
    round,
    roundState,
    runSummary,
    session,
    setDailyTestDate,
    setGuess,
    revealNextHint,
    remainingHints: Math.max(hints.length - revealedHints, 0),
    setupReady,
    stats: liveStats,
    submitGuess,
  };
}
