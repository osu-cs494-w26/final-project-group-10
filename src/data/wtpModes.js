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
  },
  {
    key: 'generation',
    title: 'Generation',
    subtitle: 'We all have a favorite',
    description: 'Travels through the Eras of Pokémon. Pick a generation and guess the Pokémon from that region.',
    accent: '#ffb454',
    glow: 'rgba(255, 180, 84, 0.24)',
    bg: '#5a3510',
    allowsHints: true,
    maxGuesses: 1,
    setup: 'generation',
  },
  {
    key: 'type',
    title: 'Type',
    subtitle: 'Element Focus',
    description: 'Master the elements. Choose a type and guess which Pokémon lurks behind the silhouette.',
    accent: '#ff7d7d',
    glow: 'rgba(255, 125, 125, 0.24)',
    bg: '#5d1d1d',
    allowsHints: true,
    maxGuesses: 1,
    setup: 'type',
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
  },
  {
    key: 'color',
    title: 'Color',
    subtitle: 'Color Classification',
    description: 'A rainbow of possibilities. Choose a color and guess which Pokémon matches the silhouette.',
    accent: '#7df6d9',
    glow: 'rgba(125, 246, 217, 0.20)',
    bg: '#164a42',
    allowsHints: true,
    maxGuesses: 1,
    setup: 'color',
  },
  {
    key: 'evolution',
    title: 'Evolution',
    subtitle: 'Stage Specific',
    description: 'From humble beginnings to final forms. Choose an evolution stage and identify the Pokémon.',
    accent: '#f59cc8',
    glow: 'rgba(245, 156, 200, 0.22)',
    bg: '#5a2540',
    allowsHints: true,
    maxGuesses: 1,
    setup: 'evolution',
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
  },
];

export const WTP_MODE_MAP = Object.fromEntries(WTP_MODES.map((mode) => [mode.key, mode]));

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
