/**
 * personalityMappings.js
 * Maps Pokémon natures to regions and starter recommendations.
 */

// Region affinity based on nature characteristics
export const natureRegionMap = {
  // Kanto: bold, adventurous natures
  adamant: 'Kanto',
  bold: 'Kanto',
  naughty: 'Kanto',
  lax: 'Kanto',
  
  // Johto: traditional, balanced natures
  bashful: 'Johto',
  docile: 'Johto',
  hardy: 'Johto',
  quirky: 'Johto',
  serious: 'Johto',
  
  // Hoenn: energetic, nature-focused
  timid: 'Hoenn',
  hasty: 'Hoenn',
  jolly: 'Hoenn',
  naive: 'Hoenn',
  
  // Sinnoh: thoughtful, special-oriented
  modest: 'Sinnoh',
  mild: 'Sinnoh',
  quiet: 'Sinnoh',
  rash: 'Sinnoh',
  
  // Unova: defensive, sturdy
  calm: 'Unova',
  gentle: 'Unova',
  sassy: 'Unova',
  careful: 'Unova',
  
  // Also include remaining natures with default
  brave: 'Kanto',
  relaxed: 'Johto',
  impish: 'Hoenn',
  lonely: 'Sinnoh',
};

// Starter recommendation based on nature's increased stat
export const natureStarterMap = {
  attack: 'Charmander',      // Physical attackers
  defense: 'Squirtle',        // Defensive tanks
  'special-attack': 'Bulbasaur', // Special attackers
  'special-defense': 'Chikorita', // Special walls
  speed: 'Treecko',           // Fast Pokémon
};

// Fallback starters by generation if more variety wanted
export const starterOptions = {
  attack: ['Charmander', 'Torchic', 'Tepig', 'Chimchar'],
  defense: ['Squirtle', 'Totodile', 'Mudkip', 'Oshawott'],
  'special-attack': ['Bulbasaur', 'Cyndaquil', 'Treecko', 'Snivy'],
  'special-defense': ['Chikorita', 'Piplup', 'Turtwig', 'Chespin'],
  speed: ['Pikachu', 'Eevee', 'Riolu', 'Zorua'],
};