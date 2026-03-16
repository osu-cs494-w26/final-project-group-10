import { useCallback, useEffect, useMemo, useState } from 'react';

import { WTP_MODE_MAP } from '../data/wtpModes.js';
import { getModePokemonName, getPokemonRoundData, normalizePokemonGuess } from '../utils/wtpApi.js';
import { getDailyProgress, getModeStats, recordModeResult, setDailyProgress } from '../utils/wtpStorage.js';

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
  return new Date().toISOString().slice(0, 10);
}

export function useWhosThatPokemonGame(modeKey, setup) {
  const [round, setRound] = useState(null);
  const [guess, setGuess] = useState('');
  const [revealedHints, setRevealedHints] = useState(0);
  const [roundState, setRoundState] = useState('idle');
  const [result, setResult] = useState(null);
  const [showDexEntry, setShowDexEntry] = useState(false);
  const [error, setError] = useState('');

  const mode = WTP_MODE_MAP[modeKey] || WTP_MODE_MAP.classic;
  const dailyDate = getTodayKey();
  const setupReady = !mode.setup || !!setup?.value;
  const stats = getModeStats(mode.key);
  const dailyProgress = getDailyProgress();
  const dailyLocked = mode.key === 'daily' && dailyProgress.date === dailyDate && dailyProgress.completed;

  const loadRound = useCallback(async () => {
    if (!setupReady) return;

    setRoundState('loading');
    setError('');
    setGuess('');
    setResult(null);
    setShowDexEntry(false);
    setRevealedHints(0);
    setRound(null);

    try {
      const pokemonName = await getModePokemonName(mode.key, setup, dailyDate);
      const nextRound = await getPokemonRoundData(pokemonName);
      setRound(nextRound);

      if (dailyLocked && nextRound.speciesName === dailyProgress.pokemonName) {
        setGuess(dailyProgress.guess || '');
        setResult({
          isCorrect: !!dailyProgress.isCorrect,
          guess: dailyProgress.guess || '',
        });
        setShowDexEntry(true);
        setRevealedHints(mode.allowsHints ? buildHintSequence(nextRound).length : 0);
        setRoundState('resolved');
        return;
      }

      setRoundState('playing');
    } catch (loadError) {
      setError(loadError.message || 'Unable to load a Pokemon right now.');
      setRoundState('error');
    }
  }, [dailyDate, dailyLocked, dailyProgress.guess, dailyProgress.isCorrect, dailyProgress.pokemonName, mode.allowsHints, mode.key, setup, setupReady]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      loadRound();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loadRound]);

  const hints = useMemo(() => {
    if (!round || !mode.allowsHints) return [];
    return buildHintSequence(round);
  }, [mode.allowsHints, round]);

  const submitGuess = useCallback(() => {
    if (!round || roundState !== 'playing') return;

    const normalizedGuess = normalizePokemonGuess(guess);
    const isCorrect = round.guessAliases.includes(normalizedGuess);
    const nextStats = recordModeResult(mode.key, isCorrect);

    if (mode.key === 'daily') {
      setDailyProgress({
        date: dailyDate,
        completed: true,
        pokemonName: round.speciesName,
        isCorrect,
        guess,
      });
    }

    setResult({
      isCorrect,
      guess,
      stats: nextStats,
    });
    setShowDexEntry(true);
    setRevealedHints(hints.length);
    setRoundState('resolved');
  }, [dailyDate, guess, hints.length, mode.key, round, roundState]);

  const revealNextHint = useCallback(() => {
    if (!mode.allowsHints || roundState !== 'playing') return;
    setRevealedHints((current) => Math.min(current + 1, hints.length));
  }, [hints.length, mode.allowsHints, roundState]);

  const canSubmit = roundState === 'playing' && guess.trim().length > 0;
  const hintList = hints.slice(0, revealedHints);

  return {
    canSubmit,
    dailyLocked,
    error,
    guess,
    hintList,
    loadRound,
    mode,
    result,
    round,
    roundState,
    setGuess,
    revealNextHint,
    remainingHints: Math.max(hints.length - revealedHints, 0),
    setupReady,
    showDexEntry,
    setShowDexEntry,
    stats,
    submitGuess,
  };
}
