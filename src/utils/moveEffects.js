/*
 * moveEffects.js Assembles the unified MOVE_EFFECTS registry by importing
 * all type specific move files. Also exports ALL_MOVES and getOperationalMoves.
 */

import {
  MOVE_EFFECTS, registerMove,
  secondaryStatus, statChange, selfHeal, inflictConfusion,
  flinchEffect, recoilEffect, drainEffect, composeHit,
  fixedDamage, multiHitEffect, trapEffect, statusMove,
  selfBoost, foeDebuff, healSelf,
} from '../moves/movesHelper.js';

import { registerNormalMoves   } from '../moves/movesNormal.js';
import { registerFireMoves     } from '../moves/movesFire.js';
import { registerWaterMoves    } from '../moves/movesWater.js';
import { registerGrassMoves    } from '../moves/movesGrass.js';
import { registerElectricMoves } from '../moves/movesElectric.js';
import { registerIceMoves      } from '../moves/movesIce.js';
import { registerFightingMoves } from '../moves/movesFighting.js';
import { registerPoisonMoves   } from '../moves/movesPoison.js';
import { registerGroundMoves   } from '../moves/movesGround.js';
import { registerRockMoves     } from '../moves/movesRock.js';
import { registerPsychicMoves  } from '../moves/movesPsychic.js';
import { registerGhostMoves    } from '../moves/movesGhost.js';
import { registerDragonMoves   } from '../moves/movesDragon.js';
import { registerDarkMoves     } from '../moves/movesDark.js';
import { registerSteelMoves    } from '../moves/movesSteel.js';
import { registerFlyingMoves   } from '../moves/movesFlying.js';
import { registerBugMoves      } from '../moves/movesBug.js';
import { registerFairyMoves    } from '../moves/movesFairy.js';

// Register type specific moves
// Order matters for overrides later registrations win.
registerNormalMoves();
registerFireMoves();
registerWaterMoves();
registerGrassMoves();
registerElectricMoves();
registerIceMoves();
registerFightingMoves();
registerPoisonMoves();
registerGroundMoves();
registerRockMoves();
registerPsychicMoves();
registerGhostMoves();
registerDragonMoves();
registerDarkMoves();
registerSteelMoves();
registerFlyingMoves();
registerBugMoves();
registerFairyMoves();

// Step 3: Hyphen / alias normalisation
const aliases = {
  'will-o-wisp':    'will o wisp',
  'u-turn':         'u turn',
  'x-scissor':      'x scissor',
  'v-create':       'v create',
  'trick-or-treat': 'trick or treat',
  "forest's curse": 'forests curse',
  "land's wrath":   'lands wrath',
  'freeze-dry':     'freeze dry',
  'power-up punch': 'power up punch',
  'soft-boiled':    'softboiled',
  'high-jump-kick': 'hi jump kick',
  'thunder-shock':  'thundershock',
  'vise-grip':      'vicegrip',
  'self-destruct':  'self destruct',
  'double-edge':    'double edge',
  'skull-bash':     'skull bash',
  'psych-up':       'psych up',
  'razor-wind':     'razor wind',
  'extreme-speed':  'extreme speed',
  'body-slam':      'body slam',
  'defense-curl':   'defense curl',
};
Object.entries(aliases).forEach(([alias, canonical]) => {
  if (!MOVE_EFFECTS[alias] && MOVE_EFFECTS[canonical]) MOVE_EFFECTS[alias] = MOVE_EFFECTS[canonical];
});

// Reexport everything consumers might need
export {
  MOVE_EFFECTS,
  registerMove,
  secondaryStatus,
  statChange,
  selfHeal,
  inflictConfusion,
  flinchEffect,
  recoilEffect,
  drainEffect,
  composeHit,
  fixedDamage,
  multiHitEffect,
  trapEffect,
  statusMove,
  selfBoost,
  foeDebuff,
  healSelf,
};


/** Sorted list of all moves that are operational (usable in battle) */
// Sorted list of every move marked as operational (battle ready).
export const ALL_MOVES = Object.entries(MOVE_EFFECTS)
  .filter(([, v]) => v?.operational)
  .map(([k]) => k)
  .sort();

/** Filter a Pokémon's learned moves to the first 4 operational ones */
// Filters a Pokémon's learned moves to the first 4 that are operational.
export function getOperationalMoves(learnedMoves) {
  return (learnedMoves || []).filter(m => MOVE_EFFECTS[m]?.operational).slice(0, 4);
}
