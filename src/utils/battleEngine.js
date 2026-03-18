/*
 * battleEngine.js Pure battle logic with no React or fetch.
 * Handles stat calculation, damage formula, type chart, move execution,
 * status effects, and the battler factory. All functions are side-agnostic.
 */

// All battles run at a fixed level 50.
export const BATTLE_LEVEL = 50;

export const STATUS = {
  NONE: 'none', BRN: 'brn', PSN: 'psn',
  PAR:  'par',  SLP: 'slp', FRZ: 'frz', TOX: 'tox',
};
export const STATUS_LABELS = {
  brn: 'BRN', psn: 'PSN', par: 'PAR',
  slp: 'SLP', frz: 'FRZ', tox: 'TOX', none: '',
};

export function calcHPStat(base, ev = 0, iv = 31)     {
  return Math.floor((2 * base + iv + Math.floor(ev / 4)) * BATTLE_LEVEL / 100) + BATTLE_LEVEL + 10;
}
export function calcBattleStat(base, ev = 0, iv = 31) {
  return Math.floor((2 * base + iv + Math.floor(ev / 4)) * BATTLE_LEVEL / 100) + 5;
}

// Type effectiveness multipliers.
export const TYPE_CHART = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

// Returns the combined type multiplier for a move against a defender.
export function getTypeEffectiveness(moveType, defTypes) {
  if (!moveType || !defTypes?.length) return 1;
  return defTypes.reduce((m, t) => m * (TYPE_CHART[moveType]?.[t] ?? 1), 1);
}

// Returns the flavour text for a type effectiveness result.
export function effectivenessLabel(mult) {
  if (mult === 0)  return "It had no effect!";
  if (mult >= 2)   return "It's super effective!";
  if (mult <= 0.5) return "It's not very effective...";
  return '';
}

// Stat stage multipliers from −6 to +6.
const STAGE_TABLE = {
  '-6': 0.25, '-5': 0.333, '-4': 0.4, '-3': 0.5, '-2': 0.6, '-1': 0.75,
  '0': 1, '1': 1.333, '2': 1.5, '3': 2, '4': 2.5, '5': 3, '6': 4,
};
export function stageMultiplier(stage) {
  return STAGE_TABLE[String(Math.max(-6, Math.min(6, stage ?? 0)))] ?? 1;
}

// Returns a battler's effective stat after stage modifiers and status.
export function getStat(battler, statName) {
  const base  = battler[statName] ?? 45;
  const stage = battler.stages?.[statName] ?? 0;
  let val = base * stageMultiplier(stage);
  if (statName === 'atk' && battler.status === 'brn') val *= 0.5;
  if (statName === 'spd' && battler.status === 'par') val *= 0.5;
  return Math.max(1, Math.floor(val));
}

// Runs the Gen 3–5 damage formula including STAB, type, weather, and crit.
export function calcDamage(attacker, defender, moveData, weather = 'none') {
  if (!moveData?.power) return { damage: 0, typeEff: 1, isCrit: false };
  const typeEff = getTypeEffectiveness(moveData.type, defender.types);
  if (typeEff === 0) return { damage: 0, typeEff: 0, isCrit: false }; // full immunity
  const L      = BATTLE_LEVEL;
  const isSpec = moveData.category === 'special';
  const atk    = isSpec ? getStat(attacker, 'spatk') : getStat(attacker, 'atk');
  const def    = isSpec ? getStat(defender, 'spdef') : getStat(defender, 'def');
  const stab   = (attacker.types || []).includes(moveData.type) ? 1.5 : 1;
  const wMod   = getWeatherMod(moveData.type, weather);
  const critRate = moveData._alwaysCrit ? 1 : moveData.highCrit ? 0.125 : 0.0625;
  const isCrit = moveData._alwaysCrit || (!defender.volatile?.luckyChant && Math.random() < critRate);
  const rand   = (Math.floor(Math.random() * 16) + 85) / 100;
  const damage = Math.max(1, Math.floor(
    (((2 * L / 5 + 2) * moveData.power * atk / def) / 50 + 2) * stab * typeEff * wMod * (isCrit ? 1.5 : 1) * rand
  ));
  return { damage, typeEff, isCrit };
}

// Returns the weather damage modifier for fire and water moves.
export function getWeatherMod(moveType, weather) {
  if (weather === 'sun')  { if (moveType === 'fire')  return 1.5; if (moveType === 'water') return 0.5; }
  if (weather === 'rain') { if (moveType === 'water') return 1.5; if (moveType === 'fire')  return 0.5; }
  return 1;
}

// Reduces a battler's HP and marks it fainted if HP hits zero.
export function applyDamage(battler, amount) {
  battler.hp = Math.max(0, battler.hp - Math.max(0, Math.floor(amount)));
  if (battler.hp === 0) battler.fainted = true;
}

// Returns true if sideA goes first. Fully generic no player/ai references.
// Determines turn order based on speed and move priority.
export function sideAGoesFirst(sideA, sideB, moveDataA, moveDataB) {
  const pa = moveDataA?.priority ?? 0, pb = moveDataB?.priority ?? 0;
  if (pa !== pb) return pa > pb;
  const sa = getStat(sideA, 'spd'), sb = getStat(sideB, 'spd');
  if (sa !== sb) return sa > sb;
  return Math.random() < 0.5;
}

// Returns true if a move lands, accounting for accuracy/evasion stages.
export function accuracyCheck(moveData, attacker, defender, ignoreAccEva = false) {
  if (!moveData || moveData.accuracy == null) return true;
  if (attacker?.volatile?.lockOn) {
    delete attacker.volatile.lockOn; // one-time use
    return true;
  }
  // ignoreAccEva: move ignores accuracy/evasion stage changes (Shadow Punch, Feint Attack, etc.)
  if (ignoreAccEva) return Math.random() * 100 < moveData.accuracy;
  // Apply accuracy/evasion stage modifiers
  const accStage = (attacker?.stages?.acc ?? 0) - (defender?.stages?.eva ?? 0);
  const accMult  = stageMultiplier(accStage);
  return Math.random() * 100 < (moveData.accuracy * accMult);
}

// Picks the best move for an AI battler based on type effectiveness.
export function aiChooseMove(ai, opponent, moveDataMap) {
  const available = (ai.moves || []).filter(m => (ai.pp?.[m] ?? 0) > 0);
  if (!available.length) return '__struggle__';
  let best = available[0], bestScore = -Infinity;
  for (const m of available) {
    const md = moveDataMap[m];
    if (!md?.power) continue;
    const score = md.power
      * getTypeEffectiveness(md.type, opponent.types)
      * ((ai.types || []).includes(md.type) ? 1.5 : 1);
    if (score > bestScore) { bestScore = score; best = m; }
  }
  return best;
}

// Returns { logs[], defHpAfter, atkHpAfter, defFainted, atkFainted }
// Resolves a single move: accuracy check, damage, effects, and log messages.
export function executeMove(attacker, defender, moveName, moveDataMap, weather, MOVE_EFFECTS, extraCtx = {}) {
  const logs = [];

  // Struggle fallback
  if (moveName === '__struggle__') {
    logs.push(`${attacker.name} used Struggle!`);
    applyDamage(defender, 50);
    const recoil = Math.max(1, Math.floor(attacker.maxHp * 0.25));
    applyDamage(attacker, recoil);
    logs.push(`${defender.name} took 50 damage! (${defender.hp}/${defender.maxHp} HP)`);
    logs.push(`${attacker.name} was hurt by recoil! (-${recoil} HP)`);
    if (defender.fainted) logs.push(`${defender.name} fainted!`);
    if (attacker.fainted) logs.push(`${attacker.name} fainted!`);
    return { logs, defHpAfter: defender.hp, atkHpAfter: attacker.hp, defFainted: defender.fainted, atkFainted: attacker.fainted };
  }

  // Deduct PP
  if (attacker.pp && moveName in attacker.pp) {
    attacker.pp[moveName] = Math.max(0, attacker.pp[moveName] - 1);
  }

  const moveData    = moveDataMap?.[moveName] ?? null;
  const displayName = moveName.replace(/\b\w/g, c => c.toUpperCase());
  logs.push(`${attacker.name} used ${displayName}!`);

  // Protect check
  if (defender.volatile?.protect && moveData?.target !== 'self') {
    logs.push(`${attacker.name}'s attack was blocked by Protect!`);
    defender.volatile.protect = false;
    return { logs, defHpAfter: defender.hp, atkHpAfter: attacker.hp, defFainted: false, atkFainted: false };
  }

  // Invulnerability check charge moves that make the user untargetable
  // Moves that CAN still hit through invulnerability are handled in their own effect (e.g. Earthquake vs Dig)
  const BREAKS_INVULNERABLE = new Set(['thunder', 'hurricane', 'twister', 'gust', 'earthquake', 'magnitude', 'fissure', 'surf', 'whirlpool']);
  if (defender.volatile?.invulnerable && !BREAKS_INVULNERABLE.has(moveName)) {
    logs.push(`${attacker.name}'s attack missed! ${defender.name} is unreachable!`);
    return { logs, defHpAfter: defender.hp, atkHpAfter: attacker.hp, defFainted: defender.fainted, atkFainted: attacker.fainted, forceSwitch: null };
  }

  // Taunt attacker cannot use status moves (power === null) for taunt duration
  const isStatusCategoryMove = moveData && !moveData.power;
  if (attacker.volatile?.taunt && isStatusCategoryMove) {
    logs.push(`${attacker.name} can't use ${displayName} because of Taunt!`);
    return { logs, defHpAfter: defender.hp, atkHpAfter: attacker.hp, defFainted: defender.fainted, atkFainted: attacker.fainted, forceSwitch: null };
  }

  // Torment attacker cannot use the same move twice in a row
  if (attacker.volatile?.torment && moveName && attacker.volatile?.lastMove === moveName) {
    logs.push(`${attacker.name} can't use ${displayName} again due to Torment!`);
    return { logs, defHpAfter: defender.hp, atkHpAfter: attacker.hp, defFainted: defender.fainted, atkFainted: attacker.fainted, forceSwitch: null };
  }

  // Crafty Shield blocks status category moves (power === null) except specific hazard/perish moves
  const CRAFTY_SHIELD_BYPASS = new Set(['perish song', 'spikes', 'stealth rock', 'toxic spikes', 'sticky web']);
  if (extraCtx?.defenderSide?.craftyShield && isStatusCategoryMove && moveData?.target !== 'user' && !CRAFTY_SHIELD_BYPASS.has(moveName)) {
    logs.push(`${defender.name}'s team is protected by Crafty Shield!`);
    return { logs, defHpAfter: defender.hp, atkHpAfter: attacker.hp, defFainted: defender.fainted, atkFainted: attacker.fainted, forceSwitch: null };
  }

  const subHp = defender.volatile?.substituteHp ?? 0;

  const effect = MOVE_EFFECTS?.[moveName] ?? null;

  // Accuracy check (must come after effect is resolved so ignoreAccEva can be read)
  if (!accuracyCheck(moveData, attacker, defender, effect?.ignoreAccEva ?? false)) {
    logs.push(`${attacker.name}'s attack missed!`);
    return { logs, defHpAfter: defender.hp, atkHpAfter: attacker.hp, defFainted: defender.fainted, atkFainted: attacker.fainted, forceSwitch: null };
  }
  const ctx    = { attacker, defender, moveData, weather, log: logs, damage: 0, absorbed: false, forceSwitch: null, ...extraCtx };

  // Powder if attacker is covered in powder and uses a Fire move, it backfires
  if (attacker.volatile?.powder && moveData?.type === 'fire') {
    delete attacker.volatile.powder;
    const dmg = Math.max(1, Math.floor(attacker.maxHp / 4));
    applyDamage(attacker, dmg);
    logs.push(`The powder exploded! ${attacker.name} took ${dmg} damage!`);
    if (attacker.fainted) logs.push(`${attacker.name} fainted!`);
    return { logs, defHpAfter: defender.hp, atkHpAfter: attacker.hp, defFainted: defender.fainted, atkFainted: attacker.fainted, forceSwitch: null };
  }
  if (attacker.volatile?.powder) delete attacker.volatile.powder;

  // Imprison block moves that the opponent has sealed
  if (defender.volatile?.imprison instanceof Set && defender.volatile.imprison.has(moveName)) {
    logs.push(`${attacker.name}'s ${moveName} is imprisoned!`);
    return { logs, defHpAfter: defender.hp, atkHpAfter: attacker.hp, defFainted: defender.fainted, atkFainted: attacker.fainted, forceSwitch: null };
  }

  // Magic Coat reflect status/stat moves back at the attacker
  const isStatusMove = effect && Object.prototype.hasOwnProperty.call(effect, 'power') && effect.power === null;
  if (defender.volatile?.magicCoat && isStatusMove) {
    delete defender.volatile.magicCoat;
    logs.push(`${defender.name}'s Magic Coat reflected the move!`);
    // Re-run the move with attacker and defender swapped
    const reflectCtx = { attacker: defender, defender: attacker, moveData, weather, log: logs, damage: 0, absorbed: false, forceSwitch: null };
    if (effect?.onUse) effect.onUse(reflectCtx);
    return { logs, defHpAfter: defender.hp, atkHpAfter: attacker.hp, defFainted: defender.fainted, atkFainted: attacker.fainted, forceSwitch: null };
  }

  // Snatch if defender has snatch active and this is a self-targeting support move, steal it
  if (defender.volatile?.snatch && isStatusMove && moveData?.target === 'user') {
    delete defender.volatile.snatch;
    logs.push(`${defender.name} snatched the move!`);
    const snatchCtx = { attacker: defender, defender: attacker, moveData, weather, log: logs, damage: 0, absorbed: false, forceSwitch: null };
    if (effect?.onUse) effect.onUse(snatchCtx);
    return { logs, defHpAfter: defender.hp, atkHpAfter: attacker.hp, defFainted: defender.fainted, atkFainted: attacker.fainted, forceSwitch: null };
  }

  if (effect?.onUse) effect.onUse(ctx);

  const hasCustomPower = effect && Object.prototype.hasOwnProperty.call(effect, 'power');
  const activeMoveData = ctx.moveData ?? moveData;
  const effectPower    = hasCustomPower ? effect.power : (activeMoveData?.power ?? 0);
  const skipDamage     = hasCustomPower && effect.power === null;

  if (!skipDamage && effectPower > 0) {
        // If onUse set a hitCount on ctx, run damage that many times individually
    const hitCount = ctx.hitCount ?? 1;
    let totalDamage = 0;

    for (let hit = 0; hit < hitCount; hit++) {
      if (defender.fainted) break;
      const dmgMd = ctx.moveData ?? moveData; // onUse may have updated ctx.moveData
      const { damage, typeEff, isCrit } = calcDamage(attacker, defender, dmgMd, weather);
      ctx.damage = damage;
      ctx.typeEff = typeEff;
      totalDamage += damage;

      if (hit === 0) {
        if (isCrit) logs.push('A critical hit!');
        const eff = effectivenessLabel(typeEff);
        if (eff) logs.push(eff);
      }

      if (!ctx.absorbed) {
        if (subHp > 0 && !moveName.includes('shadow') && moveData?.target !== 'all-opponents') {
          const newSub = Math.max(0, subHp - damage);
          defender.volatile.substituteHp = newSub;
          if (newSub === 0) {
            delete defender.volatile.substituteHp;
            logs.push(`${defender.name}'s substitute broke!`);
          } else {
            logs.push(`The substitute took ${damage} damage! (${newSub} HP left)`);
          }
        } else {
          applyDamage(defender, damage);
          logs.push(`${defender.name} took ${damage} damage! (${defender.hp}/${defender.maxHp} HP)`);
          // Track for Assurance / Payback
          if (!defender.volatile) defender.volatile = {};
          defender.volatile.damagedThisTurn = true;
          // Track last damage taken on attacker (for Payback / Metal Burst)
          if (!attacker.volatile) attacker.volatile = {};
          attacker.volatile.lastDamageTaken = damage;

          // Store damage into bide counter on defender's attacker (i.e. the attacker is biding,
          // and the defender just hit them but here we're in the ATTACKER's move, so we store
          // damage that the DEFENDER deals INTO the attacker's bide. We handle the reverse below.
        }
      }
    }

    if (hitCount > 1) logs.push(`Hit ${hitCount} time(s)!`);

    // If attacker is biding, store the total damage received this turn (handled in applyVolatileTick)
    // If DEFENDER is biding, store the damage they just took (attacker hit them)
    if (defender.volatile?.bide) {
      defender.volatile.bide.stored = (defender.volatile.bide.stored || 0) + totalDamage;
    }

    ctx.damage = totalDamage;

    // Destiny Bond
    // Destiny Bond if defender fainted AND they had destiny bond, attacker also faints
    if (defender.fainted && defender.volatile?.destinyBond) {
      attacker.hp = 0; attacker.fainted = true;
      logs.push(`${attacker.name} was taken down by ${defender.name}'s Destiny Bond!`);
    }
    // Endure
    if (defender.hp === 0 && defender.volatile?.endure) {
      defender.hp = 1; defender.fainted = false;
      logs.push(`${defender.name} endured the hit!`);
      delete defender.volatile.endure;
    }
  }

  // Store damage into ATTACKER's bide if they were hit (when attacker is defending handled
  // from the other side's executeMove). But also: if the attacker IS biding, we skip their
  // turn damage (bide's onUse sets ctx.absorbed=true on charging turns)

  if (effect?.onHit && !ctx.absorbed) effect.onHit(ctx);

  // Grudge if the DEFENDER (who used Grudge) just fainted, drain all PP of the killing move
  if (defender.volatile?.grudge && defender.fainted) {
    delete defender.volatile.grudge;
    if (attacker.pp && moveName in attacker.pp) {
      attacker.pp[moveName] = 0;
      logs.push(`${attacker.name}'s ${moveName} lost all its PP due to Grudge!`);
    }
  }

  if (defender.fainted) logs.push(`${defender.name} fainted!`);
  if (attacker.fainted) logs.push(`${attacker.name} fainted!`);

  return { logs, defHpAfter: defender.hp, atkHpAfter: attacker.hp, defFainted: defender.fainted, atkFainted: attacker.fainted, forceSwitch: ctx.forceSwitch ?? null };
}


// applyVolatileTick: per-turn volatile effects (leech seed, ingrain, aqua ring, curse, perish, screens, yawn)
// Processes end-of-turn volatile effects like burn, poison, and leech seed.
export function applyVolatileTick(pokemon, opponent) {
  const logs = [];
  if (!pokemon.volatile) return { logs };
  const v = pokemon.volatile;

  if (v.leechSeed && opponent) {
    const drain = Math.max(1, Math.floor(pokemon.maxHp / 8));
    applyDamage(pokemon, drain);
    opponent.hp = Math.min(opponent.maxHp, opponent.hp + drain);
    logs.push(`${pokemon.name}'s health was sapped by Leech Seed! (-${drain} HP)`);
  }

  if (v.ingrain) {
    const heal = Math.max(1, Math.floor(pokemon.maxHp / 16));
    pokemon.hp = Math.min(pokemon.maxHp, pokemon.hp + heal);
    logs.push(`${pokemon.name} absorbed nutrients through its roots! (+${heal} HP)`);
  }

  if (v.aquaRing) {
    const heal = Math.max(1, Math.floor(pokemon.maxHp / 16));
    pokemon.hp = Math.min(pokemon.maxHp, pokemon.hp + heal);
    logs.push(`${pokemon.name} restored a little HP through Aqua Ring! (+${heal} HP)`);
  }

  if (v.wish) {
    v.wish.turns--;
    if (v.wish.turns <= 0) {
      const heal = v.wish.hp;
      pokemon.hp = Math.min(pokemon.maxHp, pokemon.hp + heal);
      logs.push(`${v.wish.wisher}'s wish came true! ${pokemon.name} restored ${heal} HP!`);
      delete v.wish;
    }
  }

  if (v.luckyChant !== undefined) {
    v.luckyChant--;
    if (v.luckyChant <= 0) { delete v.luckyChant; logs.push(`${pokemon.name}'s Lucky Chant wore off!`); }
  }

  if (v.wonderRoom !== undefined) {
    v.wonderRoom--;
    if (v.wonderRoom <= 0) {
      delete v.wonderRoom;
      // Swap back Def/SpDef
      [pokemon.def, pokemon.spdef] = [pokemon.spdef, pokemon.def];
      logs.push(`Wonder Room faded! ${pokemon.name}'s Def and Sp. Def returned to normal.`);
    }
  }

  if (v.magicRoom !== undefined) {
    v.magicRoom--;
    if (v.magicRoom <= 0) { delete v.magicRoom; logs.push('Magic Room faded!'); }
  }

  if (v.curse) {
    const d = Math.max(1, Math.floor(pokemon.maxHp / 4));
    applyDamage(pokemon, d);
    logs.push(`${pokemon.name} is afflicted by a curse! (-${d} HP)`);
  }

  if (v.perishCount !== undefined) {
    v.perishCount--;
    if (v.perishCount === 0) {
      pokemon.hp = 0; pokemon.fainted = true;
      logs.push(`${pokemon.name} fainted from the Perish Song!`);
    } else {
      logs.push(`${pokemon.name}'s perish count fell to ${v.perishCount}!`);
    }
  }

  if (v.futureSight) {
    v.futureSight.turns--;
    if (v.futureSight.turns <= 0) {
      applyDamage(pokemon, v.futureSight.damage);
      logs.push(`${pokemon.name} took ${v.futureSight.damage} damage from ${v.futureSight.user}'s attack!`);
      delete v.futureSight;
    }
  }

  // Doom Desire fires 2 turns after use. Damage uses the stored attacker SpAtk
  // but the CURRENT defender's SpDef (whoever is on the field at detonation).
  if (v.doomDesire) {
    v.doomDesire.turns--;
    if (v.doomDesire.turns <= 0) {
      const spatkVal  = v.doomDesire.attackerSpatk;
      const spdefVal  = Math.max(1, pokemon.spdef ?? 45);
      const dmg = Math.max(1, Math.floor(
        (((2 * 50 / 5 + 2) * 140 * spatkVal / spdefVal) / 50 + 2)
      ));
      applyDamage(pokemon, dmg);
      logs.push(`${v.doomDesire.attackerName}'s Doom Desire struck ${pokemon.name} for ${dmg} damage!`);
      if (pokemon.fainted) logs.push(`${pokemon.name} fainted!`);
      delete v.doomDesire;
    }
  }

  if (v.yawn !== undefined) {
    if (v.yawn <= 0 && pokemon.status === 'none') {
      pokemon.status = 'slp';
      pokemon.sleepCounter = Math.floor(Math.random() * 3) + 1;
      logs.push(`${pokemon.name} fell asleep!`);
      delete v.yawn;
    } else { v.yawn--; }
  }

  // Countdown screen / volatile turns
  const countdowns = [
    ['reflect',     n => `${pokemon.name}'s Reflect wore off!`],
    ['lightScreen', n => `${pokemon.name}'s Light Screen wore off!`],
    ['taunt',       n => `${pokemon.name}'s taunt wore off!`],
  ];
  for (const [key, msg] of countdowns) {
    if (v[key] !== undefined) {
      v[key]--;
      if (v[key] <= 0) { delete v[key]; logs.push(msg()); }
    }
  }

  if (v.encore?.turns !== undefined) {
    v.encore.turns--;
    if (v.encore.turns <= 0) { delete v.encore; logs.push(`${pokemon.name}'s encore ended!`); }
  }
  if (v.disabled?.turns !== undefined) {
    v.disabled.turns--;
    if (v.disabled.turns <= 0) { delete v.disabled; logs.push(`${pokemon.name}'s move is no longer disabled!`); }
  }

  // Nightmare sleeping target loses 1/4 max HP per turn; cured when woken
  if (v.nightmare) {
    if (pokemon.status === 'slp') {
      const d = Math.max(1, Math.floor(pokemon.maxHp / 4));
      applyDamage(pokemon, d);
      logs.push(`${pokemon.name} is locked in a nightmare! (-${d} HP)`);
    } else {
      // Pokémon woke up nightmare ends
      delete v.nightmare;
    }
  }

  // Clear single-turn flags
  delete v.protect;
  // Destiny Bond clears at start of the user's NEXT turn (handled by clearing it after
  // a turn completes volatile tick runs end-of-turn, so clearing here is correct
  // only if we want it to last exactly one full round. Per spec it lasts until the user
  // takes another action, so we clear it in checkCanMove instead).
  // Keep destinyBond persistent it is cleared in battleEngine executeMove after it triggers.

  if (pokemon.hp === 0 && !pokemon.fainted) pokemon.fainted = true;
  return { logs };
}

// applyStatusTick returns { logs[], hpAfter, fainted }
export function applyStatusTick(pokemon) {
  const logs = [];
  switch (pokemon.status) {
    case 'brn': {
      const d = Math.max(1, Math.floor(pokemon.maxHp / 8));
      applyDamage(pokemon, d);
      logs.push(`${pokemon.name} is hurt by its burn! (-${d} HP)`);
      break;
    }
    case 'psn': {
      const d = Math.max(1, Math.floor(pokemon.maxHp / 8));
      applyDamage(pokemon, d);
      logs.push(`${pokemon.name} is hurt by poison! (-${d} HP)`);
      break;
    }
    case 'tox': {
      pokemon.toxicCounter = pokemon.toxicCounter || 1;
      const d = Math.max(1, Math.floor(pokemon.maxHp / 16 * pokemon.toxicCounter));
      applyDamage(pokemon, d);
      logs.push(`${pokemon.name} is hurt by bad poison! (-${d} HP)`);
      pokemon.toxicCounter++;
      break;
    }
    case 'slp':
      if ((pokemon.sleepCounter || 0) <= 0) {
        pokemon.status = 'none';
        logs.push(`${pokemon.name} woke up!`);
      } else {
        pokemon.sleepCounter--;
        logs.push(`${pokemon.name} is fast asleep...`);
      }
      break;
    case 'frz':
      if (Math.random() < 0.2) {
        pokemon.status = 'none';
        logs.push(`${pokemon.name} thawed out!`);
      }
      break;
    default: break;
  }
  if (pokemon.hp === 0 && !pokemon.fainted) { pokemon.fainted = true; logs.push(`${pokemon.name} fainted!`); }
  return { logs, hpAfter: pokemon.hp, fainted: pokemon.fainted };
}

export function checkCanMove(pokemon) {
  const logs = [];
  let canMove = true;

  // Destiny Bond clears at the start of the user's next action (any turn, even inactive)
  if (pokemon.volatile?.destinyBond) {
    delete pokemon.volatile.destinyBond;
  }

  // Recharge (Hyper Beam / Giga Impact etc.)
  if (pokemon.volatile?.recharging) {
    delete pokemon.volatile.recharging;
    logs.push(`${pokemon.name} is recharging!`);
    canMove = false;
    return { canMove, logs };
  }

  // Locked into a charge move (Fly, Geomancy, Skull Bash, etc.) forced to continue
  if (pokemon.volatile?.lockedMove) {
    // canMove stays true the move will auto-fire via resolvedMoves override
    logs.push(`${pokemon.name} is locked into ${pokemon.volatile.lockedMove}!`);
  }

  if (pokemon.status === 'slp') {
    if ((pokemon.sleepCounter ?? 0) > 0) {
      pokemon.sleepCounter--;
      logs.push(`${pokemon.name} is fast asleep!`); canMove = false;
    } else {
      pokemon.status = 'none';
      logs.push(`${pokemon.name} woke up!`);
    }
  } else if (pokemon.status === 'frz') {
    if (Math.random() < 0.2) {
      pokemon.status = 'none';
      logs.push(`${pokemon.name} thawed out!`);
    } else {
      logs.push(`${pokemon.name} is frozen solid!`); canMove = false;
    }
  } else if (pokemon.status === 'par' && Math.random() < 0.75) {
    logs.push(`${pokemon.name} is paralyzed! It can't move!`); canMove = false;
  }
  // Confusion
  if (canMove && pokemon.volatile?.confused) {
    pokemon.volatile.confused--;
    if (pokemon.volatile.confused <= 0) {
      delete pokemon.volatile.confused;
      logs.push(`${pokemon.name} snapped out of confusion!`);
    } else if (Math.random() < 0.5) {
      // Typeless 40 base power physical attack against itself (ignores stages for simplicity)
      const selfDmg = Math.max(1, Math.floor(
        (((2 * 50 / 5 + 2) * 40 * pokemon.atk / pokemon.def) / 50 + 2)
      ));
      pokemon.hp = Math.max(1, pokemon.hp - selfDmg);
      logs.push(`${pokemon.name} is confused! It hurt itself in confusion! (-${selfDmg} HP)`);
      canMove = false;
    } else {
      logs.push(`${pokemon.name} is confused!`);
    }
  }
  // Infatuation
  if (canMove && pokemon.volatile?.infatuated) {
    if (Math.random() < 0.5) {
      logs.push(`${pokemon.name} is in love and can't move!`); canMove = false;
    } else {
      logs.push(`${pokemon.name} is in love but attacked!`);
    }
  }
  return { canMove, logs };
}
// Builds a standardised battler object from pokemon slot + fetched data.
// Builds a standardised battler object from a Pokémon slot and API data.
export function buildBattler(pokemon, data) {
  const bases = {};
  (data?.stats || []).forEach(s => { bases[s.name] = s.value; });
  // IVs default to 31 (perfect), EVs default to 0
  const ivs = pokemon.ivs || { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 };
  const evs = pokemon.evs || { hp:0,  attack:0,  defense:0,  'special-attack':0,  'special-defense':0,  speed:0  };
  const maxHp = calcHPStat(bases.hp || 45, evs.hp ?? 0, ivs.hp ?? 31);
  return {
    name:       pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1).replace(/-/g, ' '),
    types:      data?.types || [],
    sprite:     data?.sprite || null,
    spriteBack: data?.spriteBack || null,
    maxHp,
    hp:    maxHp,
    atk:   calcBattleStat(bases.attack            || 45, evs.attack            ?? 0, ivs.attack            ?? 31),
    def:   calcBattleStat(bases.defense           || 45, evs.defense           ?? 0, ivs.defense           ?? 31),
    spatk: calcBattleStat(bases['special-attack']  || 45, evs['special-attack'] ?? 0, ivs['special-attack'] ?? 31),
    spdef: calcBattleStat(bases['special-defense'] || 45, evs['special-defense']?? 0, ivs['special-defense']?? 31),
    spd:   calcBattleStat(bases.speed             || 45, evs.speed             ?? 0, ivs.speed             ?? 31),
    baseSPD: bases.speed || 45,
    moves:   pokemon.moves || [],
    pp:      Object.fromEntries((pokemon.moves || []).map(m => [m, data?.moveData?.[m]?.pp ?? 10])),
    item:    pokemon.item  || null,
    status:  'none',
    stages:  { atk: 0, def: 0, spatk: 0, spdef: 0, spd: 0 },
    fainted: false,
    friendship: pokemon.friendship ?? 128,
    gender: pokemon.gender ?? (Math.random() < 0.5 ? 'm' : 'f'),
  };
}
