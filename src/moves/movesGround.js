/*
 * movesGround.js Registers all GROUND type move effects
 * into the shared MOVE_EFFECTS registry.
 */
import { MOVE_EFFECTS, registerMove, statChange } from './movesHelper.js';

export function registerGroundMoves() {
  registerMove('bone club', { flinchChance: 10 });
  registerMove('bone rush', {
    onUse: (ctx) => {
      const roll = Math.random();
      ctx.hitCount = roll < 0.333 ? 2 : roll < 0.667 ? 3 : roll < 0.833 ? 4 : 5;
    },
  });
  registerMove('bonemerang', {
    onUse: (ctx) => { ctx.hitCount = 2; },
  });
  registerMove('bulldoze', {
    secondary: { stat: 'spd', stages: -1, target: 'foe', chance: 100 },
  });
  registerMove('dig', {
    onUse: (ctx) => {
      if (!ctx.attacker.volatile) ctx.attacker.volatile = {};
      if (!ctx.attacker.volatile.digCharging) {
        ctx.attacker.volatile.digCharging  = true;
        ctx.attacker.volatile.invulnerable = 'dig';
        ctx.attacker.volatile.lockedMove   = 'dig';
        ctx.log.push(`${ctx.attacker.name} burrowed underground!`);
        ctx.absorbed = true;
      } else {
        delete ctx.attacker.volatile.digCharging;
        delete ctx.attacker.volatile.invulnerable;
        delete ctx.attacker.volatile.lockedMove;
      }
    },
  });
  registerMove('drill run', { highCrit: true });
  registerMove('earth power', {
    secondary: { stat: 'spdef', stages: -1, target: 'foe', chance: 10 },
  });
  registerMove('earthquake', {
    onUse: (ctx) => {
      if (ctx.defender.volatile?.underground) {
        ctx.moveData = { ...(ctx.moveData || {}), power: 200 };
        ctx.log.push('Earthquake hit the underground target for double damage!');
      }
    },
  });
  MOVE_EFFECTS['fissure'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (Math.random() * 100 >= 30) { ctx.log.push('Fissure missed!'); return; }
      ctx.defender.hp = 0;
      ctx.defender.fainted = true;
      ctx.log.push(`${ctx.defender.name} fell into the fissure! It's a one-hit KO!`);
      ctx.absorbed = true;
    },
  };
  registerMove("land's wrath");
  MOVE_EFFECTS['magnitude'] = {
    operational: true,
    onUse: (ctx) => {
      const roll = Math.random() * 100;
      let mag, pwr;
      if      (roll < 5)  { mag = 4;  pwr = 10;  }
      else if (roll < 15) { mag = 5;  pwr = 30;  }
      else if (roll < 35) { mag = 6;  pwr = 50;  }
      else if (roll < 65) { mag = 7;  pwr = 70;  }
      else if (roll < 85) { mag = 8;  pwr = 90;  }
      else if (roll < 95) { mag = 9;  pwr = 110; }
      else                { mag = 10; pwr = 150; }
      ctx.moveData = { ...(ctx.moveData || {}), power: pwr };
      ctx.log.push(`Magnitude ${mag}! Power is ${pwr}!`);
      if (ctx.defender.volatile?.underground) {
        ctx.moveData.power *= 2;
        ctx.log.push('It hit the underground target for double damage!');
      }
    },
  };
  registerMove('mud bomb', {
    secondary: { stat: 'acc', stages: -1, target: 'foe', chance: 30 },
  });
  registerMove('mud shot', {
    secondary: { stat: 'spd', stages: -1, target: 'foe', chance: 100 },
  });
  MOVE_EFFECTS['mud sport'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      ctx.fieldCondition = { ...(ctx.fieldCondition || {}), mudSport: true };
      ctx.log.push('Mud weakened Electric-type moves!');
    },
  };
  registerMove('mud-slap', {
    secondary: { stat: 'acc', stages: -1, target: 'foe', chance: 100 },
  });
  registerMove('precipice blades', {
    onUse: (ctx) => ctx.log.push(`${ctx.attacker.name} attacked all adjacent foes!`),
  });
  MOVE_EFFECTS['rototiller'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      const targets = [ctx.attacker, ctx.defender].filter(p => p.types?.includes('grass'));
      if (targets.length === 0) { ctx.log.push('But it had no effect!'); return; }
      targets.forEach(p => {
        if (p === ctx.attacker) {
          statChange(ctx, 'atk',   1, 'self');
          statChange(ctx, 'spatk', 1, 'self');
        } else {
          statChange(ctx, 'atk',   1, 'foe');
          statChange(ctx, 'spatk', 1, 'foe');
        }
      });
      ctx.log.push('Grass-type Pokémon had their stats boosted!');
    },
  };
  MOVE_EFFECTS['sand attack'] = {
    operational: true, power: null,
    onUse: (ctx) => statChange(ctx, 'acc', -1, 'foe'),
  };
  registerMove('sand tomb', {
    onHit: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.trapped   = Math.floor(Math.random() * 2) + 4;
      ctx.defender.volatile.trapDmg   = Math.floor(ctx.defender.maxHp / 8);
      ctx.log.push(`${ctx.defender.name} was trapped in the raging sand!`);
    },
  });
  MOVE_EFFECTS['spikes'] = {
    operational: true, power: null,
    onUse: (ctx) => {
      if (!ctx.defenderSide) ctx.defenderSide = {};
      ctx.defenderSide.spikes = Math.min(3, (ctx.defenderSide.spikes || 0) + 1);
      ctx.log.push(`Spikes were scattered on the opposing side! (Layer ${ctx.defenderSide.spikes})`);
    },
  };
  registerMove('thousand arrows', {
    onHit: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.grounded = true;
      if (ctx.defender.types?.includes('flying')) {
        ctx.log.push(`${ctx.defender.name} was knocked down and is now vulnerable to Ground moves!`);
      }
    },
  });
  registerMove('thousand waves', {
    onHit: (ctx) => {
      if (!ctx.defender.volatile) ctx.defender.volatile = {};
      ctx.defender.volatile.trapped = 999;
      ctx.log.push(`${ctx.defender.name} can't escape!`);
    },
  });
}
