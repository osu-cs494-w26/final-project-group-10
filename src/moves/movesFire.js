/*
 * movesFire.js Registers all FIRE type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, secondaryStatus, recoilEffect } from './movesHelper.js';

export function registerFireMoves() {
  registerMove('blast burn', {
    onHit: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.recharging = true;
      ctx.log.push(`${ctx.attacker.name} must recharge!`);
    },
  });
  registerMove('blaze kick', {
    highCrit: true,
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 10),
  });
  registerMove('blue flare', {
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 20),
  });
  registerMove('ember', {
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 10),
  });
  MOVE_EFFECTS['eruption'] = {
    operational: true,
    onUse: (ctx) => {
      const ratio = ctx.attacker.hp / ctx.attacker.maxHp;
      const pwr = Math.max(1, Math.floor(150 * ratio));
      ctx.moveData = { ...(ctx.moveData || {}), power: pwr };
      ctx.log.push(`Eruption's power is ${pwr}!`);
    },
  };
  registerMove('fiery dance', {
    secondary: { stat: 'spatk', stages: 1, target: 'self', chance: 50 },
  });
  registerMove('fire blast', {
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 10),
  });
  registerMove('fire fang', {
    flinchChance: 10,
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 10),
  });
  registerMove('fire pledge', {
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} used Fire Pledge!`),
  });
  registerMove('fire punch', {
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 10),
  });
  registerMove('fire spin', {
    onHit: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.trapped = Math.floor(Math.random() * 2) + 4;
      ctx.defender.volatile.trapDmg  = Math.floor(ctx.defender.maxHp / 8);
      ctx.log.push(`${ctx.defender.name} was trapped in the fiery vortex!`);
    },
  });
  registerMove('flame burst', {
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} burst into flames!`),
  });
  registerMove('flame charge', {
    onHit: (ctx) => statChange(ctx, 'spd', 1, 'self'),
  });
  registerMove('flame wheel', {
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 10),
  });
  registerMove('flamethrower', {
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 10),
  });
  registerMove('flare blitz', {
    onHit: (ctx) => {
      recoilEffect(1 / 3)(ctx);
      secondaryStatus(ctx, 'brn', 10);
    },
  });
  registerMove('fusion flare', {
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} used Fusion Flare!`),
  });
  registerMove('heat crash');
  registerMove('heat wave', {
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 10),
  });
  registerMove('incinerate', {
    onHit: (ctx) => {
      const item = ctx.defender.item;
      if (item?.type === 'berry' || (typeof item === 'string' && item.toLowerCase().includes('berry'))) {
        ctx.log.push(`${ctx.defender.name}'s ${item?.name || item} was incinerated!`);
        ctx.defender.item = null;
      }
    },
  });
  registerMove('inferno', {
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 100),
  });
  registerMove('lava plume', {
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 30),
  });
  registerMove('magma storm', {
    onHit: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.trapped = Math.floor(Math.random() * 2) + 4;
      ctx.defender.volatile.trapDmg  = Math.floor(ctx.defender.maxHp / 8);
      ctx.log.push(`${ctx.defender.name} was caught in the swirling magma!`);
    },
  });
  registerMove('mystical fire', {
    secondary: { stat: 'spatk', stages: -1, target: 'foe', chance: 100 },
  });
  registerMove('overheat', {
    onHit: (ctx) => statChange(ctx, 'spatk', -2, 'self'),
  });
  registerMove('sacred fire', {
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 50),
  });
  registerMove('searing shot', {
    onHit: (ctx) => secondaryStatus(ctx, 'brn', 30),
  });
  MOVE_EFFECTS['sunny day'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.weather = { type: 'sun', turns: 5 };
      ctx.log.push('The sunlight turned harsh!');
    },
  };
  registerMove('v-create', {
    onHit: (ctx) => {
      statChange(ctx, 'def',   -1, 'self');
      statChange(ctx, 'spdef', -1, 'self');
      statChange(ctx, 'spd',   -1, 'self');
    },
  });
  MOVE_EFFECTS['will-o-wisp'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'none') { ctx.log.push('But it failed!'); return; }
      if (ctx.defender.types?.includes('fire')) { ctx.log.push('It doesn\'t affect Fire-types!'); return; }
      ctx.defender.status = 'brn';
      ctx.log.push(`${ctx.defender.name} was burned!`);
    },
  };
}
