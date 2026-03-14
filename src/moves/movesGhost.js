/*
 * movesGhost.js Registers all GHOST type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, inflictConfusion } from './movesHelper.js';

export function registerGhostMoves() {
  registerMove('astonish', { flinchChance: 30 });
  MOVE_EFFECTS['confuse ray'] = {
    operational: true, power: null,
    onUse: (ctx) => inflictConfusion(ctx, ctx.defender),
  };
  MOVE_EFFECTS['curse'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const isGhost = ctx.attacker.types?.includes('ghost');
      if (isGhost) {
        const cost = Math.floor(ctx.attacker.maxHp * 0.5);
        ctx.attacker.hp = Math.max(0, ctx.attacker.hp - cost);
        if (ctx.attacker.hp === 0) ctx.attacker.fainted = true;
        if (!ctx.defender.volatile) ctx.defender.volatile = {};
        ctx.defender.volatile.curse = true;
        ctx.log.push(`${ctx.attacker.name} cut its own HP and put a curse on ${ctx.defender.name}!`);
        if (ctx.attacker.fainted) ctx.log.push(`${ctx.attacker.name} fainted!`);
      } else {
        statChange(ctx, 'atk',  1, 'self');
        statChange(ctx, 'def',  1, 'self');
        statChange(ctx, 'spd', -1, 'self');
      }
    },
  };
  MOVE_EFFECTS['destiny bond'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.destinyBond = true;
      ctx.log.push(`${ctx.attacker.name} is taking its attacker down with it!`);
    },
  };
  registerMove('hex', {
    onUse: (ctx) => {
      const hasStatus = ctx.defender.status && ctx.defender.status !== 'none';
      if (hasStatus) {
        ctx.moveData = { ...(ctx.moveData || {}), power: 130 };
        ctx.log.push(`Hex is boosted by ${ctx.defender.name}'s status condition!`);
      }
    },
  });
  registerMove('lick', {
    secondary: { status: 'par', chance: 30 },
  });
  MOVE_EFFECTS['night shade'] = {
    operational: true,
    onUse: (ctx) => {
      const dmg = 100;
      ctx.defender.hp = Math.max(0, ctx.defender.hp - dmg);
      if (ctx.defender.hp === 0) ctx.defender.fainted = true;
      ctx.log.push(`${ctx.defender.name} took ${dmg} damage from Night Shade!`);
      if (ctx.defender.fainted) ctx.log.push(`${ctx.defender.name} fainted!`);
      ctx.absorbed = true;
    },
  };
  MOVE_EFFECTS['nightmare'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'slp') {
        ctx.log.push(`But it failed! (target must be asleep)`);
        return;
      }
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      if (ctx.defender.volatile.nightmare) {
        ctx.log.push(`${ctx.defender.name} is already having a nightmare!`);
        return;
      }
      ctx.defender.volatile.nightmare = true;
      ctx.log.push(`${ctx.defender.name} began having a nightmare!`);
    },
  };
  registerMove('ominous wind', {
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
  const makeTwoTurnForce = (moveName) => ({
    operational: true,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      if (!ctx.attacker.volatile.twoTurnCharging) {
        ctx.attacker.volatile.twoTurnCharging = moveName;
        ctx.attacker.volatile.invulnerable    = 'shadow';
        ctx.attacker.volatile.lockedMove      = moveName;
        ctx.log.push(`${ctx.attacker.name} vanished instantly!`);
        ctx.absorbed = true;
      } else {
        delete ctx.attacker.volatile.twoTurnCharging;
        delete ctx.attacker.volatile.invulnerable;
        delete ctx.attacker.volatile.lockedMove;
        if (ctx.defender.volatile?.protect) {
          delete ctx.defender.volatile.protect;
          ctx.log.push(`${ctx.attacker.name} broke through the protection!`);
        }
      }
    },
  });
  MOVE_EFFECTS['phantom force'] = makeTwoTurnForce('phantom force');
  MOVE_EFFECTS['shadow force']  = makeTwoTurnForce('shadow force');
  registerMove('shadow ball', {
    secondary: { stat: 'spdef', stages: -1, target: 'foe', chance: 20 },
  });
  registerMove('shadow claw', { highCrit: true });
  registerMove('shadow punch', { ignoreAccEva: true });
  registerMove('shadow sneak');
}
