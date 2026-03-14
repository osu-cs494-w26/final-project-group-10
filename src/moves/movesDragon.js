/*
 * movesDragon.js Registers all DRAGON type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, inflictConfusion } from './movesHelper.js';

export function registerDragonMoves() {
  registerMove('draco meteor', {
    onHit: (ctx) => statChange(ctx, 'spatk', -2, 'self'),
  });
  registerMove('dragon breath', {
    secondary: { status: 'par', chance: 30 },
  });
  registerMove('dragon claw');
  MOVE_EFFECTS['dragon dance'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'atk', 1, 'self');
      statChange(ctx, 'spd', 1, 'self');
    },
  };
  registerMove('dragon pulse');
  MOVE_EFFECTS['dragon rage'] = {
    operational: true,
    onUse: (ctx) => {
      ctx.defender.hp = Math.max(0, ctx.defender.hp - 40);
      if (ctx.defender.hp === 0) ctx.defender.fainted = true;
      ctx.log.push(`${ctx.defender.name} took 40 damage from Dragon Rage!`);
      if (ctx.defender.fainted) ctx.log.push(`${ctx.defender.name} fainted!`);
      ctx.absorbed = true;
    },
  };
  registerMove('dragon rush', { flinchChance: 20 });
  registerMove('dragon tail', {
    onHit: (ctx) => {
      ctx.forceSwitch = 'defender';
      ctx.log.push(`${ctx.defender.name} was knocked back and forced to switch!`);
    },
  });
  registerMove('dual chop', {
    onUse: (ctx) => { ctx.hitCount = 2; },
  });
  MOVE_EFFECTS['outrage'] = {
    operational: true,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      if (ctx.attacker.volatile.outrageLeft === undefined) {
        ctx.attacker.volatile.outrageLeft = Math.floor(Math.random() * 2) + 1;
        ctx.attacker.volatile.lockedMove  = 'outrage';
      } else if (ctx.attacker.volatile.outrageLeft <= 0) {
        delete ctx.attacker.volatile.outrageLeft;
        delete ctx.attacker.volatile.lockedMove;
        inflictConfusion(ctx, ctx.attacker);
        ctx.log.push(`${ctx.attacker.name} became confused from fatigue!`);
      } else {
        ctx.attacker.volatile.outrageLeft--;
      }
    },
  };
  registerMove('roar of time', {
    onHit: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.recharging = true;
      ctx.log.push(`${ctx.attacker.name} must recharge!`);
    },
  });
  registerMove('spacial rend', { highCrit: true });
  registerMove('twister', { flinchChance: 30 });
}
