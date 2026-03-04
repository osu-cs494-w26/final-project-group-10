// Battle engine - Most of it placeholder for right now

export const STATUS = { NONE:'none', BRN:'brn', PSN:'psn', PAR:'par', SLP:'slp', FRZ:'frz', TOX:'tox' };
export const STATUS_LABELS = { brn:'BRN', psn:'PSN', par:'PAR', slp:'SLP', frz:'FRZ', tox:'TOX', none:'' };

export const TYPE_CHART = {};

export function getTypeEffectiveness(moveType, defenderTypes) { return 1; }
export function effectivenessLabel(mult) { return ''; }
export function stageMultiplier(stage) { return 1; }
export function calcHP(base) { return base; }
export function calcStat(base) { return base; }
export function calcDamage(attacker, defender, move, isCrit) { return { damage: 0, typeEff: 1, isCrit: false }; }
export function applyItemModifier(attacker, defender, move, damage) { return damage; }
export function applyMoveEffects(move, attacker, defender, damage) { return []; }
export function applyEndOfTurn(battler) { return []; }
export function checkStatusBeforeMove(battler) { return { canMove: true, msgs: [] }; }
export function aiChooseMove(ai, player, moveDataMap) { return ai.moves?.[0] || ''; }
export function goesFirst(player, ai, playerMove, aiMove) { return true; }
export function buildBattler(pokemon, pokeData) { return pokemon; }
