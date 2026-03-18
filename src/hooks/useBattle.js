/*
 * useBattle.js React hook that drives the battle state machine.
 * computeTurn() returns an AnimStep array that BattlePage plays frame by frame.
 * Fully side-agnostic: supports 1P-vs-AI 
 */

import { useState, useRef, useCallback } from 'react';
import {
  buildBattler,
  executeMove,
  sideAGoesFirst,
  aiChooseMove,
  applyStatusTick,
  applyVolatileTick,
  checkCanMove,
} from '../utils/battleEngine.js';
import { MOVE_EFFECTS } from '../utils/moveEffects.js';

export const BATTLE_STATE = {
  SELECTING:   'selecting',
  ANIMATING:   'animating',
  NEED_SWITCH: 'need_switch',
  GAME_OVER:   'gameover',
};

export const CONTROLLER = { HUMAN: 'human', AI: 'ai' };

export function useBattle() {
  // stateRef holds mutable battle state (mutated in place, never directly rendered)
  const stateRef = useRef({
    teams:        [[], []],         // teams[0] = side0, teams[1] = side1
    activeIdx:    [0, 0],           // active pokemon index per side
    controllers:  [CONTROLLER.HUMAN, CONTROLLER.AI],
    turn:         1,
    weather:      'none',
    log:          [],
  });

  const mdc       = useRef({});   // moveDataMap
  const [snap,    setSnap]    = useState(null);
  const [phase,   setPhase]   = useState('idle');
  const [winner,  setWinner]  = useState(null);

  const setMoveDataMap = useCallback(map => { mdc.current = map; }, []);

  // Deep clone a battler for snapshot (avoids sharing refs)
  const cloneBattler = b => b ? { ...b, stages: { ...b.stages }, pp: { ...b.pp } } : null;

  const takeSnap = useCallback(() => {
    const s = stateRef.current;
    setSnap({
      teams:       s.teams.map(team => team.map(cloneBattler)),
      activeIdx:   [...s.activeIdx],
      controllers: [...s.controllers],
      turn:        s.turn,
      log:         [...s.log],
    });
  }, []);

    /**
   * initBattle(sideConfigs, allPokeData)
   *
   * sideConfigs: Array of 2 side configs:
   *   { team: [{ name, moves, item }], controllerType: 'human'|'ai', label: string }
   * allPokeData: { [pokemonName]: fetchedData }
   *
   * This signature is fully generic no hardcoded player/ai distinction.
   * For 1P vs AI: sideConfigs[0].controllerType = 'human', sideConfigs[1].controllerType = 'ai'
   * For 2P:       both controllerType = 'human'
   */
  // Sets up both teams, intro log, and initial battle state.
const initBattle = useCallback((sideConfigs, allPokeData, moveDataMap = {}) => {
    const teams = sideConfigs.map(cfg =>
      cfg.team.map(p => {
        const battler = buildBattler(p, allPokeData[p.name]);
        // Apply real PP values from API data
        (p.moves || []).forEach(m => {
          battler.pp[m] = moveDataMap[m]?.pp ?? battler.pp[m] ?? 10;
        });
        return battler;
      })
    );

    const introLog = ['A wild battle begins!'];
    sideConfigs.forEach((cfg, i) => {
      const label = cfg.label ?? (i === 0 ? 'You' : 'Opponent');
      introLog.push(`${label} sent out ${teams[i][0]?.name}!`);
    });

    stateRef.current = {
      teams,
      activeIdx:   [0, 0],
      controllers: sideConfigs.map(c => c.controllerType ?? CONTROLLER.HUMAN),
      turn:        1,
      weather:     'none',
      log:         introLog,
    };

    setWinner(null);
    setPhase(BATTLE_STATE.SELECTING);
    takeSnap();
  }, [takeSnap]);

    /**
   * computeTurn(moveNames, isSwitchTurn)
   *
   * moveNames: array of 2 move name strings (one per side).
   *   For AI sides, pass null the AI will choose automatically.
   *   For legacy 1P usage you can also pass a single string for side 0.
   * isSwitchTurn: if true, side 0 just switched, only side 1 attacks.
   */
  // Resolves one full turn and returns the animation step list.
const computeTurn = useCallback((moveNamesInput, isSwitchTurn = false) => {
    const s = stateRef.current;

    // Normalise input: accept legacy single string (side 0 move) or array[2]
    const moveNames = Array.isArray(moveNamesInput)
      ? moveNamesInput
      : [moveNamesInput, null];

    const steps  = [];
    const addLog = text => { s.log.push(text); steps.push({ type: 'MSG', text }); };

    addLog(`--- Turn ${s.turn} ---`);

    // Clear single turn volatile flags
    s.teams.forEach((team, si) => {
      const poke = team[s.activeIdx[si]];
      if (poke?.volatile?.protect)          delete poke.volatile.protect;
      if (poke?.volatile?.endure)           delete poke.volatile.endure;
      if (poke?.volatile?.destinyBond)      delete poke.volatile.destinyBond;
      if (poke?.volatile?.damagedThisTurn)  delete poke.volatile.damagedThisTurn;
      if (poke?.volatile?.lastDamageTaken)  delete poke.volatile.lastDamageTaken;
    });

    // Resolve each side's move
    const resolvedMoves = s.teams.map((team, si) => {
      const poke = team[s.activeIdx[si]];
      // If this Pokémon is locked into a charge move, force it regardless of controller
      if (poke?.volatile?.lockedMove) return poke.volatile.lockedMove;
      if (s.controllers[si] === CONTROLLER.AI || moveNames[si] == null) {
        const opponent = s.teams[si ^ 1][s.activeIdx[si ^ 1]];
        return aiChooseMove(poke, opponent, mdc.current);
      }
      return moveNames[si];
    });

    const activePoke = si => s.teams[si][s.activeIdx[si]];
    const moveMd     = si => mdc.current[resolvedMoves[si]] ?? null;

    const firstSide = isSwitchTurn
      ? 1   // side 0 just switched → side 1 goes first
      : (sideAGoesFirst(activePoke(0), activePoke(1), moveMd(0), moveMd(1)) ? 0 : 1);

    // Collect deferred force-switch results so the second Pokémon's move can
    // always be shown in the log before any switch-out screen appears.
    const pendingForceSwitches = [];

    // Run one side's move and push animation steps
    const runMove = (si) => {
      const attackerSide = si;
      const defenderSide = si ^ 1;
      const attacker = activePoke(attackerSide);
      const defender = activePoke(defenderSide);
      const moveName = resolvedMoves[attackerSide];

      if (!attacker || !defender) return;
      if (attacker.fainted || defender.fainted) return;

      const { canMove, logs: statusLogs } = checkCanMove(attacker);
      statusLogs.forEach(t => { s.log.push(t); steps.push({ type: 'MSG', text: t }); });
      if (!canMove) return;

      steps.push({ type: 'LUNGE', side: attackerSide });

      const defHpBefore = defender.hp;
      const atkHpBefore = attacker.hp;
      if (!attacker.volatile) attacker.volatile = {};
      attacker.volatile.lastMove = moveName;

      // Build team move pool for Assist
      const teamMoves = s.teams[attackerSide]
        .filter((p, i) => i !== s.activeIdx[attackerSide])
        .flatMap(p => p.moves || []);

      const result = executeMove(attacker, defender, moveName, mdc.current, s.weather, MOVE_EFFECTS, {
        setWeather: (w) => { s.weather = w; },
        teamMoves,
        defenderChosenMove: resolvedMoves[defenderSide],
      });

      result.logs.forEach(text => {
        s.log.push(text);
        steps.push({ type: 'MSG', text });
      });

      if (defender.hp < defHpBefore) {
        if (defender.fainted) {
          steps.push({ type: 'HIT',   side: defenderSide, hpAfter: 0,           maxHp: defender.maxHp });
          steps.push({ type: 'FAINT', side: defenderSide });
        } else {
          steps.push({ type: 'HIT', side: defenderSide, hpAfter: defender.hp, maxHp: defender.maxHp });
        }
      } else if (defender.hp === 0 && defender.fainted) {
        steps.push({ type: 'FAINT', side: defenderSide });
      }

      if (attacker.hp < atkHpBefore) {
        if (attacker.fainted) {
          steps.push({ type: 'HIT',   side: attackerSide, hpAfter: 0,           maxHp: attacker.maxHp });
          steps.push({ type: 'FAINT', side: attackerSide });
        } else {
          steps.push({ type: 'HIT', side: attackerSide, hpAfter: attacker.hp, maxHp: attacker.maxHp });
        }
      }

      // Store forceSwitch on result so the caller can inspect it
      // Do NOT switch if: attacker fainted, defender fainted (battle ended), or only 1 healthy poke left
      const hasReplacement = s.teams[attackerSide].some((p, i) => i !== s.activeIdx[attackerSide] && !p.fainted);
      if (result.forceSwitch && !attacker.fainted && !defender.fainted && hasReplacement) {
        pendingForceSwitches.push({ result, attackerSide, defenderSide, attacker, defender });
      }
    };

    // Helper: emit the switch steps for a pending force-switch entry
    // Returns list of sides that are AI and did a self-switch while going first
    // (so we can run the second mover's attack against the new poke afterward).
    const resolveForceSwitches = () => {
      const aiSelfSwitchFirstSides = [];
      pendingForceSwitches.forEach((entry) => {
        const { result, attackerSide, defenderSide, attacker, defender } = entry;
        const switchSide = result.forceSwitch === 'attacker' ? attackerSide : defenderSide;
        const switchTeam = s.teams[switchSide];
        const nextIdx = switchTeam.findIndex((p, i) => i !== s.activeIdx[switchSide] && !p.fainted);
        if (nextIdx !== -1) {
          if (s.controllers[switchSide] === CONTROLLER.AI) {
            s.activeIdx[switchSide] = nextIdx;
            const next = switchTeam[nextIdx];
            const msg = result.forceSwitch === 'defender'
              ? `${defender.name} was replaced by ${next.name}!`
              : `${attacker.name} was replaced by ${next.name}!`;
            s.log.push(msg);
            steps.push({ type: 'MSG', text: msg });
            steps.push({ type: 'AI_SWITCH_IN', side: switchSide, sprite: next.sprite, name: next.name });
            // If AI switched themselves while going first, note it so the human's move runs after
            if (result.forceSwitch === 'attacker' && attackerSide === firstSide) {
              aiSelfSwitchFirstSides.push(attackerSide);
            }
          } else {
            steps.push({ type: 'FORCED_SWITCH', side: switchSide, opponentMoveName: entry.opponentMoveName ?? null });
          }
        }
      });
      pendingForceSwitches.length = 0;
      return aiSelfSwitchFirstSides;
    };

    const secondSide = firstSide ^ 1;
    if (isSwitchTurn) {
      runMove(1);
    } else {
      runMove(firstSide);
      // If the first mover force-switched THEMSELVES (Parting Shot, U-Turn),
      // they leave the field immediately the opponent does NOT get to move.
      // If the force-switch is on the DEFENDER (Roar, Whirlwind), still run
      // the second side's move before resolving.
      const selfSwitchEntry = pendingForceSwitches.find(
        p => p.result.forceSwitch === 'attacker' && p.attackerSide === firstSide
      );
      if (!selfSwitchEntry && !activePoke(secondSide)?.fainted) {
        // Normal case: no self-switch from first mover, run second side as usual
        runMove(secondSide);
      } else if (selfSwitchEntry) {
        // First mover switched themselves store the opponent's pending move name
        // so it can be executed after the human picks their switch-in.
        selfSwitchEntry.opponentMoveName = resolvedMoves[secondSide];
      }
    }

    // Resolve all pending force-switches now that both moves (or just first) have run
    const aiSelfSwitchFirstSides = resolveForceSwitches();
    // If the AI went first and switched itself, run the human's pending move against the new Pokémon
    if (aiSelfSwitchFirstSides.length > 0) {
      const humanSide = secondSide;
      if (!activePoke(humanSide)?.fainted && !activePoke(firstSide)?.fainted) {
        runMove(humanSide);
      }
    }

    // End-of-turn status ticks
    s.teams.forEach((team, si) => {
      const poke = team[s.activeIdx[si]];
      if (!poke || poke.fainted || poke.status === 'none') return;
      const hpBefore = poke.hp;
      const { logs, hpAfter, fainted } = applyStatusTick(poke);
      if (!logs.length) return;
      logs.forEach(t => { s.log.push(t); steps.push({ type: 'MSG', text: t }); });
      if (hpBefore !== hpAfter) {
        steps.push({ type: 'STATUS_HIT', side: si, hpAfter, maxHp: poke.maxHp });
        if (fainted) steps.push({ type: 'FAINT', side: si });
      }
    });

    // Volatile per-turn effects
    s.teams.forEach((team, si) => {
      const poke     = team[s.activeIdx[si]];
      const opponent = s.teams[si ^ 1][s.activeIdx[si ^ 1]];
      if (!poke || poke.fainted) return;
      const { logs } = applyVolatileTick(poke, opponent);
      if (!logs.length) return;
      logs.forEach(t => { s.log.push(t); steps.push({ type: 'MSG', text: t }); });
      if (poke.fainted) steps.push({ type: 'FAINT', side: si });
    });

    s.turn++;

    // Auto-advance AI sides only human sides get the faint-switch popup instead
    s.teams.forEach((team, si) => {
      if (s.controllers[si] === CONTROLLER.HUMAN) return;
      if (team[s.activeIdx[si]]?.fainted) {
        const nextIdx = team.findIndex((p, i) => i !== s.activeIdx[si] && !p.fainted);
        if (nextIdx !== -1) {
          s.activeIdx[si] = nextIdx;
          const next = team[nextIdx];
          const msg = `Opponent sent out ${next.name}!`;
          s.log.push(msg);
          steps.push({ type: 'MSG', text: msg });
          steps.push({ type: 'AI_SWITCH_IN', side: si, sprite: next.sprite, name: next.name });
        }
      }
    });

    steps.push({ type: 'DONE' });

    const allFainted = s.teams.map(team => team.every(p => p.fainted));
    return { steps, allFainted };
  }, []);

    // side defaults to 0 (the human player's side)
  const computeSwitch = useCallback((newIdx, side = 0) => {
    const s        = stateRef.current;
    const outgoing = s.teams[side][s.activeIdx[side]];
    const incoming = s.teams[side][newIdx];
    const steps    = [];

    if (outgoing) outgoing.stages = { atk: 0, def: 0, spatk: 0, spdef: 0, spd: 0 };
    if (incoming) incoming.stages = { atk: 0, def: 0, spatk: 0, spdef: 0, spd: 0 };
    if (outgoing?.status === 'tox') outgoing.toxicCounter = 1;
    // Clear charge move lock on switch out
    if (outgoing?.volatile) {
      delete outgoing.volatile.lockedMove;
      delete outgoing.volatile.invulnerable;
    }

    // Leech Seed ends when the seeder switches out clear it from the opponent
    const opponent = s.teams[side ^ 1][s.activeIdx[side ^ 1]];
    if (opponent?.volatile?.leechSeed) delete opponent.volatile.leechSeed;

    steps.push({ type: 'SWITCH_OUT', side });

    s.activeIdx[side] = newIdx;
    const label = s.controllers[side] === CONTROLLER.HUMAN ? 'You' : 'Opponent';
    const msg = `${label} sent out ${incoming.name}!`;
    s.log.push(msg);
    steps.push({ type: 'MSG', text: msg });
    steps.push({ type: 'SWITCH_IN', side, sprite: incoming.sprite, spriteBack: incoming.spriteBack, name: incoming.name });

    return steps;
  }, []);

    // Called after a human switch-in triggered by a switch move (U-Turn, etc.).
  // Runs the opponent's queued move against the newly switched-in Pokémon.
  const computeOpponentFollowUp = useCallback((opponentMoveName) => {
    const s = stateRef.current;
    const steps = [];
    const opponentSide = 1; // AI is always side 1
    const playerSide   = 0;
    const attacker = s.teams[opponentSide][s.activeIdx[opponentSide]];
    const defender  = s.teams[playerSide][s.activeIdx[playerSide]];

    if (!attacker || !defender || attacker.fainted || defender.fainted) {
      return steps;
    }

    const { canMove, logs: statusLogs } = checkCanMove(attacker);
    statusLogs.forEach(t => { s.log.push(t); steps.push({ type: 'MSG', text: t }); });
    if (!canMove) return steps;

    steps.push({ type: 'LUNGE', side: opponentSide });

    const defHpBefore = defender.hp;
    const atkHpBefore = attacker.hp;
    if (!attacker.volatile) attacker.volatile = {};
    attacker.volatile.lastMove = opponentMoveName;

    const result = executeMove(attacker, defender, opponentMoveName, mdc.current, s.weather, MOVE_EFFECTS, {
      setWeather: (w) => { s.weather = w; },
      defenderChosenMove: null, // player switched in no move chosen this sub-turn
    });

    result.logs.forEach(text => { s.log.push(text); steps.push({ type: 'MSG', text }); });

    if (defender.hp < defHpBefore) {
      if (defender.fainted) {
        steps.push({ type: 'HIT',   side: playerSide, hpAfter: 0,            maxHp: defender.maxHp });
        steps.push({ type: 'FAINT', side: playerSide });
      } else {
        steps.push({ type: 'HIT',   side: playerSide, hpAfter: defender.hp,  maxHp: defender.maxHp });
      }
    }
    if (attacker.hp < atkHpBefore) {
      if (attacker.fainted) {
        steps.push({ type: 'HIT',   side: opponentSide, hpAfter: 0,            maxHp: attacker.maxHp });
        steps.push({ type: 'FAINT', side: opponentSide });
      } else {
        steps.push({ type: 'HIT',   side: opponentSide, hpAfter: attacker.hp,  maxHp: attacker.maxHp });
      }
    }

    return steps;
  }, []);

  // Synchronous snapshot
  // Returns a deep-cloned snapshot of current battle state for rendering.
const getSnap = useCallback(() => {
    const s = stateRef.current;
    return {
      teams:       s.teams.map(team => team.map(cloneBattler)),
      activeIdx:   [...s.activeIdx],
      controllers: [...s.controllers],
      turn:        s.turn,
      log:         [...s.log],
    };
  }, []);

  return {
    phase, winner, snap,
    setMoveDataMap, initBattle, computeOpponentFollowUp,
    computeTurn, computeSwitch,
    setPhase, takeSnap, getSnap,
    applyWinner: (w) => { setWinner(w); setPhase(BATTLE_STATE.GAME_OVER); },
  };
}
