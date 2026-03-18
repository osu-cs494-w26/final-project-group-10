/*
* wtpModes.js
* Data and configuration for "Who's That Pokémon?" game modes and options.
*/

// All different gamemode setup options for the modes that require them (generation, type, color, evolution stage)
export const GENERATION_OPTIONS = Array.from({ length: 9 }, (_, index) => ({
  value: String(index + 1),
  label: `Generation ${index + 1}`,
}));

export const TYPE_OPTIONS = [
  'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting', 'fire', 'flying',
  'ghost', 'grass', 'ground', 'ice', 'normal', 'poison', 'psychic', 'rock',
  'steel', 'water',
].map((value) => ({ value, label: value }));

export const COLOR_OPTIONS = [
  'black', 'blue', 'brown', 'gray', 'green', 'pink', 'purple', 'red', 'white', 'yellow',
].map((value) => ({ value, label: value }));

export const EVOLUTION_STAGE_OPTIONS = [
  { value: 'base', label: 'Base Stage' },
  { value: 'middle', label: 'Middle Stage' },
  { value: 'final', label: 'Final Stage' },
];

// Defines the different game types available for each mode, each with its own scoring and round limit rules.
export const WTP_GAME_TYPES = [
  {
    key: 'freeplay',
    label: 'Freeplay',
    shortLabel: 'Freeplay',
    description: 'Unlimited rounds with streak-focused scoring.',
    roundLimit: null,
  },
  {
    key: 'challenge-5',
    label: '5 Round Challenge',
    shortLabel: 'Easy',
    description: 'A quick run that works well for short sessions.',
    roundLimit: 5,
  },
  {
    key: 'challenge-10',
    label: '10 Round Challenge',
    shortLabel: 'Medium',
    description: 'Balanced run length for most players.',
    roundLimit: 10,
  },
  {
    key: 'challenge-20',
    label: '20 Round Challenge',
    shortLabel: 'Hard',
    description: 'Long-form endurance run with more score variance.',
    roundLimit: 20,
  },
];

// All different game modes each with it's own theme
export const WTP_MODES = [
  {
    key: 'classic',
    title: 'Classic',
    subtitle: 'Nostalgia Trip',
    description: 'The classic game we all know and love. A random Pokémon from the full National Pokédex every time.',
    accent: '#63d471',
    glow: 'rgba(99, 212, 113, 0.28)',
    bg: '#17351b',
    allowsHints: true,
    maxGuesses: 1,
    setup: null,
    featured: true,
  },
  {
    key: 'daily',
    title: 'Daily Challenge',
    subtitle: 'One Pokémon Per Day',
    description: 'A new Pokémon every day. Can you guess them all?',
    accent: '#8bd3ff',
    glow: 'rgba(93, 170, 255, 0.22)',
    bg: '#17345a',
    allowsHints: true,
    maxGuesses: 1,
    setup: null,
    gameTypes: ['freeplay'],
  },
  {
    key: 'generation',
    title: 'Generations',
    subtitle: 'We all have a favorite',
    description: 'Travels through the Eras of Pokémon. Pick a generation and guess the Pokémon from that region.',
    accent: '#ffb454',
    glow: 'rgba(255, 180, 84, 0.24)',
    bg: '#5a3510',
    allowsHints: true,
    maxGuesses: 1,
    setup: 'generation',
    gameTypes: WTP_GAME_TYPES.map((type) => type.key),
  },
  {
    key: 'type',
    title: 'Types',
    subtitle: 'Element Focus',
    description: 'Master the elements. Choose a type and guess which Pokémon lurks behind the silhouette.',
    accent: '#ff7d7d',
    glow: 'rgba(255, 125, 125, 0.24)',
    bg: '#5d1d1d',
    allowsHints: true,
    maxGuesses: 1,
    setup: 'type',
    gameTypes: WTP_GAME_TYPES.map((type) => type.key),
  },
  {
    key: 'starters',
    title: 'Starters',
    subtitle: 'I choose you!',
    description: 'Only the most trusted companions. Guess from the 27 classic starter Pokémon.',
    accent: '#ffe16a',
    glow: 'rgba(255, 225, 106, 0.22)',
    bg: '#5d4c12',
    allowsHints: true,
    maxGuesses: 1,
    setup: null,
    gameTypes: WTP_GAME_TYPES.map((type) => type.key),
  },
  {
    key: 'legendary',
    title: 'Legendary / Mythic',
    subtitle: 'Rare Encounters',
    description: 'Ancient power and rare sightings. Only the most legendary Pokémon appear in this challenge.',
    accent: '#d38dff',
    glow: 'rgba(211, 141, 255, 0.24)',
    bg: '#4d205f',
    allowsHints: true,
    maxGuesses: 1,
    setup: null,
    gameTypes: WTP_GAME_TYPES.map((type) => type.key),
  },
  {
    key: 'color',
    title: 'Colors',
    subtitle: 'Color Classification',
    description: 'A rainbow of possibilities. Choose a color and guess which Pokémon matches the silhouette.',
    accent: '#7df6d9',
    glow: 'rgba(125, 246, 217, 0.20)',
    bg: '#164a42',
    allowsHints: true,
    maxGuesses: 1,
    setup: 'color',
    gameTypes: WTP_GAME_TYPES.map((type) => type.key),
  },
  {
    key: 'evolution',
    title: 'Evolutions',
    subtitle: 'Stage Specific',
    description: 'From humble beginnings to final forms. Choose an evolution stage and identify the Pokémon.',
    accent: '#f59cc8',
    glow: 'rgba(245, 156, 200, 0.22)',
    bg: '#5a2540',
    allowsHints: true,
    maxGuesses: 1,
    setup: 'evolution',
    gameTypes: WTP_GAME_TYPES.map((type) => type.key),
  },
  {
    key: 'hard',
    title: 'Hard Mode',
    subtitle: 'Pokémon Masters',
    description: 'One guess, no hints, all Pokémon. Only for the true Pokémon Masters.',
    accent: '#ff5e5e',
    glow: 'rgba(255, 94, 94, 0.22)',
    bg: '#611b1b',
    allowsHints: false,
    maxGuesses: 1,
    setup: null,
    gameTypes: WTP_GAME_TYPES.map((type) => type.key),
  },
];

export const WTP_MODE_MAP = Object.fromEntries(WTP_MODES.map((mode) => [mode.key, mode]));

// Helper functions to retrieve mode setup options and labels based on the mode's setup key.
export function getModeSetupOptions(setupKey) {
  switch (setupKey) {
    case 'generation':
      return GENERATION_OPTIONS;
    case 'type':
      return TYPE_OPTIONS;
    case 'color':
      return COLOR_OPTIONS;
    case 'evolution':
      return EVOLUTION_STAGE_OPTIONS;
    default:
      return [];
  }
}

// Returns the label to display for the mode setup selection based on the mode's setup key.
export function getModeSetupLabel(setupKey) {
  switch (setupKey) {
    case 'generation':
      return 'Choose a generation';
    case 'type':
      return 'Choose a type';
    case 'color':
      return 'Choose a color';
    case 'evolution':
      return 'Choose an evolution stage';
    default:
      return 'Choose an option';
  }
}

// Helper functions to retrieve game type information based on the selected game type key and mode configuration.
export function getGameTypeByKey(gameTypeKey) {
  return WTP_GAME_TYPES.find((type) => type.key === gameTypeKey) || WTP_GAME_TYPES[0];
}

// Returns the list of available game types for a given mode, filtering based on the mode's allowed game types if specified.
export function getAvailableGameTypes(mode) {
  const allowedKeys = mode?.gameTypes?.length ? mode.gameTypes : WTP_GAME_TYPES.map((type) => type.key);
  return WTP_GAME_TYPES.filter((type) => allowedKeys.includes(type.key));
}
