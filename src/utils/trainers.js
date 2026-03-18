/*
 * trainers.js Single source of truth for all trainer data.
 * Imported by BattleTrainerPage (gallery) and TrainerDetailPage (parameterized route).
 * Adding or editing a trainer only needs to happen here.
 */

const IVS_PERFECT = { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 };

/* EV spread helpers */
const EVS_SPEED_SPATK = { hp:0, attack:0, defense:0, 'special-attack':252, 'special-defense':4, speed:252 };
const EVS_SPEED_ATK   = { hp:0, attack:252, defense:4, 'special-attack':0,   'special-defense':0, speed:252 };
const EVS_TANK        = { hp:252, attack:4, defense:252, 'special-attack':0,  'special-defense':0, speed:0 };
const EVS_TANK_ATK    = { hp:252, attack:252, defense:4, 'special-attack':0,  'special-defense':0, speed:0 };
const EVS_MIXED_ATK   = { hp:0, attack:252, defense:0, 'special-attack':4,   'special-defense':0, speed:252 };
const EVS_MIXED_SPATK = { hp:4, attack:0, defense:0, 'special-attack':252,   'special-defense':0, speed:252 };

/* Helper that attaches perfect IVs and a given EV spread to a Pokémon name */
function mon(name, evs) {
  return { name, evs, ivs: IVS_PERFECT };
}

export const TRAINERS = [
  {
    id: 'misty', name: 'Misty', title: 'Water-type Gym Leader',
    game: 'Pokémon Red / Blue / Yellow', gen: 1,
    accent: '#40a0e0', bg: '#0a1a30', difficulty: 1,
    party: [mon('staryu', EVS_SPEED_SPATK), mon('starmie', EVS_SPEED_SPATK)],
  },
  {
    id: 'roxanne', name: 'Roxanne', title: 'Rock-type Gym Leader',
    game: 'Pokémon Ruby / Sapphire / Emerald', gen: 3,
    accent: '#a08040', bg: '#2a1a08', difficulty: 1,
    party: [mon('geodude', EVS_TANK), mon('graveler', EVS_TANK), mon('nosepass', EVS_TANK)],
  },
  {
    id: 'whitney', name: 'Whitney', title: 'Normal-type Gym Leader',
    game: 'Pokémon Gold / Silver / Crystal', gen: 2,
    accent: '#ff88aa', bg: '#3a1020', difficulty: 2,
    party: [mon('clefairy', EVS_TANK_ATK), mon('miltank', EVS_TANK_ATK)],
  },
  {
    id: 'morty', name: 'Morty', title: 'Ghost-type Gym Leader',
    game: 'Pokémon Gold / Silver / Crystal', gen: 2,
    accent: '#9070d0', bg: '#1a0a30', difficulty: 2,
    party: [mon('gastly', EVS_SPEED_SPATK), mon('haunter', EVS_SPEED_SPATK), mon('misdreavus', EVS_SPEED_SPATK), mon('gengar', EVS_SPEED_SPATK)],
  },
  {
    id: 'blue', name: 'Blue', title: 'Pallet Town Rival',
    game: 'Pokémon Red / Blue / Yellow', gen: 1,
    accent: '#4090d0', bg: '#1a3a6a', difficulty: 3,
    party: [mon('pidgeot', EVS_SPEED_ATK), mon('alakazam', EVS_SPEED_ATK), mon('rhydon', EVS_SPEED_ATK), mon('arcanine', EVS_SPEED_ATK), mon('exeggutor', EVS_SPEED_ATK), mon('blastoise', EVS_SPEED_ATK)],
  },
  {
    id: 'giovanni', name: 'Giovanni', title: 'Team Rocket Boss',
    game: 'Pokémon Red / Blue / Yellow', gen: 1,
    accent: '#c03030', bg: '#2a0808', difficulty: 3,
    party: [mon('persian', EVS_SPEED_ATK), mon('dugtrio', EVS_SPEED_ATK), mon('nidoqueen', EVS_SPEED_ATK), mon('nidoking', EVS_SPEED_ATK), mon('rhyhorn', EVS_SPEED_ATK)],
  },
  {
    id: 'lance', name: 'Lance', title: 'Dragon Master',
    game: 'Pokémon Gold / Silver / Crystal', gen: 2,
    accent: '#c070e0', bg: '#3a1050', difficulty: 4,
    party: [mon('gyarados', EVS_MIXED_ATK), mon('dragonair', EVS_MIXED_ATK), mon('dragonite', EVS_MIXED_ATK), mon('aerodactyl', EVS_MIXED_ATK), mon('kingdra', EVS_MIXED_ATK), mon('charizard', EVS_MIXED_ATK)],
  },
  {
    id: 'steven', name: 'Steven', title: 'Hoenn Champion',
    game: 'Pokémon Ruby / Sapphire / Emerald', gen: 3,
    accent: '#b8a030', bg: '#3a2a08', difficulty: 4,
    party: [mon('skarmory', EVS_TANK_ATK), mon('claydol', EVS_TANK_ATK), mon('aggron', EVS_TANK_ATK), mon('cradily', EVS_TANK_ATK), mon('armaldo', EVS_TANK_ATK), mon('metagross', EVS_TANK_ATK)],
  },
  {
    id: 'n', name: 'N', title: 'King of Team Plasma',
    game: 'Pokémon Black / White', gen: 5,
    accent: '#30a8a0', bg: '#0a2a28', difficulty: 4,
    party: [mon('klinklang', EVS_SPEED_SPATK), mon('zoroark', EVS_SPEED_SPATK), mon('carracosta', EVS_SPEED_SPATK), mon('vanilluxe', EVS_SPEED_SPATK), mon('archeops', EVS_SPEED_SPATK), mon('zekrom', EVS_SPEED_SPATK)],
  },
  {
    id: 'red', name: 'Red', title: 'Pokémon Champion',
    game: 'Pokémon Gold / Silver / Crystal', gen: 2,
    accent: '#e06030', bg: '#7a2a10', difficulty: 5,
    party: [mon('pikachu', EVS_MIXED_ATK), mon('venusaur', EVS_MIXED_ATK), mon('charizard', EVS_MIXED_ATK), mon('blastoise', EVS_MIXED_ATK), mon('snorlax', EVS_MIXED_ATK), mon('lapras', EVS_MIXED_ATK)],
  },
  {
    id: 'cynthia', name: 'Cynthia', title: 'Sinnoh Champion',
    game: 'Pokémon Diamond / Pearl / Platinum', gen: 4,
    accent: '#60c060', bg: '#1a3a1a', difficulty: 5,
    party: [mon('spiritomb', EVS_MIXED_ATK), mon('roserade', EVS_MIXED_ATK), mon('garchomp', EVS_MIXED_ATK), mon('lucario', EVS_MIXED_ATK), mon('milotic', EVS_MIXED_ATK), mon('togekiss', EVS_MIXED_ATK)],
  },
  {
    id: 'ghetsis', name: 'Ghetsis', title: 'Shadow Triad Leader',
    game: 'Pokémon Black / White', gen: 5,
    accent: '#4060c0', bg: '#080a20', difficulty: 5,
    party: [mon('cofagrigus', EVS_MIXED_SPATK), mon('bouffalant', EVS_MIXED_SPATK), mon('seismitoad', EVS_MIXED_SPATK), mon('bisharp', EVS_MIXED_SPATK), mon('eelektross', EVS_MIXED_SPATK), mon('hydreigon', EVS_MIXED_SPATK)],
  },
];
