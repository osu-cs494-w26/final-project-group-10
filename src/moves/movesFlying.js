/*
 * movesFlying.js Registers all FLYING type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, inflictConfusion, secondaryStatus, recoilEffect, drainEffect } from './movesHelper.js';

export function registerFlyingMoves() {
  registerMove('acrobatics', {
    onUse: (ctx) => {
      if (!ctx.attacker.item) {
        ctx.moveData = { ...(ctx.moveData || {}), power: 110 };
        ctx.log.push(`${ctx.attacker.name} flew freely with no item!`);
      }
    },
  });
  registerMove('aeroblast', { highCrit: true });
  registerMove('aerial ace');
  registerMove('air cutter', { highCrit: true });
  registerMove('air slash', { flinchChance: 30 });
  registerMove('bounce', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      if (!ctx.attacker.volatile.bounceCharging) {
        ctx.attacker.volatile.bounceCharging = true;
        ctx.attacker.volatile.invulnerable   = 'bounce';
        ctx.attacker.volatile.lockedMove     = 'bounce';
        ctx.log.push(`${ctx.attacker.name} sprang up high!`);
        ctx.absorbed = true;
      } else {
        delete ctx.attacker.volatile.bounceCharging;
        delete ctx.attacker.volatile.invulnerable;
        delete ctx.attacker.volatile.lockedMove;
      }
    },
    onHit: (ctx) => secondaryStatus(ctx, 'par', 30),
  });
  registerMove('brave bird', { onHit: recoilEffect(1 / 3) });
  registerMove('chatter', {
    onHit: (ctx) => inflictConfusion(ctx, ctx.defender),
  });
  MOVE_EFFECTS['defog'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'eva', -1, 'foe');
      if (ctx.defenderSide) {
        ctx.defenderSide.stealthRock = false;
        ctx.defenderSide.stickyWeb   = false;
      }
      if (ctx.attackerSide) {
        ctx.attackerSide.reflect     = 0;
        ctx.attackerSide.lightScreen = 0;
      }
      ctx.log.push('Hazards and screens were cleared by Defog!');
    },
  };
  registerMove('dragon ascent', {
    onHit: (ctx) => {
      statChange(ctx, 'def',   -1, 'self');
      statChange(ctx, 'spdef', -1, 'self');
    },
  });
  registerMove('drill peck');
  MOVE_EFFECTS['feather dance'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'atk', -2, 'foe'),
  };
  registerMove('fly', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      if (!ctx.attacker.volatile.flyCharging) {
        ctx.attacker.volatile.flyCharging  = true;
        ctx.attacker.volatile.invulnerable = 'fly';
        ctx.attacker.volatile.lockedMove   = 'fly';
        ctx.log.push(`${ctx.attacker.name} flew up high!`);
        ctx.absorbed = true;
      } else {
        delete ctx.attacker.volatile.flyCharging;
        delete ctx.attacker.volatile.invulnerable;
        delete ctx.attacker.volatile.lockedMove;
      }
    },
  });
  registerMove('gust', {
    onUse: (ctx) => {
      if (ctx.defender.volatile?.vanished) {
        ctx.moveData = { ...(ctx.moveData || {}), power: 80 };
        ctx.log.push('Gust hit the airborne target for double damage!');
      }
    },
  });
  registerMove('hurricane', {
    onHit: (ctx) => { if (Math.random() * 100 < 30) inflictConfusion(ctx, ctx.defender); },
  });
  registerMove('oblivion wing', { onHit: drainEffect(0.75) });
  registerMove('peck');
  registerMove('pluck', {
    onHit: (ctx) => {
      const item = ctx.defender.item;
      if (item?.type === 'berry' || (typeof item === 'string' && item.toLowerCase().includes('berry'))) {
        ctx.log.push(`${ctx.attacker.name} stole and ate ${ctx.defender.name}'s ${item?.name || item}!`);
        ctx.defender.item = null;
      }
    },
  });
  MOVE_EFFECTS['roost'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const heal = Math.floor(ctx.attacker.maxHp * 0.5);
      ctx.attacker.hp = Math.min(ctx.attacker.maxHp, ctx.attacker.hp + heal);
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.roosted = true;
      ctx.log.push(`${ctx.attacker.name} restored ${heal} HP and landed!`);
    },
  };
  registerMove('sky attack', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      if (!ctx.attacker.volatile.skyAttackCharging) {
        ctx.attacker.volatile.skyAttackCharging = true;
        ctx.attacker.volatile.invulnerable      = 'sky';
        ctx.attacker.volatile.lockedMove        = 'sky attack';
        ctx.log.push(`${ctx.attacker.name} is glowing!`);
        ctx.absorbed = true;
      } else {
        delete ctx.attacker.volatile.skyAttackCharging;
        delete ctx.attacker.volatile.invulnerable;
        delete ctx.attacker.volatile.lockedMove;
      }
    },
    flinchChance: 30,
    highCrit: true,
  });
  MOVE_EFFECTS['tailwind'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attackerSide) ctx.attackerSide = {};
      ctx.attackerSide.tailwind = 4;
      ctx.log.push('A tailwind started blowing! Speed doubled for 4 turns!');
    },
  };
  registerMove('wing attack');
}
