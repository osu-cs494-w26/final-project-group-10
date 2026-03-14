/*
 * movesBug.js Registers all BUG type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, secondaryStatus, inflictConfusion, drainEffect } from './movesHelper.js';

export function registerBugMoves() {
  registerMove('attack order', { highCrit: true });
  registerMove('bug bite', {
    onHit: (ctx) => {
      if (ctx.defender.item?.type === 'berry' || (typeof ctx.defender.item === 'string' && ctx.defender.item.toLowerCase().includes('berry'))) {
        ctx.log.push(`${ctx.attacker.name} ate ${ctx.defender.name}'s ${ctx.defender.item?.name || ctx.defender.item}!`);
        ctx.defender.item = null;
      }
    },
  });
  registerMove('bug buzz', {
    secondary: { stat: 'spdef', stages: -1, target: 'foe', chance: 10 },
  });
  MOVE_EFFECTS['defend order'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'def',   1, 'self');
      statChange(ctx, 'spdef', 1, 'self');
    },
  };
  registerMove('fell stinger', {
    onHit: (ctx) => {
      if (ctx.defender.fainted) statChange(ctx, 'atk', 3, 'self');
    },
  });
  registerMove('fury cutter', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      const n = ctx.attacker.volatile.furyCutter || 0;
      ctx.attacker.volatile.furyCutter = Math.min(n + 1, 3);
      const power = 40 * Math.pow(2, n);
      ctx.moveData = { ...(ctx.moveData || {}), power };
      if (n > 0) ctx.log.push(`Fury Cutter's power is ${power}!`);
    },
  });
  MOVE_EFFECTS['heal order'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const heal = Math.floor(ctx.attacker.maxHp * 0.5);
      ctx.attacker.hp = Math.min(ctx.attacker.maxHp, ctx.attacker.hp + heal);
      ctx.log.push(`${ctx.attacker.name} restored ${heal} HP!`);
    },
  };
  registerMove('infestation', {
    onHit: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.trapped = Math.floor(Math.random() * 2) + 4;
      ctx.defender.volatile.infestDmg = Math.floor(ctx.defender.maxHp / 8);
      ctx.log.push(`${ctx.defender.name} was infested and can't escape!`);
    },
  });
  registerMove('leech life', { onHit: drainEffect(0.5) });
  registerMove('megahorn');
  registerMove('pin missile', {
    onUse: (ctx) => {
      const roll = Math.random();
      ctx.hitCount = roll < 0.333 ? 2 : roll < 0.667 ? 3 : roll < 0.833 ? 4 : 5;
    },
  });
  MOVE_EFFECTS['powder'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.powder = true;
      ctx.log.push(`${ctx.defender.name} is covered in powder!`);
    },
  };
  MOVE_EFFECTS['quiver dance'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'spatk', 1, 'self');
      statChange(ctx, 'spdef', 1, 'self');
      statChange(ctx, 'spd',   1, 'self');
    },
  };
  MOVE_EFFECTS['rage powder'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.ragePowder = true;
      ctx.log.push(`${ctx.attacker.name} became the center of attention!`);
    },
  };
  registerMove('signal beam', {
    onHit: (ctx) => { if (Math.random() * 100 < 10) inflictConfusion(ctx, ctx.defender); },
  });
  registerMove('silver wind', {
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
  MOVE_EFFECTS['spider web'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.trapped = 999;
      ctx.log.push(`${ctx.defender.name} can't escape!`);
    },
  };
  registerMove('steamroller', { flinchChance: 30 });
  MOVE_EFFECTS['sticky web'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defenderSide) ctx.defenderSide = {};
      ctx.defenderSide.stickyWeb = true;
      ctx.log.push('A sticky web was laid on the opposing side!');
    },
  };
  MOVE_EFFECTS['string shot'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'spd', -2, 'foe'),
  };
  registerMove('struggle bug', {
    secondary: { stat: 'spatk', stages: -1, target: 'foe', chance: 100 },
  });
  MOVE_EFFECTS['tail glow'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'spatk', 3, 'self'),
  };
  registerMove('twineedle', {
    onUse: (ctx) => { ctx.hitCount = 2; },
    onHit: (ctx) => secondaryStatus(ctx, 'psn', 20),
  });
  registerMove('u-turn', {
    onHit: (ctx) => {
      ctx.forceSwitch = 'attacker';
      ctx.log.push(`${ctx.attacker.name} kept up its guard!`);
    },
  });
  registerMove('x-scissor');
}
