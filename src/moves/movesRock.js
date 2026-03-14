/*
 * movesRock.js Registers all ROCK type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, recoilEffect } from './movesHelper.js';

export function registerRockMoves() {
  registerMove('ancient power', {
    onHit: (ctx) => {
      if (Math.random() * 100 < 10) {
        statChange(ctx, 'atk',   1, 'self');
        statChange(ctx, 'def',   1, 'self');
        statChange(ctx, 'spatk', 1, 'self');
        statChange(ctx, 'spdef', 1, 'self');
        statChange(ctx, 'spd',   1, 'self');
        ctx.log.push(`${ctx.attacker.name}'s stats all rose!`);
      }
    },
  });
  registerMove('diamond storm', {
    secondary: { stat: 'def', stages: 2, target: 'self', chance: 50 },
  });
  registerMove('head smash', { onHit: recoilEffect(0.5) });
  registerMove('power gem');
  registerMove('rock blast', {
    onUse: (ctx) => {
      const roll = Math.random();
      ctx.hitCount = roll < 0.333 ? 2 : roll < 0.667 ? 3 : roll < 0.833 ? 4 : 5;
    },
  });
  MOVE_EFFECTS['rock polish'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'spd', 2, 'self'),
  };
  registerMove('rock slide', { flinchChance: 30 });
  registerMove('rock throw');
  registerMove('rock tomb', {
    secondary: { stat: 'spd', stages: -1, target: 'foe', chance: 100 },
  });
  registerMove('rock wrecker', {
    onHit: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.recharging = true;
      ctx.log.push(`${ctx.attacker.name} must recharge!`);
    },
  });
  registerMove('rollout', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      const n = ctx.attacker.volatile.rollout || 0;
      ctx.attacker.volatile.rollout = n >= 4 ? 0 : n + 1;
      const power = 30 * Math.pow(2, n);
      ctx.moveData = { ...(ctx.moveData || {}), power };
      ctx.log.push(`Rollout's power is ${power}!`);
    },
  });
  MOVE_EFFECTS['sandstorm'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.weather = { type: 'sandstorm', turns: 5 };
      ctx.log.push('A sandstorm brewed!');
    },
  };
  registerMove('smack down', {
    onHit: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.grounded = true;
      if (ctx.defender.types?.includes('flying')) {
        ctx.log.push(`${ctx.defender.name} was knocked down and is now vulnerable to Ground moves!`);
      }
    },
  });
  MOVE_EFFECTS['stealth rock'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defenderSide) ctx.defenderSide = {};
      ctx.defenderSide.stealthRock = true;
      ctx.log.push('Pointed stones were set up on the opposing side!');
    },
  };
  registerMove('stone edge', { highCrit: true });
  MOVE_EFFECTS['wide guard'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.wideGuard = true;
      ctx.log.push(`${ctx.attacker.name}'s team is protected from spread moves!`);
    },
  };
}
