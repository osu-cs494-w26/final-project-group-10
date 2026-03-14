/*
 * movesPoison.js Registers all POISON type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, secondaryStatus } from './movesHelper.js';

export function registerPoisonMoves() {
  registerMove('acid', {
    secondary: { stat: 'spdef', stages: -1, target: 'foe', chance: 10 },
  });
  MOVE_EFFECTS['acid armor'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'def', 2, 'self'),
  };
  registerMove('acid spray', {
    secondary: { stat: 'spdef', stages: -2, target: 'foe', chance: 100 },
  });
  MOVE_EFFECTS['belch'] = {
    operational: true,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile?.consumedBerry) {
        ctx.log.push(`${ctx.attacker.name} hasn't eaten a Berry yet Belch failed!`);
        ctx.absorbed = true;
      }
    },
  };
  registerMove('clear smog', {
    onHit: (ctx) => {
      ctx.defender.stages = {};
      ctx.log.push(`${ctx.defender.name}'s stat changes were removed!`);
    },
  });
  MOVE_EFFECTS['coil'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'atk', 1, 'self');
      statChange(ctx, 'def', 1, 'self');
      ctx.log.push(`${ctx.attacker.name}'s accuracy rose!`);
    },
  };
  registerMove('cross poison', {
    highCrit: true,
    onHit: (ctx) => secondaryStatus(ctx, 'psn', 10),
  });
  MOVE_EFFECTS['gastro acid'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.gastroAcid = true;
      ctx.log.push(`${ctx.defender.name}'s Ability was suppressed!`);
    },
  };
  registerMove('gunk shot', {
    onHit: (ctx) => secondaryStatus(ctx, 'psn', 30),
  });
  registerMove('poison fang', {
    onHit: (ctx) => secondaryStatus(ctx, 'tox', 50),
  });
  MOVE_EFFECTS['poison gas'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'none') { ctx.log.push('But it failed!'); return; }
      ctx.defender.status = 'psn';
      ctx.log.push(`${ctx.defender.name} was poisoned!`);
    },
  };
  registerMove('poison jab', {
    onHit: (ctx) => secondaryStatus(ctx, 'psn', 30),
  });
  MOVE_EFFECTS['poison powder'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'none') { ctx.log.push('But it failed!'); return; }
      ctx.defender.status = 'psn';
      ctx.log.push(`${ctx.defender.name} was poisoned!`);
    },
  };
  registerMove('poison sting', {
    onHit: (ctx) => secondaryStatus(ctx, 'psn', 30),
  });
  registerMove('poison tail', {
    highCrit: true,
    onHit: (ctx) => secondaryStatus(ctx, 'psn', 10),
  });
  registerMove('sludge', {
    onHit: (ctx) => secondaryStatus(ctx, 'psn', 30),
  });
  registerMove('sludge bomb', {
    onHit: (ctx) => secondaryStatus(ctx, 'psn', 30),
  });
  registerMove('sludge wave', {
    onHit: (ctx) => secondaryStatus(ctx, 'psn', 10),
  });
  registerMove('smog', {
    onHit: (ctx) => secondaryStatus(ctx, 'psn', 40),
  });
  MOVE_EFFECTS['toxic'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'none') { ctx.log.push('But it failed!'); return; }
      ctx.defender.status = 'tox';
      ctx.defender.toxCounter = 0;
      ctx.log.push(`${ctx.defender.name} was badly poisoned!`);
    },
  };
  MOVE_EFFECTS['toxic spikes'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defenderSide) ctx.defenderSide = {};
      ctx.defenderSide.toxicSpikes = Math.min(2, (ctx.defenderSide.toxicSpikes || 0) + 1);
      const layer = ctx.defenderSide.toxicSpikes;
      ctx.log.push(`Toxic Spikes scattered on the opposing side! (Layer ${layer}${layer === 2 ? ' badly poisoning' : ''})`);
    },
  };
  MOVE_EFFECTS['venom drench'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'psn' && ctx.defender.status !== 'tox') {
        ctx.log.push('But it failed! (target must be poisoned)'); return;
      }
      statChange(ctx, 'spatk', -1, 'foe');
      statChange(ctx, 'spd',   -1, 'foe');
    },
  };
  registerMove('venoshock', {
    onUse: (ctx) => {
      if (ctx.defender.status === 'psn' || ctx.defender.status === 'tox') {
        ctx.moveData = { ...(ctx.moveData || {}), power: 130 };
        ctx.log.push('Venoshock is boosted by the target\'s poisoned state!');
      }
    },
  });
}
