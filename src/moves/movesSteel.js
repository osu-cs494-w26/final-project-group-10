/*
 * movesSteel.js Registers all STEEL type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange } from './movesHelper.js';
import { getStat } from '../utils/battleEngine.js';

export function registerSteelMoves() {
  MOVE_EFFECTS['autotomize'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'spd', 2, 'self'),
  };
  registerMove('bullet punch', {
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} struck first! (Priority +1)`),
  });
  MOVE_EFFECTS['doom desire'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      if (ctx.defender.volatile.doomDesire) {
        ctx.log.push('But it failed! Doom Desire is already active!');
        return;
      }
      const attackerSpatk = getStat(ctx.attacker, 'spatk');
      ctx.defender.volatile.doomDesire = {
        turns: 3,
        attackerSpatk,
        attackerName: ctx.attacker.name,
      };
      ctx.log.push(`${ctx.attacker.name} chose Doom Desire! It will strike in 2 turns!`);
    },
  };
  registerMove('flash cannon', {
    secondary: { stat: 'spdef', stages: -1, target: 'foe', chance: 10 },
  });
  registerMove('gear grind', {
    onUse: (ctx) => { ctx.hitCount = 2; },
  });
  MOVE_EFFECTS['gyro ball'] = {
    operational: true,
    onUse: (ctx) => {
      const userSpd = Math.max(1, getStat(ctx.attacker, 'spd'));
      const foeSpd  = Math.max(1, getStat(ctx.defender, 'spd'));
      const pwr = Math.min(150, Math.max(1, Math.floor(25 * foeSpd / userSpd)));
      ctx.moveData = { ...(ctx.moveData || {}), power: pwr };
      ctx.log.push(`Gyro Ball's power is ${pwr}! (Foe speed: ${foeSpd}, User speed: ${userSpd})`);
    },
  };
  MOVE_EFFECTS['iron defense'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'def', 2, 'self'),
  };
  registerMove('iron head', { flinchChance: 30 });
  registerMove('iron tail', {
    secondary: { stat: 'def', stages: -1, target: 'foe', chance: 30 },
  });
  MOVE_EFFECTS['kings shield'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      const streak = ctx.attacker.volatile.protectStreak ?? 0;
      const successChance = streak === 0 ? 100 : streak === 1 ? 66.7 : streak === 2 ? 33.3 : 11.1;
      if (Math.random() * 100 >= successChance) {
        ctx.attacker.volatile.protectStreak = 0;
        ctx.log.push('But it failed!');
        return;
      }
      ctx.attacker.volatile.protect      = true;
      ctx.attacker.volatile.kingsShield  = true;
      ctx.attacker.volatile.protectStreak = streak + 1;
      ctx.log.push(`${ctx.attacker.name} protected itself with King's Shield!`);
    },
  };
  MOVE_EFFECTS['magnet bomb'] = {
    operational: true,
    onUse: (ctx) => {
      if (ctx.defender.volatile?.invulnerable) {
        ctx.log.push(`${ctx.defender.name} is unreachable and dodged Magnet Bomb!`);
        ctx.absorbed = true;
      }
    },
  };
  MOVE_EFFECTS['metal burst'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const last = ctx.attacker.volatile?.lastDamageTaken ?? 0;
      if (last <= 0) { ctx.log.push('But it failed!'); return; }
      const dmg = Math.floor(last * 1.5);
      ctx.defender.hp = Math.max(0, ctx.defender.hp - dmg);
      if (ctx.defender.hp === 0) ctx.defender.fainted = true;
      ctx.log.push(`${ctx.attacker.name} dealt ${dmg} damage back with Metal Burst!`);
      if (ctx.defender.fainted) ctx.log.push(`${ctx.defender.name} fainted!`);
      ctx.absorbed = true;
    },
  };
  registerMove('metal claw', {
    secondary: { stat: 'atk', stages: 1, target: 'self', chance: 10 },
  });
  MOVE_EFFECTS['metal sound'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'spdef', -2, 'foe'),
  };
  registerMove('meteor mash', {
    secondary: { stat: 'atk', stages: 1, target: 'self', chance: 20 },
  });
  registerMove('mirror shot', {
    secondary: { stat: 'acc', stages: -1, target: 'foe', chance: 30 },
  });
  MOVE_EFFECTS['shift gear'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'atk', 1, 'self');
      statChange(ctx, 'spd', 2, 'self');
    },
  };
  registerMove('steel wing', {
    secondary: { stat: 'def', stages: 1, target: 'self', chance: 10 },
  });
}
