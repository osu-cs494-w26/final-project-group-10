/*
 * movesPsychic.js Registers all PSYCHIC type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, inflictConfusion, drainEffect } from './movesHelper.js';

export function registerPsychicMoves() {
  MOVE_EFFECTS['agility'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'spd', 2, 'self'),
  };
  MOVE_EFFECTS['ally switch'] = {
    operational: true, power: null,
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} switched places with a teammate!`),
  };
  MOVE_EFFECTS['amnesia'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'spdef', 2, 'self'),
  };
  MOVE_EFFECTS['barrier'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'def', 2, 'self'),
  };
  MOVE_EFFECTS['calm mind'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'spatk', 1, 'self');
      statChange(ctx, 'spdef', 1, 'self');
    },
  };
  registerMove('confusion', {
    onHit: (ctx) => { if (Math.random() * 100 < 10) inflictConfusion(ctx, ctx.defender); },
  });
  MOVE_EFFECTS['cosmic power'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'def',   1, 'self');
      statChange(ctx, 'spdef', 1, 'self');
    },
  };
  registerMove('dream eater', {
    onUse: (ctx) => {
      if (ctx.defender.status !== 'slp') {
        ctx.log.push('But it failed! (target must be asleep)');
        ctx.absorbed = true;
      }
    },
    onHit: drainEffect(0.5),
  });
  registerMove('extrasensory', { flinchChance: 10 });
  registerMove('future sight', {
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} foresaw an attack!`),
  });
  MOVE_EFFECTS['gravity'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.fieldCondition = { ...(ctx.fieldCondition || {}), gravity: 5 };
      ctx.log.push('Gravity intensified!');
    },
  };
  MOVE_EFFECTS['guard split'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const avgDef   = Math.floor((ctx.attacker.def   + ctx.defender.def)   / 2);
      const avgSpDef = Math.floor((ctx.attacker.spdef + ctx.defender.spdef) / 2);
      ctx.attacker.def = ctx.defender.def = avgDef;
      ctx.attacker.spdef = ctx.defender.spdef = avgSpDef;
      ctx.log.push(`${ctx.attacker.name} shared its guard with ${ctx.defender.name}!`);
    },
  };
  MOVE_EFFECTS['guard swap'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const aDef = ctx.attacker.stages?.def ?? 0; const aSpDef = ctx.attacker.stages?.spdef ?? 0;
      const dDef = ctx.defender.stages?.def ?? 0; const dSpDef = ctx.defender.stages?.spdef ?? 0;
      if (!ctx.attacker.stages) ctx.attacker.stages = {};
      if (!ctx.defender.stages) ctx.defender.stages = {};
      ctx.attacker.stages.def = dDef; ctx.attacker.stages.spdef = dSpDef;
      ctx.defender.stages.def = aDef; ctx.defender.stages.spdef = aSpDef;
      ctx.log.push(`${ctx.attacker.name} swapped defensive stats with ${ctx.defender.name}!`);
    },
  };
  MOVE_EFFECTS['heal block'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.healBlock = 5;
      ctx.log.push(`${ctx.defender.name} was prevented from healing!`);
    },
  };
  MOVE_EFFECTS['heal pulse'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const heal = Math.floor(ctx.defender.maxHp * 0.5);
      ctx.defender.hp = Math.min(ctx.defender.maxHp, ctx.defender.hp + heal);
      ctx.log.push(`${ctx.defender.name} had its HP restored by ${heal}!`);
    },
  };
  MOVE_EFFECTS['healing wish'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.attacker.hp = 0; ctx.attacker.fainted = true;
      if (!ctx.attackerSide) ctx.attackerSide = {};
      ctx.attackerSide.healingWish = true;
      ctx.log.push(`${ctx.attacker.name} fainted! The next ally will be fully healed!`);
    },
  };
  registerMove('heart stamp', { flinchChance: 30 });
  MOVE_EFFECTS['heart swap'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const tmp = { ...(ctx.attacker.stages || {}) };
      ctx.attacker.stages = { ...(ctx.defender.stages || {}) };
      ctx.defender.stages = tmp;
      ctx.log.push(`${ctx.attacker.name} swapped stat changes with ${ctx.defender.name}!`);
    },
  };
  registerMove('hyperspace hole', {
    onUse: (ctx) => {
      if (ctx.defender.volatile?.protect) {
        delete ctx.defender.volatile.protect;
        ctx.log.push(`${ctx.attacker.name} broke through the protection!`);
      }
    },
  });
  MOVE_EFFECTS['hypnosis'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'none') { ctx.log.push('But it failed!'); return; }
      ctx.defender.status = 'slp';
      ctx.defender.sleepCounter = Math.floor(Math.random() * 3) + 1;
      ctx.log.push(`${ctx.defender.name} fell asleep!`);
    },
  };
  MOVE_EFFECTS['imprison'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.imprison = true;
      ctx.log.push(`${ctx.defender.name} was imprisoned and can't use shared moves!`);
    },
  };
  MOVE_EFFECTS['kinesis'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'acc', -1, 'foe'),
  };
  MOVE_EFFECTS['light screen'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attackerSide) ctx.attackerSide = {};
      ctx.attackerSide.lightScreen = 5;
      ctx.log.push('Light Screen raised the team\'s Special Defense!');
    },
  };
  MOVE_EFFECTS['lunar dance'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.attacker.hp = 0; ctx.attacker.fainted = true;
      if (!ctx.attackerSide) ctx.attackerSide = {};
      ctx.attackerSide.lunarDance = true;
      ctx.log.push(`${ctx.attacker.name} fainted! The next ally will be fully restored!`);
    },
  };
  registerMove('luster purge', {
    secondary: { stat: 'spdef', stages: -1, target: 'foe', chance: 50 },
  });
  MOVE_EFFECTS['magic coat'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.magicCoat = true;
      ctx.log.push(`${ctx.attacker.name} shrouded itself with Magic Coat!`);
    },
  };
  MOVE_EFFECTS['magic room'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.fieldCondition = { ...(ctx.fieldCondition || {}), magicRoom: 5 };
      ctx.log.push('A bizarre area was created where held items lose their effects!');
    },
  };
  MOVE_EFFECTS['meditate'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'atk', 1, 'self'),
  };
  MOVE_EFFECTS['miracle eye'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.miracleEye = true;
      if (ctx.defender.stages?.eva) ctx.defender.stages.eva = 0;
      ctx.log.push(`${ctx.defender.name}'s evasiveness was reset and Psychic immunity removed!`);
    },
  };
  MOVE_EFFECTS['mirror coat'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const last = ctx.attacker.volatile?.lastSpecialDamageTaken ?? 0;
      if (last <= 0) { ctx.log.push('But it failed!'); return; }
      const dmg = last * 2;
      ctx.defender.hp = Math.max(0, ctx.defender.hp - dmg);
      if (ctx.defender.hp === 0) ctx.defender.fainted = true;
      ctx.log.push(`${ctx.attacker.name} reflected ${dmg} damage back!`);
      if (ctx.defender.fainted) ctx.log.push(`${ctx.defender.name} fainted!`);
      ctx.absorbed = true;
    },
  };
  registerMove('mist ball', {
    secondary: { stat: 'spatk', stages: -1, target: 'foe', chance: 50 },
  });
  MOVE_EFFECTS['power split'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const avgAtk   = Math.floor((ctx.attacker.atk   + ctx.defender.atk)   / 2);
      const avgSpAtk = Math.floor((ctx.attacker.spatk + ctx.defender.spatk) / 2);
      ctx.attacker.atk = ctx.defender.atk = avgAtk;
      ctx.attacker.spatk = ctx.defender.spatk = avgSpAtk;
      ctx.log.push(`${ctx.attacker.name} shared its power with ${ctx.defender.name}!`);
    },
  };
  MOVE_EFFECTS['power swap'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const aAtk = ctx.attacker.stages?.atk ?? 0; const aSpatk = ctx.attacker.stages?.spatk ?? 0;
      const dAtk = ctx.defender.stages?.atk ?? 0; const dSpatk = ctx.defender.stages?.spatk ?? 0;
      if (!ctx.attacker.stages) ctx.attacker.stages = {};
      if (!ctx.defender.stages) ctx.defender.stages = {};
      ctx.attacker.stages.atk = dAtk; ctx.attacker.stages.spatk = dSpatk;
      ctx.defender.stages.atk = aAtk; ctx.defender.stages.spatk = aSpatk;
      ctx.log.push(`${ctx.attacker.name} swapped offensive stats with ${ctx.defender.name}!`);
    },
  };
  MOVE_EFFECTS['power trick'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const tmp = ctx.attacker.atk;
      ctx.attacker.atk = ctx.attacker.def;
      ctx.attacker.def = tmp;
      ctx.log.push(`${ctx.attacker.name} switched its Attack and Defense!`);
    },
  };
  registerMove('psybeam', {
    onHit: (ctx) => { if (Math.random() * 100 < 10) inflictConfusion(ctx, ctx.defender); },
  });
  registerMove('psychic', {
    secondary: { stat: 'spdef', stages: -1, target: 'foe', chance: 10 },
  });
  registerMove('psycho boost', {
    onHit: (ctx) => statChange(ctx, 'spatk', -2, 'self'),
  });
  registerMove('psycho cut', { highCrit: true });
  MOVE_EFFECTS['psycho shift'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.attacker.status === 'none' || ctx.defender.status !== 'none') {
        ctx.log.push('But it failed!'); return;
      }
      ctx.defender.status = ctx.attacker.status;
      if (ctx.attacker.status === 'slp') ctx.defender.sleepCounter = ctx.attacker.sleepCounter ?? 2;
      ctx.attacker.status = 'none';
      ctx.log.push(`${ctx.attacker.name} passed its status to ${ctx.defender.name}!`);
    },
  };
  ['psyshock', 'psystrike'].forEach(m => {
    registerMove(m, {
      onUse: (ctx) => { ctx.moveData = { ...(ctx.moveData || {}), useDefDef: true }; },
    });
  });
  MOVE_EFFECTS['psywave'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const dmg = Math.floor(Math.random() * 51) + 25;
      ctx.defender.hp = Math.max(0, ctx.defender.hp - dmg);
      if (ctx.defender.hp === 0) ctx.defender.fainted = true;
      ctx.log.push(`${ctx.defender.name} took ${dmg} damage from Psywave!`);
      if (ctx.defender.fainted) ctx.log.push(`${ctx.defender.name} fainted!`);
      ctx.absorbed = true;
    },
  };
  MOVE_EFFECTS['reflect'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attackerSide) ctx.attackerSide = {};
      ctx.attackerSide.reflect = 5;
      ctx.log.push('Reflect raised the team\'s Defense!');
    },
  };
  MOVE_EFFECTS['rest'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.attacker.hp = ctx.attacker.maxHp;
      ctx.attacker.status = 'slp';
      ctx.attacker.sleepCounter = 2;
      ctx.log.push(`${ctx.attacker.name} restored its HP and fell into a deep sleep!`);
    },
  };
  MOVE_EFFECTS['role play'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.attacker.ability = ctx.defender.ability;
      ctx.log.push(`${ctx.attacker.name} copied ${ctx.defender.name}'s ${ctx.defender.ability}!`);
    },
  };
  MOVE_EFFECTS['skill swap'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const tmp = ctx.attacker.ability;
      ctx.attacker.ability = ctx.defender.ability;
      ctx.defender.ability = tmp;
      ctx.log.push(`${ctx.attacker.name} swapped abilities with ${ctx.defender.name}!`);
    },
  };
  registerMove('stored power', {
    onUse: (ctx) => {
      const boosts = Object.values(ctx.attacker.stages || {}).filter(v => v > 0).reduce((a, b) => a + b, 0);
      const pwr = 20 + boosts * 20;
      ctx.moveData = { ...(ctx.moveData || {}), power: pwr };
      ctx.log.push(`Stored Power's power is ${pwr}!`);
    },
  });
  registerMove('synchronoise', {
    onUse: (ctx) => {
      const shared = ctx.attacker.types?.some(t => ctx.defender.types?.includes(t));
      if (!shared) { ctx.log.push('But it failed! (no shared type)'); ctx.absorbed = true; }
    },
  });
  MOVE_EFFECTS['telekinesis'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.telekinesis = 3;
      ctx.log.push(`${ctx.defender.name} was hurled into the air!`);
    },
  };
  MOVE_EFFECTS['teleport'] = {
    operational: true, power: null,
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} teleported away!`),
  };
  MOVE_EFFECTS['trick'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const tmp = ctx.attacker.item;
      ctx.attacker.item = ctx.defender.item;
      ctx.defender.item = tmp;
      ctx.log.push(`${ctx.attacker.name} swapped items with ${ctx.defender.name}!`);
    },
  };
  MOVE_EFFECTS['trick room'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.fieldCondition = { ...(ctx.fieldCondition || {}), trickRoom: 5 };
      ctx.log.push('The dimensions were twisted! Slower Pokémon move first!');
    },
  };
  MOVE_EFFECTS['wonder room'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.fieldCondition = { ...(ctx.fieldCondition || {}), wonderRoom: 5 };
      ctx.log.push('Defense and Special Defense were swapped for all Pokémon!');
    },
  };
  registerMove('zen headbutt', { flinchChance: 20 });
}
