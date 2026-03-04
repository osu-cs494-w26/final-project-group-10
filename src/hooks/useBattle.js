import { useState, useRef, useCallback } from 'react';

export const BATTLE_STATE = {
  SELECTING: 'selecting',
  GAME_OVER: 'gameover',
};

export function useBattle() {
  const stateRef = useRef({
    playerTeam:   [],
    aiTeam:       [],
    playerActive: 0,
    aiActive:     0,
    turn:         1,
    log:          [],
  });

  const [, forceRender] = useState(0);
  const rerender = () => forceRender(n => n + 1);
  const [battlePhase, setBattlePhase] = useState('idle');
  const [winner,      setWinner]      = useState(null);
  const [needSwitch,  setNeedSwitch]  = useState(false);
  const moveDataCache = useRef({});

  const registerMoveData = useCallback((name, data) => {
    moveDataCache.current[name] = data;
  }, []);

  const pushLog = (msgs) => {
    stateRef.current.log = [...stateRef.current.log, ...msgs];
  };

  const initBattle = useCallback((playerPokeTeam, allPokeData, aiPokeData) => {
    // Build minimal battler objects — no calculations, just structure
    const buildBattler = (pokemon, data) => {
      const statsObj = {};
      (data?.stats || []).forEach(s => { statsObj[s.stat.name] = s.base_stat; });
      return {
        name:       pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1).replace(/-/g, ' '),
        id:         data?.id || 0,
        types:      (data?.types || []).map(t => t.type.name),
        sprite:     data?.sprites?.front_default || null,
        spriteBack: data?.sprites?.back_default  || null,
        maxHp:      statsObj.hp || 45,
        hp:         statsObj.hp || 45,
        atk:        statsObj.attack          || 45,
        def:        statsObj.defense         || 45,
        spatk:      statsObj['special-attack']  || 45,
        spdef:      statsObj['special-defense'] || 45,
        spd:        statsObj.speed           || 45,
        moves:      pokemon.moves || [],
        pp:         Object.fromEntries((pokemon.moves || []).map(m => [m, 10])),
        item:       pokemon.item || null,
        status:     'none',
        stages:     { atk:0, def:0, spatk:0, spdef:0, spd:0 },
        fainted:    false,
      };
    };

    const pTeam = playerPokeTeam.map(p => buildBattler(p, allPokeData[p.name]));
    const aTeam = aiPokeData.map(p    => buildBattler(p, allPokeData[p.name]));

    stateRef.current = {
      playerTeam:   pTeam,
      aiTeam:       aTeam,
      playerActive: 0,
      aiActive:     0,
      turn:         1,
      log: [
        'A wild battle begins!',
        `Go, ${pTeam[0].name}!`,
        `The opponent sent out ${aTeam[0].name}!`,
      ],
    };

    setWinner(null);
    setNeedSwitch(false);
    setBattlePhase(BATTLE_STATE.SELECTING);
    rerender();
  }, []);

  const executeTurn = useCallback((playerMoveName, isSwitchTurn = false) => {
    const s      = stateRef.current;
    const player = s.playerTeam[s.playerActive];
    const ai     = s.aiTeam[s.aiActive];
    const turn   = s.turn;

    const log = [`--- Turn ${turn} ---`];

    if (isSwitchTurn) {
      log.push(`Opponent's ${ai.name} attacks while you switch!`);
    } else {
      log.push(`${player.name} used ${playerMoveName}!`);
      log.push(`Opponent's ${ai.name} attacks back!`);
    }

    stateRef.current.turn = turn + 1;
    pushLog(log);
    rerender();
  }, []);

  const switchPokemon = useCallback((newIdx, isVoluntary = false) => {
    const s    = stateRef.current;
    const name = s.playerTeam[newIdx]?.name || '';
    stateRef.current.playerActive = newIdx;
    pushLog([`You sent out ${name}!`]);
    setNeedSwitch(false);
    setBattlePhase(BATTLE_STATE.SELECTING);
    if (isVoluntary) executeTurn(null, true);
    rerender();
  }, [executeTurn]);

  const s = stateRef.current;
  return {
    battlePhase,
    playerTeam:   s.playerTeam,
    aiTeam:       s.aiTeam,
    playerActive: s.playerActive,
    aiActive:     s.aiActive,
    turn:         s.turn,
    log:          s.log,
    winner,
    needSwitch,
    initBattle,
    executeTurn,
    switchPokemon,
    registerMoveData,
  };
}
