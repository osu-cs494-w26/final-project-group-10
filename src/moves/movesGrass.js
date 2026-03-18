/*
 * movesGrass.js Registers all GRASS type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, inflictConfusion, drainEffect, recoilEffect } from './movesHelper.js';

export function registerGrassMoves() {
  registerMove('absorb', { onHit: drainEffect(0.5) });
  registerMove('bullet seed', {
    onUse: (ctx) => {
      const roll = Math.random();
      ctx.hitCount = roll < 0.333 ? 2 : roll < 0.667 ? 3 : roll < 0.833 ? 4 : 5;
    },
  });
  MOVE_EFFECTS['cotton guard'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'def', 3, 'self'),
  };
  MOVE_EFFECTS['cotton spore'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'spd', -2, 'foe'),
  };
  registerMove('energy ball', {
    secondary: { stat: 'spdef', stages: -1, target: 'foe', chance: 10 },
  });
  registerMove('frenzy plant', {
    onHit: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.recharging = true;
      ctx.log.push(`${ctx.attacker.name} must recharge!`);
    },
  });
  registerMove('giga drain', { onHit: drainEffect(0.5) });
  MOVE_EFFECTS['grass whistle'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'none') { ctx.log.push('But it failed!'); return; }
      ctx.defender.status = 'slp';
      ctx.defender.sleepCounter = Math.floor(Math.random() * 3) + 1;
      ctx.log.push(`${ctx.defender.name} fell asleep!`);
    },
  };
  registerMove('horn leech', { onHit: drainEffect(0.5) });
  MOVE_EFFECTS['ingrain'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.ingrain = true;
      ctx.attacker.volatile.trapped = 999;
      ctx.log.push(`${ctx.attacker.name} planted its roots!`);
    },
  };
  registerMove('leaf blade', { highCrit: true });
  registerMove('leaf storm', {
    onHit: (ctx) => statChange(ctx, 'spatk', -2, 'self'),
  });
  registerMove('leaf tornado', {
    secondary: { stat: 'acc', stages: -1, target: 'foe', chance: 30 },
  });
  MOVE_EFFECTS['leech seed'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.types?.includes('grass')) { ctx.log.push('It doesn\'t affect Grass-types!'); return; }
      if (ctx.defender.volatile?.leechSeed) { ctx.log.push('But it failed!'); return; }
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.leechSeed = true;
      ctx.log.push(`${ctx.defender.name} was seeded!`);
    },
  };
  registerMove('magical leaf');
  registerMove('mega drain', { onHit: drainEffect(0.5) });
  registerMove('needle arm', { flinchChance: 30 });
  registerMove('petal dance', {
    onHit: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      const turns = ctx.attacker.volatile.petalDanceLeft;
      if (turns === undefined) {
        ctx.attacker.volatile.petalDanceLeft = Math.floor(Math.random() * 2) + 1;
      } else if (turns <= 0) {
        delete ctx.attacker.volatile.petalDanceLeft;
        inflictConfusion(ctx, ctx.attacker);
      } else {
        ctx.attacker.volatile.petalDanceLeft--;
      }
    },
  });
  registerMove('power whip');
  registerMove('razor leaf', { highCrit: true });
  registerMove('seed bomb');
  registerMove('seed flare', {
    secondary: { stat: 'spdef', stages: -2, target: 'foe', chance: 40 },
  });
  MOVE_EFFECTS['sleep powder'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'none') { ctx.log.push('But it failed!'); return; }
      ctx.defender.status = 'slp';
      ctx.defender.sleepCounter = Math.floor(Math.random() * 3) + 1;
      ctx.log.push(`${ctx.defender.name} fell asleep!`);
    },
  };
  registerMove('solar beam', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      const isSunny = ctx.weather?.type === 'sun';
      if (!ctx.attacker.volatile.solarBeamCharging && !isSunny) {
        ctx.attacker.volatile.solarBeamCharging = true;
        ctx.attacker.volatile.lockedMove        = 'solar beam';
        ctx.log.push(`${ctx.attacker.name} absorbed light!`);
        ctx.absorbed = true;
      } else {
        delete ctx.attacker.volatile.solarBeamCharging;
        delete ctx.attacker.volatile.lockedMove;
        if (ctx.weather?.type === 'rain') {
          ctx.moveData = { ...(ctx.moveData || {}), power: 60 };
          ctx.log.push('Solar Beam\'s power was reduced by the rain!');
        }
      }
    },
  });
  MOVE_EFFECTS['spiky shield'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.protect = true;
      ctx.attacker.volatile.spikyShield = true;
      ctx.log.push(`${ctx.attacker.name} protected itself with a spiky shield!`);
    },
  };
  MOVE_EFFECTS['spore'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'none') { ctx.log.push('But it failed!'); return; }
      ctx.defender.status = 'slp';
      ctx.defender.sleepCounter = Math.floor(Math.random() * 3) + 1;
      ctx.log.push(`${ctx.defender.name} fell asleep!`);
    },
  };
  MOVE_EFFECTS['stun spore'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'none') { ctx.log.push('But it failed!'); return; }
      ctx.defender.status = 'par';
      ctx.log.push(`${ctx.defender.name} was paralyzed!`);
    },
  };
  MOVE_EFFECTS['synthesis'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const weather = ctx.weather?.type;
      const ratio = weather === 'sun' ? 2 / 3 : weather ? 0.25 : 0.5;
      const heal = Math.floor(ctx.attacker.maxHp * ratio);
      ctx.attacker.hp = Math.min(ctx.attacker.maxHp, ctx.attacker.hp + heal);
      ctx.log.push(`${ctx.attacker.name} restored ${heal} HP!`);
    },
  };
  registerMove('vine whip');
  registerMove('wood hammer', { onHit: recoilEffect(1 / 3) });
}
