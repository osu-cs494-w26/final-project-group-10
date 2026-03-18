/*
 * movesElectric.js Registers all ELECTRIC type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, secondaryStatus, drainEffect, recoilEffect } from './movesHelper.js';

export function registerElectricMoves() {
  registerMove('bolt strike', {
    onHit: (ctx) => secondaryStatus(ctx, 'par', 20),
  });
  MOVE_EFFECTS['charge'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'spdef', 1, 'self');
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.charged = true;
      ctx.log.push(`${ctx.attacker.name} began charging power!`);
    },
  };
  registerMove('charge beam', {
    secondary: { stat: 'spatk', stages: 1, target: 'self', chance: 70 },
  });
  registerMove('discharge', {
    onHit: (ctx) => secondaryStatus(ctx, 'par', 30),
  });
  MOVE_EFFECTS['eerie impulse'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'spatk', -2, 'foe'),
  };
  MOVE_EFFECTS['electro ball'] = {
    operational: true,
    onUse: (ctx) => {
      const ratio = Math.max(1, ctx.attacker.spd) / Math.max(1, ctx.defender.spd);
      const pwr = ratio >= 4 ? 150 : ratio >= 3 ? 120 : ratio >= 2 ? 80 : ratio >= 1 ? 60 : 40;
      ctx.moveData = { ...(ctx.moveData || {}), power: pwr };
      ctx.log.push(`Electro Ball's power is ${pwr}!`);
    },
  };
  registerMove('electroweb', {
    secondary: { stat: 'spd', stages: -1, target: 'foe', chance: 100 },
  });
  registerMove('fusion bolt', {
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} used Fusion Bolt!`),
  });
  MOVE_EFFECTS['magnetic flux'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const plusMinus = ['plus', 'minus'];
      if (plusMinus.includes(ctx.attacker.ability)) {
        statChange(ctx, 'def',   1, 'self');
        statChange(ctx, 'spdef', 1, 'self');
      }
      ctx.log.push(`${ctx.attacker.name} manipulated magnetic energy!`);
    },
  };
  registerMove('nuzzle', {
    onHit: (ctx) => secondaryStatus(ctx, 'par', 100),
  });
  registerMove('parabolic charge', { onHit: drainEffect(0.5) });
  registerMove('shock wave');
  registerMove('spark', {
    onHit: (ctx) => secondaryStatus(ctx, 'par', 30),
  });
  registerMove('thunder', {
    onUse: (ctx) => {
      if (ctx.weather?.type === 'rain') ctx.moveData = { ...(ctx.moveData || {}), neverMiss: true };
      if (ctx.weather?.type === 'sun')  ctx.moveData = { ...(ctx.moveData || {}), power: 55 };
    },
    onHit: (ctx) => secondaryStatus(ctx, 'par', 30),
  });
  registerMove('thunder fang', {
    flinchChance: 10,
    onHit: (ctx) => secondaryStatus(ctx, 'par', 10),
  });
  registerMove('thunder punch', {
    onHit: (ctx) => secondaryStatus(ctx, 'par', 10),
  });
  registerMove('thunder shock', {
    onHit: (ctx) => secondaryStatus(ctx, 'par', 10),
  });
  MOVE_EFFECTS['thunder wave'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'none') { ctx.log.push('But it failed!'); return; }
      if (ctx.defender.types?.includes('electric')) { ctx.log.push('It doesn\'t affect Electric-types!'); return; }
      ctx.defender.status = 'par';
      ctx.log.push(`${ctx.defender.name} was paralyzed!`);
    },
  };
  registerMove('thunderbolt', {
    onHit: (ctx) => secondaryStatus(ctx, 'par', 10),
  });
  registerMove('volt switch', {
    onHit: (ctx) => {
      ctx.forceSwitch = 'attacker';
      ctx.log.push(`${ctx.attacker.name} returned after attacking!`);
    },
  });
  registerMove('volt tackle', {
    onHit: (ctx) => {
      recoilEffect(1 / 3)(ctx);
      secondaryStatus(ctx, 'par', 10);
    },
  });
  registerMove('wild charge', { onHit: recoilEffect(0.25) });
  registerMove('zap cannon', {
    onHit: (ctx) => secondaryStatus(ctx, 'par', 100),
  });
}
