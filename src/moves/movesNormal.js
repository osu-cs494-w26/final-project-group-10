/*
 * movesNormal.js Registers all NORMAL type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange, inflictConfusion, secondaryStatus, recoilEffect } from './movesHelper.js';

export function registerNormalMoves() {
  registerMove('cut');
  registerMove('egg bomb');
  registerMove('horn attack');
  registerMove('hyper voice');
  registerMove('mega kick');
  registerMove('mega punch');
  registerMove('pound');
  registerMove('scratch');
  registerMove('slam');
  registerMove('strength');
  registerMove('tackle');
  registerMove('vise grip');
  const multiHit = (ctx) => {
    const roll = Math.random();
    ctx.hitCount = roll < 0.333 ? 2 : roll < 0.667 ? 3 : roll < 0.833 ? 4 : 5;
  };
  registerMove('barrage',      { onUse: multiHit });
  registerMove('comet punch',  { onUse: multiHit });
  registerMove('double slap',  { onUse: multiHit });
  registerMove('fury attack',  { onUse: multiHit });
  registerMove('fury swipes',  { onUse: multiHit });
  registerMove('spike cannon', { onUse: multiHit });
  registerMove('tail slap',    { onUse: multiHit });
  registerMove('double hit', { onUse: (ctx) => { ctx.hitCount = 2; } });
  registerMove('extreme speed', { onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} struck first! (Priority +2)`) });
  registerMove('fake out', {
    onUse: (ctx) => {
      if (ctx.attacker.volatile?.fakOutUsed) { ctx.log.push('But it failed! (only works on first turn)'); ctx.absorbed = true; return; }
      ctx.attacker.volatile = { ...(ctx.attacker.volatile || {}), fakOutUsed: true };
      ctx.log.push(`${ctx.attacker.name} struck first!`);
    },
    flinchChance: 100,
  });
  registerMove('quick attack', { onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} struck first! (Priority +1)`) });
  registerMove('razor wind',  { highCrit: true });
  registerMove('slash',       { highCrit: true });
  registerMove('headbutt',   { flinchChance: 30 });
  registerMove('hyper fang', { flinchChance: 10 });
  registerMove('stomp',      { flinchChance: 30 });
  registerMove('double-edge',  { onHit: recoilEffect(1 / 3) });
  registerMove('head charge',  { onHit: recoilEffect(1 / 4) });
  registerMove('take down',    { onHit: recoilEffect(0.25) });
  registerMove('dizzy punch',  { onHit: (ctx) => { if (Math.random() * 100 < 20) inflictConfusion(ctx, ctx.defender); } });
  registerMove('rock climb',   { onHit: (ctx) => { if (Math.random() * 100 < 20) inflictConfusion(ctx, ctx.defender); } });
  registerMove('body slam',    { onHit: (ctx) => secondaryStatus(ctx, 'par', 30) });
  registerMove('tri attack', {
    onHit: (ctx) => {
      const roll = Math.random() * 100;
      if (roll < 6.67) secondaryStatus(ctx, 'par', 100);
      else if (roll < 13.33) secondaryStatus(ctx, 'brn', 100);
      else if (roll < 20) secondaryStatus(ctx, 'frz', 100);
    },
  });
  registerMove('constrict',   { secondary: { stat: 'spd', stages: -1, target: 'foe', chance: 10 } });
  registerMove('crush claw',  { secondary: { stat: 'def', stages: -1, target: 'foe', chance: 50 } });
  registerMove('chip away',   { onUse: (ctx) => { ctx.moveData = { ...(ctx.moveData || {}), ignoreStages: true }; } });
  registerMove('covet', {
    onHit: (ctx) => {
      if (!ctx.attacker.item && ctx.defender.item) {
        ctx.attacker.item = ctx.defender.item; ctx.defender.item = null;
        ctx.log.push(`${ctx.attacker.name} stole ${ctx.defender.name}'s ${ctx.attacker.item?.name || ctx.attacker.item}!`);
      }
    },
  });
  MOVE_EFFECTS['sonic boom'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.defender.hp = Math.max(0, ctx.defender.hp - 20);
      if (ctx.defender.hp === 0) ctx.defender.fainted = true;
      ctx.log.push(`${ctx.defender.name} took 20 damage from Sonic Boom!`);
      if (ctx.defender.fainted) ctx.log.push(`${ctx.defender.name} fainted!`);
      ctx.absorbed = true;
    },
  };
  MOVE_EFFECTS['super fang'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const dmg = Math.max(1, Math.floor(ctx.defender.hp / 2));
      ctx.defender.hp = Math.max(1, ctx.defender.hp - dmg);
      ctx.log.push(`${ctx.defender.name} lost half its HP (${dmg}) from Super Fang!`);
      ctx.absorbed = true;
    },
  };
  MOVE_EFFECTS['wring out'] = {
    operational: true,
    onUse: (ctx) => {
      const ratio = ctx.defender.hp / ctx.defender.maxHp;
      ctx.moveData = { ...(ctx.moveData || {}), power: Math.max(1, Math.floor(120 * ratio)) };
      ctx.log.push(`Wring Out's power is ${ctx.moveData.power}!`);
    },
  };
  MOVE_EFFECTS['crush grip'] = {
    operational: true,
    onUse: (ctx) => {
      const ratio = ctx.defender.hp / ctx.defender.maxHp;
      ctx.moveData = { ...(ctx.moveData || {}), power: Math.max(1, Math.floor(120 * ratio)) };
      ctx.log.push(`Crush Grip's power is ${ctx.moveData.power}!`);
    },
  };
  MOVE_EFFECTS['endeavor'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.attacker.hp >= ctx.defender.hp) { ctx.log.push('But it failed!'); return; }
      ctx.defender.hp = ctx.attacker.hp;
      ctx.log.push(`${ctx.defender.name}'s HP was reduced to ${ctx.attacker.hp}!`);
      ctx.absorbed = true;
    },
  };
  const lowHpPower = (ctx) => {
    const ratio = ctx.attacker.hp / ctx.attacker.maxHp;
    const pwr = ratio > 0.6875 ? 20 : ratio > 0.3542 ? 40 : ratio > 0.2083 ? 80 : ratio > 0.1042 ? 100 : ratio > 0.0417 ? 150 : 200;
    ctx.moveData = { ...(ctx.moveData || {}), power: pwr };
    ctx.log.push(`${MOVE_EFFECTS[ctx.moveName ?? 'flail'] ? ctx.moveName : 'Move'}'s power is ${pwr}!`);
  };
  registerMove('flail',       { onUse: lowHpPower });
  registerMove('frustration', { onUse: (ctx) => { ctx.moveData = { ...(ctx.moveData || {}), power: 102 }; } });
  registerMove('return',      { onUse: (ctx) => { ctx.moveData = { ...(ctx.moveData || {}), power: 102 }; } });
  registerMove('trump card');
  ['self-destruct', 'explosion'].forEach(m => {
    MOVE_EFFECTS[m] = {
      operational: true,
      onUse: (ctx) => {
        ctx.attacker.hp = 0; ctx.attacker.fainted = true;
        ctx.moveData = { ...(ctx.moveData || {}), power: m === 'explosion' ? 250 : 200 };
        ctx.log.push(`${ctx.attacker.name} exploded!`);
      },
    };
  });
  ['guillotine', 'horn drill'].forEach(m => {
    MOVE_EFFECTS[m] = {
      operational: true, power: null,
      onUse: (ctx) => {
        if (Math.random() * 100 >= 30) { ctx.log.push(`${m === 'guillotine' ? 'Guillotine' : 'Horn Drill'} missed!`); return; }
        ctx.defender.hp = 0; ctx.defender.fainted = true;
        ctx.log.push(`A one-hit KO!`);
        if (ctx.defender.fainted) ctx.log.push(`${ctx.defender.name} fainted!`);
        ctx.absorbed = true;
      },
    };
  });
  registerMove('skull bash', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      if (!ctx.attacker.volatile.skullBashCharging) {
        ctx.attacker.volatile.skullBashCharging = true;
        ctx.attacker.volatile.lockedMove        = 'skull bash';
        statChange(ctx, 'def', 1, 'self');
        ctx.log.push(`${ctx.attacker.name} tucked in its head!`);
        ctx.absorbed = true;
      } else {
        delete ctx.attacker.volatile.skullBashCharging;
        delete ctx.attacker.volatile.lockedMove;
      }
    },
  });
  registerMove('razor wind', {
    highCrit: true,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      if (!ctx.attacker.volatile.razorWindCharging) {
        ctx.attacker.volatile.razorWindCharging = true;
        ctx.attacker.volatile.lockedMove        = 'razor wind';
        ctx.log.push(`${ctx.attacker.name} whipped up a razor wind!`);
        ctx.absorbed = true;
      } else {
        delete ctx.attacker.volatile.razorWindCharging;
        delete ctx.attacker.volatile.lockedMove;
      }
    },
  });
  MOVE_EFFECTS['bide'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      if (ctx.attacker.volatile.bideTurns === undefined) {
        ctx.attacker.volatile.bideTurns = 2;
        ctx.attacker.volatile.bideDmg   = 0;
        ctx.log.push(`${ctx.attacker.name} is biding its time!`);
        ctx.absorbed = true;
      } else if (ctx.attacker.volatile.bideTurns > 0) {
        ctx.attacker.volatile.bideTurns--;
        ctx.log.push(`${ctx.attacker.name} is storing energy!`);
        ctx.absorbed = true;
      } else {
        const dmg = (ctx.attacker.volatile.bideDmg ?? 0) * 2;
        delete ctx.attacker.volatile.bideTurns;
        delete ctx.attacker.volatile.bideDmg;
        if (dmg === 0) { ctx.log.push('But it failed!'); return; }
        ctx.defender.hp = Math.max(0, ctx.defender.hp - dmg);
        if (ctx.defender.hp === 0) ctx.defender.fainted = true;
        ctx.log.push(`${ctx.attacker.name} unleashed energy! ${dmg} damage!`);
        if (ctx.defender.fainted) ctx.log.push(`${ctx.defender.name} fainted!`);
        ctx.absorbed = true;
      }
    },
  };
  registerMove('thrash', {
    onHit: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      const turns = ctx.attacker.volatile.thrashLeft;
      if (turns === undefined) { ctx.attacker.volatile.thrashLeft = Math.floor(Math.random() * 2) + 1; }
      else if (turns <= 0) { delete ctx.attacker.volatile.thrashLeft; inflictConfusion(ctx, ctx.attacker); }
      else { ctx.attacker.volatile.thrashLeft--; }
    },
  });
  registerMove('uproar', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      const turns = ctx.attacker.volatile.uproarLeft;
      if (turns === undefined) ctx.attacker.volatile.uproarLeft = 2;
      else if (turns > 0) ctx.attacker.volatile.uproarLeft--;
      else delete ctx.attacker.volatile.uproarLeft;
      ctx.fieldCondition = { ...(ctx.fieldCondition || {}), uproar: true };
    },
  });
  ['bind', 'wrap'].forEach(m => {
    registerMove(m, {
      onHit: (ctx) => {
        if (!ctx.defender.volatile) ctx.defender.volatile = {};
        ctx.defender.volatile.trapped = Math.floor(Math.random() * 2) + 4;
        ctx.defender.volatile.trapDmg  = Math.floor(ctx.defender.maxHp / 8);
        ctx.log.push(`${ctx.defender.name} was ${m === 'bind' ? 'bound' : 'wrapped'}!`);
      },
    });
  });
  const selfHeal = (ratio) => ({
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile?.healBlock) {
        const heal = Math.floor(ctx.attacker.maxHp * ratio);
        ctx.attacker.hp = Math.min(ctx.attacker.maxHp, ctx.attacker.hp + heal);
        ctx.log.push(`${ctx.attacker.name} restored ${heal} HP!`);
      } else { ctx.log.push('But healing is blocked!'); }
    },
  });
  MOVE_EFFECTS['milk drink']   = selfHeal(0.5);
  MOVE_EFFECTS['recover']      = selfHeal(0.5);
  MOVE_EFFECTS['slack off']    = selfHeal(0.5);
  MOVE_EFFECTS['soft-boiled']  = selfHeal(0.5);
  MOVE_EFFECTS['wish'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attackerSide) ctx.attackerSide = {};
      ctx.attackerSide.wish = { turns: 1, hp: Math.floor(ctx.attacker.maxHp / 2) };
      ctx.log.push(`${ctx.attacker.name} made a wish!`);
    },
  };
  MOVE_EFFECTS['acupressure'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const stats = ['atk', 'def', 'spatk', 'spdef', 'spd', 'acc', 'eva'];
      const s = stats[Math.floor(Math.random() * stats.length)];
      statChange(ctx, s, 2, 'self');
    },
  };
  MOVE_EFFECTS['defense curl']   = { operational: true, power: null, onUse: (ctx) => { statChange(ctx, 'def', 1, 'self'); if (!ctx.attacker.volatile) ctx.attacker.volatile = {}; ctx.attacker.volatile.defenseCurl = true; } };
  MOVE_EFFECTS['double team']    = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'eva', 1, 'self') };
  MOVE_EFFECTS['focus energy']   = { operational: true, power: null, onUse: (ctx) => { if (!ctx.attacker.volatile) ctx.attacker.volatile = {}; ctx.attacker.volatile.focusEnergy = true; ctx.log.push(`${ctx.attacker.name} is getting pumped!`); } };
  MOVE_EFFECTS['growth']         = { operational: true, power: null, onUse: (ctx) => { statChange(ctx, 'atk', 1, 'self'); statChange(ctx, 'spatk', 1, 'self'); } };
  MOVE_EFFECTS['harden']         = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'def', 1, 'self') };
  MOVE_EFFECTS['howl']           = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'atk', 1, 'self') };
  MOVE_EFFECTS['minimize']       = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'eva', 2, 'self') };
  MOVE_EFFECTS['sharpen']        = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'atk', 1, 'self') };
  MOVE_EFFECTS['swords dance']   = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'atk', 2, 'self') };
  MOVE_EFFECTS['work up']        = { operational: true, power: null, onUse: (ctx) => { statChange(ctx, 'atk', 1, 'self'); statChange(ctx, 'spatk', 1, 'self'); } };
  MOVE_EFFECTS['shell smash'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      statChange(ctx, 'atk',   2, 'self'); statChange(ctx, 'spatk', 2, 'self');
      statChange(ctx, 'spd',   2, 'self'); statChange(ctx, 'def',  -1, 'self');
      statChange(ctx, 'spdef',-1, 'self');
    },
  };
  registerMove('rage', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.raging = true;
    },
  });
  registerMove('echoed voice', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      const n = ctx.attacker.volatile.echoedVoice || 0;
      ctx.attacker.volatile.echoedVoice = Math.min(n + 1, 4);
      ctx.moveData = { ...(ctx.moveData || {}), power: 40 * (n + 1) };
    },
  });
  registerMove('round');
  MOVE_EFFECTS['captivate']   = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'spatk', -2, 'foe') };
  MOVE_EFFECTS['confide']     = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'spatk', -1, 'foe') };
  MOVE_EFFECTS['flash']       = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'acc',   -1, 'foe') };
  MOVE_EFFECTS['growl']       = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'atk',   -1, 'foe') };
  MOVE_EFFECTS['leer']        = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'def',   -1, 'foe') };
  MOVE_EFFECTS['noble roar']  = { operational: true, power: null, onUse: (ctx) => { statChange(ctx, 'atk', -1, 'foe'); statChange(ctx, 'spatk', -1, 'foe'); } };
  MOVE_EFFECTS['play nice']   = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'atk',   -1, 'foe') };
  MOVE_EFFECTS['scary face']  = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'spd',   -2, 'foe') };
  MOVE_EFFECTS['screech']     = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'def',   -2, 'foe') };
  MOVE_EFFECTS['smokescreen'] = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'acc',   -1, 'foe') };
  MOVE_EFFECTS['sweet scent'] = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'eva',   -1, 'foe') };
  MOVE_EFFECTS['tail whip']   = { operational: true, power: null, onUse: (ctx) => statChange(ctx, 'def',   -1, 'foe') };
  MOVE_EFFECTS['tickle']      = { operational: true, power: null, onUse: (ctx) => { statChange(ctx, 'atk', -1, 'foe'); statChange(ctx, 'def', -1, 'foe'); } };
  const putToSleep = (ctx) => {
    if (ctx.defender.status !== 'none') { ctx.log.push('But it failed!'); return; }
    if (ctx.fieldCondition?.electricTerrain) { ctx.log.push('Electric Terrain prevents sleep!'); return; }
    ctx.defender.status = 'slp';
    ctx.defender.sleepCounter = Math.floor(Math.random() * 3) + 1;
    ctx.log.push(`${ctx.defender.name} fell asleep!`);
  };
  MOVE_EFFECTS['lovely kiss'] = { operational: true, power: null, onUse: putToSleep };
  MOVE_EFFECTS['sing']        = { operational: true, power: null, onUse: putToSleep };
  MOVE_EFFECTS['relic song']  = { operational: true,
    onHit: (ctx) => { if (Math.random() * 100 < 10) putToSleep(ctx); } };
  MOVE_EFFECTS['yawn'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.yawn = 1;
      ctx.log.push(`${ctx.defender.name} grew drowsy!`);
    },
  };
  MOVE_EFFECTS['supersonic']    = { operational: true, power: null, onUse: (ctx) => inflictConfusion(ctx, ctx.defender) };
  MOVE_EFFECTS['swagger']       = { operational: true, power: null, onUse: (ctx) => { statChange(ctx, 'atk', 2, 'foe'); inflictConfusion(ctx, ctx.defender); } };
  MOVE_EFFECTS['glare'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'none') { ctx.log.push('But it failed!'); return; }
      ctx.defender.status = 'par';
      ctx.log.push(`${ctx.defender.name} was paralyzed!`);
    },
  };
  MOVE_EFFECTS['block']     = { operational: true, power: null, onUse: (ctx) => { if (!ctx.defender.volatile) ctx.defender.volatile = {}; ctx.defender.volatile.trapped = 999; ctx.log.push(`${ctx.defender.name} can't escape!`); } };
  MOVE_EFFECTS['mean look'] = { operational: true, power: null, onUse: (ctx) => { if (!ctx.defender.volatile) ctx.defender.volatile = {}; ctx.defender.volatile.trapped = 999; ctx.log.push(`${ctx.defender.name} can't escape!`); } };
  ['roar', 'whirlwind'].forEach(m => {
    MOVE_EFFECTS[m] = { operational: true, power: null, onUse: (ctx) => { ctx.forceSwitch = 'defender'; ctx.log.push(`${ctx.defender.name} was blown away!`); } };
  });
  MOVE_EFFECTS['protect'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.protect = true;
      ctx.log.push(`${ctx.attacker.name} protected itself!`);
    },
  };
  MOVE_EFFECTS['endure'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      ctx.attacker.volatile.endure = true;
      ctx.log.push(`${ctx.attacker.name} braced itself!`);
    },
  };
  registerMove('false swipe', {
    onHit: (ctx) => {
      if (ctx.defender.hp <= 0) { ctx.defender.hp = 1; ctx.defender.fainted = false; }
    },
  });
  MOVE_EFFECTS['feint'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.volatile?.protect) { ctx.log.push('But it failed!'); return; }
      delete ctx.defender.volatile.protect;
      const dmg = 30;
      ctx.defender.hp = Math.max(0, ctx.defender.hp - dmg);
      if (ctx.defender.hp === 0) ctx.defender.fainted = true;
      ctx.log.push(`${ctx.attacker.name} broke through the protection for ${dmg} damage!`);
      if (ctx.defender.fainted) ctx.log.push(`${ctx.defender.name} fainted!`);
      ctx.absorbed = true;
    },
  };
  MOVE_EFFECTS['after you'] = { operational: true, power: null, onUse: (ctx) => ctx.log.push(`${ctx.defender.name} was given priority this turn!`) };
  MOVE_EFFECTS['assist']    = { operational: true, power: null, onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} called out a random ally move!`) };
  MOVE_EFFECTS['attract']   = { operational: true, power: null, onUse: (ctx) => { if (!ctx.defender.volatile) ctx.defender.volatile = {}; ctx.defender.volatile.infatuated = true; ctx.log.push(`${ctx.defender.name} fell in love!`); } };
  MOVE_EFFECTS['baton pass'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.forceSwitch = 'attacker';
      ctx.attackerSide = { ...(ctx.attackerSide || {}), batonPassStages: { ...(ctx.attacker.stages || {}) } };
      ctx.log.push(`${ctx.attacker.name} passed its stat changes to the next Pokémon!`);
    },
  };

  MOVE_EFFECTS['belly drum'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const cost = Math.floor(ctx.attacker.maxHp * 0.5);
      if (ctx.attacker.hp <= cost) { ctx.log.push('But it failed!'); return; }
      ctx.attacker.hp -= cost;
      if (!ctx.attacker.stages) ctx.attacker.stages = {};
      ctx.attacker.stages.atk = 6;
      ctx.log.push(`${ctx.attacker.name} maxed its Attack at the cost of half its HP!`);
    },
  };

  MOVE_EFFECTS['bestow'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.attacker.item || ctx.defender.item) { ctx.log.push('But it failed!'); return; }
      ctx.defender.item = ctx.attacker.item; ctx.attacker.item = null;
      ctx.log.push(`${ctx.attacker.name} gave its item to ${ctx.defender.name}!`);
    },
  };

  MOVE_EFFECTS['celebrate']    = { operational: true, power: null, onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} is celebrating! 🎉`) };
  MOVE_EFFECTS['copycat']      = { operational: true, power: null, onUse: (ctx) => { const last = ctx.defender.volatile?.lastMove; if (!last) { ctx.log.push('But it failed!'); return; } ctx.mirrorMove = last; ctx.log.push(`${ctx.attacker.name} copied ${last}!`); } };

  MOVE_EFFECTS['disable'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const last = ctx.defender.volatile?.lastMove;
      if (!last) { ctx.log.push('But it failed!'); return; }
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.disabled = { move: last, turns: 4 };
      ctx.log.push(`${ctx.defender.name}'s ${last} was disabled!`);
    },
  };

  MOVE_EFFECTS['encore'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const last = ctx.defender.volatile?.lastMove;
      if (!last) { ctx.log.push('But it failed!'); return; }
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.encore = { move: last, turns: 3 };
      ctx.log.push(`${ctx.defender.name} was forced to use ${last} again!`);
    },
  };


  MOVE_EFFECTS['odor sleuth'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.identified = true;
      ctx.log.push(`${ctx.defender.name} was identified! Ghost immunity to Normal/Fighting removed.`);
    },
  };

  MOVE_EFFECTS['lucky chant']   = { operational: true, power: null, onUse: (ctx) => { if (!ctx.attackerSide) ctx.attackerSide = {}; ctx.attackerSide.luckyChant = 5; ctx.log.push('The Lucky Chant shielded the team from critical hits!'); } };
  MOVE_EFFECTS['me first']      = { operational: true, power: null, onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} used the foe's move with 1.5× power!`) };
  MOVE_EFFECTS['metronome']     = { operational: true, power: null, onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} waggled a finger and used a random move!`) };
  MOVE_EFFECTS['mimic']         = { operational: true, power: null, onUse: (ctx) => { const last = ctx.defender.volatile?.lastMove; if (!last) { ctx.log.push('But it failed!'); return; } ctx.log.push(`${ctx.attacker.name} mimicked ${last}!`); } };
  MOVE_EFFECTS['psych up']      = { operational: true, power: null, onUse: (ctx) => { ctx.attacker.stages = { ...(ctx.defender.stages || {}) }; ctx.log.push(`${ctx.attacker.name} copied the foe's stat changes!`); } };
  MOVE_EFFECTS['rapid spin']    = { operational: true, onUse: (ctx) => { statChange(ctx, 'spd', 1, 'self'); if (ctx.attackerSide) { ctx.attackerSide.spikes = 0; ctx.attackerSide.stealthRock = false; ctx.attackerSide.toxicSpikes = 0; ctx.attackerSide.stickyWeb = false; } ctx.log.push(`${ctx.attacker.name} spun away hazards and raised its Speed!`); } };
  MOVE_EFFECTS['refresh']       = { operational: true, power: null, onUse: (ctx) => { if (['psn', 'tox', 'par', 'brn'].includes(ctx.attacker.status)) { ctx.attacker.status = 'none'; ctx.log.push(`${ctx.attacker.name}'s status was cured!`); } else { ctx.log.push('But it failed!'); } } };
  MOVE_EFFECTS['retaliate']     = { operational: true, onUse: (ctx) => { const pwr = ctx.attackerSide?.teamFaintedLastTurn ? 140 : 70; ctx.moveData = { ...(ctx.moveData || {}), power: pwr }; if (pwr === 140) ctx.log.push('Retaliate doubled in power!'); } };
  MOVE_EFFECTS['safeguard']     = { operational: true, power: null, onUse: (ctx) => { if (!ctx.attackerSide) ctx.attackerSide = {}; ctx.attackerSide.safeguard = 5; ctx.log.push(`${ctx.attacker.name}'s team is protected from status!`); } };
  MOVE_EFFECTS['sleep talk']    = { operational: true, power: null, onUse: (ctx) => { if (ctx.attacker.status !== 'slp') { ctx.log.push('But it failed!'); return; } ctx.log.push(`${ctx.attacker.name} used a random move while sleeping!`); } };
  MOVE_EFFECTS['smelling salts'] = { operational: true, onUse: (ctx) => { const doubled = ctx.defender.status === 'par'; ctx.moveData = { ...(ctx.moveData || {}), power: doubled ? 140 : 70 }; if (doubled) { ctx.defender.status = 'none'; ctx.log.push('Smelling Salts doubled in power and cured paralysis!'); } } };
  MOVE_EFFECTS['snore']         = { operational: true, onUse: (ctx) => { if (ctx.attacker.status !== 'slp') { ctx.log.push('But it failed!'); ctx.absorbed = true; return; } }, flinchChance: 30 };
  MOVE_EFFECTS['splash']        = { operational: true, power: null, onUse: (ctx) => ctx.log.push('But nothing happened!') };
  MOVE_EFFECTS['swift']         = { operational: true, onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} fired a swift star!`) };
  MOVE_EFFECTS['transform']     = { operational: true, power: null, onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} transformed into ${ctx.defender.name}!`) };
  registerMove('facade', {
    onUse: (ctx) => {
      if (['brn', 'psn', 'tox', 'par'].includes(ctx.attacker.status)) {
        ctx.moveData = { ...(ctx.moveData || {}), power: 140 };
        ctx.log.push('Facade doubled in power due to the status condition!');
      }
    },
  });
  MOVE_EFFECTS['struggle'] = {
    operational: true,
    onHit: (ctx) => {
      const recoil = Math.floor(ctx.attacker.maxHp / 4);
      ctx.attacker.hp = Math.max(0, ctx.attacker.hp - recoil);
      if (ctx.attacker.hp === 0) ctx.attacker.fainted = true;
      ctx.log.push(`${ctx.attacker.name} was hurt by recoil! (${recoil} HP)`);
    },
  };
}
