/*
 * movesFighting.js Registers all FIGHTING type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, inflictConfusion, secondaryStatus, recoilEffect, drainEffect } from './movesHelper.js';

export function registerFightingMoves() {
  registerMove('arm thrust', {
    onUse: (ctx) => {
      const roll = Math.random();
      ctx.hitCount = roll < 0.333 ? 2 : roll < 0.667 ? 3 : roll < 0.833 ? 4 : 5;
    },
  });
  registerMove('aura sphere');
  registerMove('brick break', {
    onUse: (ctx) => {
      if (ctx.defenderSide?.reflect || ctx.defenderSide?.lightScreen) {
        if (ctx.defenderSide) { ctx.defenderSide.reflect = 0; ctx.defenderSide.lightScreen = 0; }
        ctx.log.push('Brick Break shattered the barriers!');
      }
    },
  });
  MOVE_EFFECTS['bulk up'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'atk', 1, 'self');
      statChange(ctx, 'def', 1, 'self');
    },
  };
  registerMove('circle throw', {
    onHit: (ctx) => {
      ctx.forceSwitch = 'defender';
      ctx.log.push(`${ctx.defender.name} was thrown out!`);
    },
  });
  registerMove('close combat', {
    onHit: (ctx) => {
      statChange(ctx, 'def',   -1, 'self');
      statChange(ctx, 'spdef', -1, 'self');
    },
  });
  MOVE_EFFECTS['counter'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const last = ctx.attacker.volatile?.lastPhysicalDamageTaken ?? 0;
      if (last <= 0) { ctx.log.push('But it failed!'); return; }
      const dmg = last * 2;
      ctx.defender.hp = Math.max(0, ctx.defender.hp - dmg);
      if (ctx.defender.hp === 0) ctx.defender.fainted = true;
      ctx.log.push(`${ctx.attacker.name} countered ${dmg} damage back!`);
      if (ctx.defender.fainted) ctx.log.push(`${ctx.defender.name} fainted!`);
      ctx.absorbed = true;
    },
  };
  registerMove('cross chop', { highCrit: true });
  MOVE_EFFECTS['detect'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.protect = true;
      ctx.log.push(`${ctx.attacker.name} protected itself!`);
    },
  };
  registerMove('double kick', {
    onUse: (ctx) => { ctx.hitCount = 2; },
  });
  registerMove('drain punch', { onHit: drainEffect(0.5) });
  registerMove('dynamic punch', {
    onHit: (ctx) => inflictConfusion(ctx, ctx.defender),
  });
  MOVE_EFFECTS['final gambit'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const dmg = ctx.attacker.hp;
      ctx.attacker.hp = 0; ctx.attacker.fainted = true;
      ctx.defender.hp = Math.max(0, ctx.defender.hp - dmg);
      if (ctx.defender.hp === 0) ctx.defender.fainted = true;
      ctx.log.push(`${ctx.attacker.name} sacrificed itself for ${dmg} damage!`);
      if (ctx.defender.fainted) ctx.log.push(`${ctx.defender.name} fainted!`);
      ctx.absorbed = true;
    },
  };
  registerMove('flying press', {
    onUse: (ctx) => { ctx.moveData = { ...(ctx.moveData || {}), extraType: 'flying' }; },
  });
  registerMove('focus blast', {
    secondary: { stat: 'spdef', stages: -1, target: 'foe', chance: 10 },
  });
  registerMove('focus punch', {
    onUse: (ctx) => {
      if ((ctx.attacker.volatile?.lastDamageTaken ?? 0) > 0) {
        ctx.log.push(`${ctx.attacker.name} lost its focus and couldn't move!`);
        ctx.absorbed = true;
      } else {
        ctx.log.push(`${ctx.attacker.name} is tightening its focus!`);
      }
    },
  });
  registerMove('force palm', {
    onHit: (ctx) => secondaryStatus(ctx, 'par', 30),
  });
  registerMove('hammer arm', {
    onHit: (ctx) => statChange(ctx, 'spd', -1, 'self'),
  });
  ['high jump kick', 'jump kick'].forEach(m => {
    MOVE_EFFECTS[m] = {
      operational: true,
      onUse: (ctx) => {
        const acc = m === 'high jump kick' ? 90 : 95;
        if (Math.random() * 100 >= acc) {
          const crash = Math.floor(ctx.attacker.maxHp * 0.5);
          ctx.attacker.hp = Math.max(0, ctx.attacker.hp - crash);
          if (ctx.attacker.hp === 0) ctx.attacker.fainted = true;
          ctx.log.push(`${ctx.attacker.name} kept going and crashed! (${crash} HP lost)`);
          ctx.absorbed = true;
        }
      },
    };
  });
  registerMove('karate chop', { highCrit: true });
  registerMove('low kick');
  registerMove('low sweep', {
    secondary: { stat: 'spd', stages: -1, target: 'foe', chance: 100 },
  });
  registerMove('mach punch', {
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} struck first! (Priority +1)`),
  });
  MOVE_EFFECTS['mat block'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.protect = true;
      ctx.log.push(`${ctx.attacker.name} blocked incoming moves with a mat!`);
    },
  };
  registerMove('power-up punch', {
    onHit: (ctx) => statChange(ctx, 'atk', 1, 'self'),
  });
  MOVE_EFFECTS['quick guard'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attackerSide) ctx.attackerSide = {};
      ctx.attackerSide.quickGuard = true;
      ctx.log.push(`${ctx.attacker.name}'s team is protected from priority moves!`);
    },
  };
  registerMove('revenge', {
    onUse: (ctx) => {
      if ((ctx.attacker.volatile?.lastDamageTaken ?? 0) > 0) {
        ctx.moveData = { ...(ctx.moveData || {}), power: 120 };
        ctx.log.push(`${ctx.attacker.name} took revenge with doubled power!`);
      }
    },
  });
  registerMove('reversal', {
    onUse: (ctx) => {
      const ratio = ctx.attacker.hp / ctx.attacker.maxHp;
      const pwr = ratio > 0.6875 ? 20 : ratio > 0.3542 ? 40 : ratio > 0.2083 ? 80 : ratio > 0.1042 ? 100 : ratio > 0.0417 ? 150 : 200;
      ctx.moveData = { ...(ctx.moveData || {}), power: pwr };
      ctx.log.push(`Reversal's power is ${pwr}!`);
    },
  });
  registerMove('rock smash', {
    secondary: { stat: 'def', stages: -1, target: 'foe', chance: 50 },
  });
  registerMove('rolling kick', { flinchChance: 30 });
  registerMove('sacred sword', {
    onUse: (ctx) => { ctx.moveData = { ...(ctx.moveData || {}), ignoreStages: true }; },
  });
  registerMove('secret sword', {
    onUse: (ctx) => { ctx.moveData = { ...(ctx.moveData || {}), useDefDef: true }; },
  });
  MOVE_EFFECTS['seismic toss'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const dmg = 50;
      ctx.defender.hp = Math.max(0, ctx.defender.hp - dmg);
      if (ctx.defender.hp === 0) ctx.defender.fainted = true;
      ctx.log.push(`${ctx.defender.name} took ${dmg} damage from Seismic Toss!`);
      if (ctx.defender.fainted) ctx.log.push(`${ctx.defender.name} fainted!`);
      ctx.absorbed = true;
    },
  };
  registerMove('sky uppercut', {
    onUse: (ctx) => {
      if (ctx.defender.volatile?.vanished) {
        ctx.log.push(`${ctx.attacker.name} hit the airborne target!`);
      }
    },
  });
  registerMove('storm throw', {
    onUse: (ctx) => { ctx.moveData = { ...(ctx.moveData || {}), forceCrit: true }; },
  });
  registerMove('submission', { onHit: recoilEffect(0.25) });
  registerMove('superpower', {
    onHit: (ctx) => {
      statChange(ctx, 'atk', -1, 'self');
      statChange(ctx, 'def', -1, 'self');
    },
  });
  registerMove('triple kick', {
    onUse: (ctx) => {
      ctx.hitCount = 3;
      ctx.moveData = { ...(ctx.moveData || {}), escalatingPower: [10, 20, 30] };
      ctx.log.push(`${ctx.attacker.name} kicked three times!`);
    },
  });
  registerMove('vacuum wave', {
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} struck first with a vacuum wave! (Priority +1)`),
  });
  registerMove('vital throw', {
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} moved last but never misses!`),
  });
  registerMove('wake-up slap', {
    onUse: (ctx) => {
      if (ctx.defender.status === 'slp') {
        ctx.moveData = { ...(ctx.moveData || {}), power: 140 };
        ctx.log.push('Wake-Up Slap doubled in power against the sleeping target!');
      }
    },
    onHit: (ctx) => {
      if (ctx.defender.status === 'slp') {
        ctx.defender.status = 'none';
        ctx.log.push(`${ctx.defender.name} woke up!`);
      }
    },
  });
}
