/*
 * movesDark.js Registers all DARK type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, inflictConfusion } from './movesHelper.js';

export function registerDarkMoves() {
  registerMove('assurance', {
    onUse: (ctx) => {
      if (ctx.defender.volatile?.damagedThisTurn) {
        ctx.moveData = { ...(ctx.moveData || {}), power: 100 };
        ctx.log.push(`Assurance's power doubled! (target already took damage this turn)`);
      }
    },
  });
  registerMove('bite', { flinchChance: 30 });
  registerMove('crunch', {
    secondary: { stat: 'def', stages: -1, target: 'foe', chance: 20 },
  });
  registerMove('dark pulse', { flinchChance: 20 });
  MOVE_EFFECTS['fake tears'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'spdef', -2, 'foe'),
  };
  MOVE_EFFECTS['feint attack'] = {
    operational: true,
    ignoreAccEva: true,
    onUse: (ctx) => {
      if (ctx.defender.volatile?.invulnerable) {
        ctx.log.push(`${ctx.defender.name} is unreachable and dodged Feint Attack!`);
        ctx.absorbed = true;
      }
    },
  };
  MOVE_EFFECTS['flatter'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'spatk', 1, 'foe');
      inflictConfusion(ctx, ctx.defender);
    },
  };
  registerMove('foul play', {
    onUse: (ctx) => {
      ctx.moveData = { ...(ctx.moveData || {}), useDefenderAtk: true };
      ctx.log.push(`${ctx.attacker.name} used the foe's power against it!`);
    },
  });
  MOVE_EFFECTS['hone claws'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'atk', 1, 'self');
      statChange(ctx, 'acc', 1, 'self');
    },
  };
  MOVE_EFFECTS['hyperspace fury'] = {
    operational: true,
    onUse: (ctx) => {
      if (ctx.defender.volatile?.protect) {
        delete ctx.defender.volatile.protect;
        ctx.log.push(`${ctx.attacker.name} broke through the protection!`);
      }
      statChange(ctx, 'def', -1, 'self');
    },
  };
  MOVE_EFFECTS['memento'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.attacker.hp = 0;
      ctx.attacker.fainted = true;
      statChange(ctx, 'atk',   -2, 'foe');
      statChange(ctx, 'spatk', -2, 'foe');
      ctx.log.push(`${ctx.attacker.name} fainted to sharply lower the foe's stats!`);
    },
  };
  MOVE_EFFECTS['nasty plot'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'spatk', 2, 'self'),
  };
  registerMove('night daze', {
    secondary: { stat: 'acc', stages: -1, target: 'foe', chance: 40 },
  });
  registerMove('night slash', { highCrit: true });
  MOVE_EFFECTS['parting shot'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'atk',   -1, 'foe');
      statChange(ctx, 'spatk', -1, 'foe');
      ctx.forceSwitch = 'attacker';
      ctx.log.push(`${ctx.attacker.name} returned to safety after lowering the foe's stats!`);
    },
  };
  registerMove('payback', {
    onUse: (ctx) => {
      if ((ctx.attacker.volatile?.lastDamageTaken ?? 0) > 0) {
        ctx.moveData = { ...(ctx.moveData || {}), power: 100 };
        ctx.log.push(`${ctx.attacker.name} paid back the damage with doubled power!`);
      }
    },
  });
  MOVE_EFFECTS['punishment'] = {
    operational: true,
    onUse: (ctx) => {
      const totalBoosts = Object.values(ctx.defender.stages || {})
        .filter(v => v > 0)
        .reduce((a, b) => a + b, 0);
      const pwr = Math.min(200, 60 + totalBoosts * 20);
      ctx.moveData = { ...(ctx.moveData || {}), power: pwr };
      ctx.log.push(`Punishment's power is ${pwr}! (${totalBoosts} positive stages on target)`);
    },
  };
  registerMove('snarl', {
    secondary: { stat: 'spatk', stages: -1, target: 'foe', chance: 100 },
  });
  registerMove('sucker punch', {
    onUse: (ctx) => {
      const defenderMove = ctx.defenderChosenMove;
      const isSafeToCheck = defenderMove !== undefined;
      if (isSafeToCheck) {
        const defEffect = MOVE_EFFECTS[defenderMove];
        const isStatusOrNoMove = !defenderMove || (defEffect && defEffect.power === null);
        if (isStatusOrNoMove) {
          ctx.log.push(`But it failed! (${ctx.defender.name} is not readying an attack)`);
          ctx.absorbed = true;
          return;
        }
      }
      ctx.log.push(`${ctx.attacker.name} struck before the foe could move!`);
    },
  });
  MOVE_EFFECTS['taunt'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.taunt = 3;
      ctx.log.push(`${ctx.defender.name} fell for the taunt! It can't use status moves for 3 turns!`);
    },
  };
  MOVE_EFFECTS['topsy turvy'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.stages) { ctx.log.push('But it failed!'); return; }
      const hasAny = Object.values(ctx.defender.stages).some(v => v !== 0);
      if (!hasAny) { ctx.log.push('But it failed! (no stat changes to reverse)'); return; }
      Object.keys(ctx.defender.stages).forEach(stat => {
        ctx.defender.stages[stat] = -(ctx.defender.stages[stat]);
      });
      ctx.log.push(`${ctx.defender.name}'s stat changes were reversed by Topsy-Turvy!`);
    },
  };
  MOVE_EFFECTS['torment'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      if (ctx.defender.volatile.torment) { ctx.log.push('But it failed! (already under Torment)'); return; }
      ctx.defender.volatile.torment = true;
      ctx.log.push(`${ctx.defender.name} is under Torment! It can't use the same move twice in a row!`);
    },
  };
}
