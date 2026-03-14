/*
 * movesFairy.js Registers all FAIRY type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, inflictConfusion, selfHeal, recoilEffect } from './movesHelper.js';

export function registerFairyMoves() {
  MOVE_EFFECTS['baby doll eyes'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'atk', -1, 'foe'),
  };
  MOVE_EFFECTS['charm'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'atk', -2, 'foe'),
  };
  registerMove('dazzling gleam');
  MOVE_EFFECTS['disarming voice'] = {
    operational: true,
    onUse: (ctx) => {
      const inv = ctx.defender.volatile?.invulnerable;
      if (inv) {
        ctx.log.push(`${ctx.defender.name} is unreachable and dodged Disarming Voice!`);
        ctx.absorbed = true;
      }
    },
  };
  registerMove('draining kiss', { drain: 0.75 });
  registerMove('fairy wind');
  MOVE_EFFECTS['flower shield'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      let hit = false;
      [ctx.attacker, ctx.defender].forEach(p => {
        if (p.types?.includes('grass')) {
          statChange({ ...ctx, attacker: p }, 'def', 1, 'self');
          hit = true;
        }
      });
      if (!hit) ctx.log.push('But it had no effect! No Grass-types on the field.');
    },
  };
  MOVE_EFFECTS['geomancy'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      if (!ctx.attacker.volatile.geomancyCharged) {
        ctx.attacker.volatile.geomancyCharged = true;
        ctx.attacker.volatile.lockedMove = 'geomancy';
        ctx.log.push(`${ctx.attacker.name} is absorbing power!`);
        ctx.absorbed = true;
      } else {
        delete ctx.attacker.volatile.geomancyCharged;
        delete ctx.attacker.volatile.lockedMove;
        statChange(ctx, 'spatk', 2, 'self');
        statChange(ctx, 'spdef', 2, 'self');
        statChange(ctx, 'spd',   2, 'self');
      }
    },
  };
  registerMove('light of ruin', { onHit: recoilEffect(0.5) });
  registerMove('moonblast', {
    secondary: { stat: 'spatk', stages: -1, target: 'foe', chance: 30 },
  });
  MOVE_EFFECTS['moonlight'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const ratio = ctx.weather?.type ? 0.5 : 0.25;
      selfHeal(ctx.attacker, ratio, ctx);
    },
  };
  registerMove('play rough', {
    secondary: { stat: 'atk', stages: -1, target: 'foe', chance: 10 },
  });
  MOVE_EFFECTS['sweet kiss'] = {
    operational: true, power: null,
    onUse: (ctx) => inflictConfusion(ctx, ctx.defender),
  };
}
