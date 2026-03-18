/*
 * movesWater.js Registers all WATER type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, inflictConfusion, secondaryStatus } from './movesHelper.js';

export function registerWaterMoves() {
  registerMove('aqua jet', {
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} struck first! (Priority +1)`),
  });
  registerMove('aqua tail');
  registerMove('brine', {
    onUse: (ctx) => {
      if (ctx.defender.hp / ctx.defender.maxHp < 0.5) {
        ctx.moveData = { ...(ctx.moveData || {}), power: 130 };
        ctx.log.push('Brine doubled in power against the weakened target!');
      }
    },
  });
  registerMove('bubble', {
    secondary: { stat: 'spd', stages: -1, target: 'foe', chance: 10 },
  });
  registerMove('bubble beam', {
    secondary: { stat: 'spd', stages: -1, target: 'foe', chance: 10 },
  });
  registerMove('crabhammer', { highCrit: true });
  registerMove('dive', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      if (!ctx.attacker.volatile.diveCharging) {
        ctx.attacker.volatile.diveCharging = true;
        ctx.attacker.volatile.invulnerable = 'dive';
        ctx.attacker.volatile.lockedMove   = 'dive';
        ctx.log.push(`${ctx.attacker.name} hid underwater!`);
        ctx.absorbed = true;
      } else {
        delete ctx.attacker.volatile.diveCharging;
        delete ctx.attacker.volatile.invulnerable;
        delete ctx.attacker.volatile.lockedMove;
      }
    },
  });
  registerMove('hydro cannon', {
    onHit: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.recharging = true;
      ctx.log.push(`${ctx.attacker.name} must recharge!`);
    },
  });
  registerMove('hydro pump');
  registerMove('muddy water', {
    secondary: { stat: 'acc', stages: -1, target: 'foe', chance: 30 },
  });
  registerMove('octazooka', {
    secondary: { stat: 'acc', stages: -1, target: 'foe', chance: 50 },
  });
  registerMove('origin pulse', {
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} unleashed a pulse of water at all foes!`),
  });
  registerMove('razor shell', {
    secondary: { stat: 'def', stages: -1, target: 'foe', chance: 50 },
  });
  registerMove('scald', {
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 30),
  });
  registerMove('steam eruption', {
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 30),
  });
  registerMove('surf', {
    onUse: (ctx) => {
      if (ctx.defender.volatile?.underwater) {
        ctx.moveData = { ...(ctx.moveData || {}), power: 180 };
        ctx.log.push('Surf hit the underwater target for double damage!');
      }
    },
  });
  registerMove('water gun');
  registerMove('water pulse', {
    onHit: (ctx) => { if (Math.random() * 100 < 20) inflictConfusion(ctx, ctx.defender); },
  });
  registerMove('water shuriken', {
    onUse: (ctx) => {
      const roll = Math.random();
      ctx.hitCount = roll < 0.333 ? 2 : roll < 0.667 ? 3 : roll < 0.833 ? 4 : 5;
    },
  });
  MOVE_EFFECTS['water spout'] = {
    operational: true,
    onUse: (ctx) => {
      const ratio = ctx.attacker.hp / ctx.attacker.maxHp;
      const pwr = Math.max(1, Math.floor(150 * ratio));
      ctx.moveData = { ...(ctx.moveData || {}), power: pwr };
      ctx.log.push(`Water Spout's power is ${pwr}!`);
    },
  };
  registerMove('waterfall', { flinchChance: 20 });
  registerMove('whirlpool', {
    onHit: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.trapped = Math.floor(Math.random() * 2) + 4;
      ctx.defender.volatile.trapDmg  = Math.floor(ctx.defender.maxHp / 8);
      ctx.log.push(`${ctx.defender.name} was caught in the whirlpool!`);
    },
  });
  MOVE_EFFECTS['withdraw'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'def', 1, 'self'),
  };
}
