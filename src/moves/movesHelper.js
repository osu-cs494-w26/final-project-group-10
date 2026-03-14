/*
 * movesHelper.js Shared MOVE_EFFECTS registry and factory helpers
 * used by all type-specific move files.
 */
export const MOVE_EFFECTS = {};
export function secondaryStatus(ctx, status, chance) {
  if (!ctx.defender || ctx.defender.status !== 'none') return;
  if (Math.random() * 100 >= chance) return;
  ctx.defender.status = status;
  if (status === 'tox') ctx.defender.toxicCounter = 1;
  if (status === 'slp') ctx.defender.sleepCounter = Math.floor(Math.random() * 3) + 1;
  const labels = { brn: 'burned', psn: 'poisoned', tox: 'badly poisoned', par: 'paralyzed', frz: 'frozen', slp: 'put to sleep' };
  ctx.log.push(`${ctx.defender.name} was ${labels[status]}!`);
}
export function statChange(ctx, stat, stages, target, chance = 100) {
  if (chance < 100 && Math.random() * 100 >= chance) return;
  const poke = target === 'self' ? ctx.attacker : ctx.defender;
  poke.stages[stat] = Math.max(-6, Math.min(6, (poke.stages[stat] ?? 0) + stages));
  const names = { atk: 'Attack', def: 'Defense', spatk: 'Sp. Atk', spdef: 'Sp. Def', spd: 'Speed', acc: 'Accuracy', eva: 'Evasion' };
  ctx.log.push(`${poke.name}'s ${names[stat] ?? stat} ${stages > 0 ? 'rose' : 'fell'}!`);
}
export function selfHeal(poke, frac, ctx) {
  const amount = Math.max(1, Math.floor(poke.maxHp * frac));
  poke.hp = Math.min(poke.maxHp, poke.hp + amount);
  ctx.log.push(`${poke.name} restored ${amount} HP!`);
}
export function inflictConfusion(ctx, target, chance = 100) {
  if (chance < 100 && Math.random() * 100 >= chance) return;
  if (!target.volatile) target.volatile = {};
  if (target.volatile.confused) return;
  target.volatile.confused = Math.floor(Math.random() * 4) + 1;
  ctx.log.push(`${target.name} became confused!`);
}
export const flinchEffect = (chance) => (ctx) => {
  if (Math.random() * 100 < chance) {
    if (!ctx.defender.volatile) ctx.defender.volatile = {};
    ctx.defender.volatile.flinched = true;
    ctx.log.push(`${ctx.defender.name} flinched!`);
  }
};
export const recoilEffect = (frac) => (ctx) => {
  const r = Math.max(1, Math.floor(ctx.damage * frac));
  ctx.attacker.hp = Math.max(0, ctx.attacker.hp - r);
  if (ctx.attacker.hp === 0) ctx.attacker.fainted = true;
  ctx.log.push(`${ctx.attacker.name} was hurt by recoil! (-${r} HP)`);
  if (ctx.attacker.fainted) ctx.log.push(`${ctx.attacker.name} fainted!`);
};
export const drainEffect = (frac) => (ctx) => {
  const h = Math.max(1, Math.floor(ctx.damage * frac));
  ctx.attacker.hp = Math.min(ctx.attacker.maxHp, ctx.attacker.hp + h);
  ctx.log.push(`${ctx.attacker.name} drained ${h} HP!`);
};
export function composeHit(...fns) { return (ctx) => fns.forEach(f => f(ctx)); }
export const selfBoost = (...changes) => ({
  operational: true, power: null,
  onUse: (ctx) => changes.forEach(([stat, stages]) => statChange(ctx, stat, stages, 'self')),
});
export const foeDebuff = (...changes) => ({
  operational: true, power: null,
  onUse: (ctx) => changes.forEach(([stat, stages]) => statChange(ctx, stat, stages, 'foe')),
});
export function fixedDamage(amount) {
  return {
    power: null,
    onUse: (ctx) => {
      ctx.defender.hp = Math.max(0, ctx.defender.hp - amount);
      if (ctx.defender.hp === 0) ctx.defender.fainted = true;
      ctx.log.push(`${ctx.defender.name} took ${amount} damage! (${ctx.defender.hp}/${ctx.defender.maxHp} HP)`);
    },
  };
}
export function statusMove(status, accuracy = 100) {
  return {
    operational: true, power: null,
    onUse: (ctx) => {
      if (ctx.defender.status !== 'none') { ctx.log.push('But it failed!'); return; }
      if (accuracy < 100 && Math.random() * 100 >= accuracy) { ctx.log.push(`${ctx.attacker.name}'s attack missed!`); return; }
      ctx.defender.status = status;
      if (status === 'slp') ctx.defender.sleepCounter = Math.floor(Math.random() * 3) + 1;
      if (status === 'tox') ctx.defender.toxicCounter = 1;
      const labels = { psn: 'poisoned', tox: 'badly poisoned', par: 'paralyzed', slp: 'fell asleep', frz: 'frozen', brn: 'burned' };
      const verb = status === 'slp' ? `${ctx.defender.name} fell asleep!` : `${ctx.defender.name} was ${labels[status]}!`;
      ctx.log.push(verb);
    },
  };
}
export function trapEffect(turns = 4) {
  return (ctx) => {
    if (!ctx.defender.volatile) ctx.defender.volatile = {};
    ctx.defender.volatile.trapped = turns;
    ctx.log.push(`${ctx.defender.name} is trapped!`);
  };
}
export function multiHitEffect(hits) {
  return (ctx) => {
    const n = Array.isArray(hits)
      ? (Math.random() < 0.333 ? hits[0] : Math.random() < 0.5 ? hits[1] : hits[2])
      : hits;
    ctx.hitCount = n;
  };
}
export const healSelf = (frac, weatherBonus = false) => ({
  operational: true, power: null,
  onUse: (ctx) => selfHeal(ctx.attacker, weatherBonus && ctx.weather === 'sun' ? 0.667 : frac, ctx),
});

/**
 * registerMove(name, descriptor)
 *
 * descriptor fields (all optional):
 *   operational  default true
 *   power        override power (null = no damage step)
 *   onUse        function(ctx) before damage
 *   onHit        function(ctx) after damage
 *
 * Shorthand secondary effect fields:
 *   secondary    { status, chance } or { stat, stages, target, chance }
 *   flinchChance number 0-100
 *   recoil       fraction of damage dealt back to attacker
 *   drain        fraction of damage healed to attacker
 *   selfDrop     { stat, stages } or array of same
 *   highCrit     boolean, stamps highCrit onto moveData before damage
 */
export function registerMove(name, descriptor = {}) {
  const { operational = true, power, onUse, onHit: customOnHit, secondary, flinchChance, recoil, drain, selfDrop, highCrit, ignoreAccEva } = descriptor;

  const hitFns = [];
  if (customOnHit)  hitFns.push(customOnHit);
  if (secondary) {
    const s = secondary;
    if (s.status) hitFns.push((ctx) => secondaryStatus(ctx, s.status, s.chance ?? 100));
    else if (s.stat) hitFns.push((ctx) => statChange(ctx, s.stat, s.stages, s.target ?? 'foe', s.chance ?? 100));
  }
  if (flinchChance) hitFns.push(flinchEffect(flinchChance));
  if (recoil)       hitFns.push(recoilEffect(recoil));
  if (drain)        hitFns.push(drainEffect(drain));
  if (selfDrop) {
    const drops = Array.isArray(selfDrop) ? selfDrop : [selfDrop];
    drops.forEach(d => hitFns.push((ctx) => statChange(ctx, d.stat, d.stages, 'self')));
  }

  const baseOnUse = onUse;
  const finalOnUse = highCrit
    ? (ctx) => {
        ctx.moveData = { ...(ctx.moveData || {}), highCrit: true };
        if (baseOnUse) baseOnUse(ctx);
      }
    : baseOnUse;

  const entry = { operational };
  if (power !== undefined) entry.power = power;
  if (ignoreAccEva)        entry.ignoreAccEva = true;
  if (finalOnUse)         entry.onUse = finalOnUse;
  if (hitFns.length)      entry.onHit = composeHit(...hitFns);

  MOVE_EFFECTS[name] = entry;
}

