/*
 * movesIce.js Registers all ICE type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, secondaryStatus } from './movesHelper.js';

export function registerIceMoves() {
  registerMove('aurora beam', {
    secondary: { stat: 'atk', stages: -1, target: 'foe', chance: 10 },
  });
  registerMove('avalanche', {
    onUse: (ctx) => {
      if ((ctx.attacker.volatile?.lastDamageTaken ?? 0) > 0) {
        ctx.moveData = { ...(ctx.moveData || {}), power: 120 };
        ctx.log.push(`${ctx.attacker.name} struck back with doubled power!`);
      }
    },
  });
  registerMove('blizzard', {
    onHit: (ctx) => secondaryStatus(ctx, 'frz', 10),
  });
  registerMove('freeze shock', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      if (!ctx.attacker.volatile.freezeShockCharging) {
        ctx.attacker.volatile.freezeShockCharging = true;
        ctx.log.push(`${ctx.attacker.name} is charging with cold energy!`);
        ctx.absorbed = true;
      } else {
        delete ctx.attacker.volatile.freezeShockCharging;
      }
    },
    onHit: (ctx) => secondaryStatus(ctx, 'par', 30),
  });
  registerMove('freeze-dry', {
    onHit: (ctx) => secondaryStatus(ctx, 'frz', 10),
    onUse: (ctx) => { ctx.moveData = { ...(ctx.moveData || {}), superVsWater: true }; },
  });
  registerMove('frost breath', {
    onUse: (ctx) => { ctx.moveData = { ...(ctx.moveData || {}), forceCrit: true }; },
  });
  registerMove('glaciate', {
    secondary: { stat: 'spd', stages: -1, target: 'foe', chance: 100 },
  });
  MOVE_EFFECTS['haze'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.attacker.stages = {};
      ctx.defender.stages = {};
      ctx.log.push('All stat changes were eliminated!');
    },
  };
  registerMove('ice ball', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      const n = ctx.attacker.volatile.iceBall || 0;
      ctx.attacker.volatile.iceBall = n >= 4 ? 0 : n + 1;
      const power = 30 * Math.pow(2, n);
      ctx.moveData = { ...(ctx.moveData || {}), power };
      ctx.log.push(`Ice Ball's power is ${power}!`);
    },
  });
  registerMove('ice beam', {
    onHit: (ctx) => secondaryStatus(ctx, 'frz', 10),
  });
  registerMove('ice burn', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      if (!ctx.attacker.volatile.iceBurnCharging) {
        ctx.attacker.volatile.iceBurnCharging = true;
        ctx.log.push(`${ctx.attacker.name} is engulfed in freezing air!`);
        ctx.absorbed = true;
      } else {
        delete ctx.attacker.volatile.iceBurnCharging;
      }
    },
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 30),
  });
  registerMove('ice fang', {
    flinchChance: 10,
    onHit: (ctx) => secondaryStatus(ctx, 'frz', 10),
  });
  registerMove('ice punch', {
    onHit: (ctx) => secondaryStatus(ctx, 'frz', 10),
  });
  registerMove('ice shard', {
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} struck first! (Priority +1)`),
  });
  registerMove('icicle crash', { flinchChance: 30 });
  registerMove('icicle spear', {
    onUse: (ctx) => {
      const roll = Math.random();
      ctx.hitCount = roll < 0.333 ? 2 : roll < 0.667 ? 3 : roll < 0.833 ? 4 : 5;
    },
  });
  registerMove('icy wind', {
    secondary: { stat: 'spd', stages: -1, target: 'foe', chance: 100 },
  });
  registerMove('powder snow', {
    onHit: (ctx) => secondaryStatus(ctx, 'frz', 10),
  });
  MOVE_EFFECTS['sheer cold'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.types?.includes('ice')) { ctx.log.push('It doesn\'t affect Ice-types!'); return; }
      if (Math.random() * 100 >= 30) { ctx.log.push('Sheer Cold missed!'); return; }
      ctx.defender.hp = 0;
      ctx.defender.fainted = true;
      ctx.log.push(`${ctx.defender.name} was frozen solid! It's a one-hit KO!`);
      ctx.absorbed = true;
    },
  };
}
