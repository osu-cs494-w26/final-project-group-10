/**
 * quizQuestions.js
 * Bank of 25 personality questions that map to Pokémon stats.
 * Each option contributes points to one or more stats.
 */

export const questionBank = [
  {
    id: 1,
    text: "In a tough situation, you're most likely to:",
    options: [
      { text: "Charge head-on and overpower the problem", points: { attack: 2, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 } },
      { text: "Outsmart it with clever tactics", points: { attack: 0, defense: 0, 'special-attack': 2, 'special-defense': 0, speed: 1 } },
      { text: "Endure and wait for the right moment", points: { attack: 0, defense: 2, 'special-attack': 0, 'special-defense': 1, speed: 0 } },
      { text: "Rely on speed and agility to escape or finish quickly", points: { attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 2 } },
    ],
  },
  {
    id: 2,
    text: "Your ideal battle style is:",
    options: [
      { text: "Overwhelming physical force", points: { attack: 2, defense: 1, 'special-attack': 0, 'special-defense': 0, speed: 0 } },
      { text: "Precise special moves from a distance", points: { attack: 0, defense: 0, 'special-attack': 2, 'special-defense': 1, speed: 0 } },
      { text: "A balanced mix of offense and defense", points: { attack: 1, defense: 1, 'special-attack': 1, 'special-defense': 1, speed: 0 } },
      { text: "Hit hard and fast before they react", points: { attack: 1, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 2 } },
    ],
  },
  {
    id: 3,
    text: "What's your favorite way to spend a weekend?",
    options: [
      { text: "Hiking or outdoor sports", points: { attack: 1, defense: 1, speed: 1 } },
      { text: "Reading or solving puzzles", points: { 'special-attack': 1, 'special-defense': 1 } },
      { text: "Relaxing at home", points: { defense: 1, 'special-defense': 1 } },
      { text: "Socializing with friends", points: { speed: 1, attack: 1 } },
    ],
  },
  {
    id: 4,
    text: "Choose a snack:",
    options: [
      { text: "Spicy chips", points: { attack: 1, speed: 1 } },
      { text: "Sweet cake", points: { 'special-defense': 1, defense: 1 } },
      { text: "Sour candy", points: { 'special-attack': 1, speed: 1 } },
      { text: "Bitter dark chocolate", points: { defense: 1, 'special-defense': 1 } },
    ],
  },
  {
    id: 5,
    text: "In a group project, you tend to:",
    options: [
      { text: "Take charge and lead", points: { attack: 2, speed: 1 } },
      { text: "Support others and fill gaps", points: { defense: 2, 'special-defense': 1 } },
      { text: "Come up with creative ideas", points: { 'special-attack': 2, speed: 1 } },
      { text: "Keep everyone organized", points: { defense: 1, 'special-defense': 1 } },
    ],
  },
  {
    id: 6,
    text: "Which color appeals to you most?",
    options: [
      { text: "Red (passion, energy)", points: { attack: 2, speed: 1 } },
      { text: "Blue (calm, stability)", points: { defense: 2, 'special-defense': 1 } },
      { text: "Yellow (optimism, intellect)", points: { 'special-attack': 2, speed: 1 } },
      { text: "Green (balance, growth)", points: { defense: 1, 'special-defense': 1 } },
    ],
  },
  {
    id: 7,
    text: "Your greatest strength is:",
    options: [
      { text: "Physical strength", points: { attack: 3 } },
      { text: "Mental fortitude", points: { 'special-defense': 2, defense: 1 } },
      { text: "Quick thinking", points: { speed: 2, 'special-attack': 1 } },
      { text: "Resilience", points: { defense: 2, 'special-defense': 1 } },
    ],
  },
  {
    id: 8,
    text: "You're more likely to be described as:",
    options: [
      { text: "Bold and impulsive", points: { attack: 2, speed: 1 } },
      { text: "Thoughtful and cautious", points: { 'special-defense': 2, defense: 1 } },
      { text: "Curious and inventive", points: { 'special-attack': 2, speed: 1 } },
      { text: "Patient and steady", points: { defense: 2, 'special-defense': 1 } },
    ],
  },
  {
    id: 9,
    text: "Pick a Pokémon type you're drawn to:",
    options: [
      { text: "Fire / Fighting", points: { attack: 2, speed: 1 } },
      { text: "Water / Ice", points: { defense: 1, 'special-defense': 1 } },
      { text: "Electric / Psychic", points: { 'special-attack': 2, speed: 1 } },
      { text: "Grass / Ground", points: { defense: 2, 'special-defense': 1 } },
    ],
  },
  {
    id: 10,
    text: "How do you handle stress?",
    options: [
      { text: "Confront it directly", points: { attack: 2, defense: 1 } },
      { text: "Analyze and plan", points: { 'special-attack': 2, 'special-defense': 1 } },
      { text: "Take a break and relax", points: { defense: 1, 'special-defense': 2 } },
      { text: "Keep moving to avoid it", points: { speed: 2, attack: 1 } },
    ],
  },
  {
    id: 11,
    text: "Your favorite season is:",
    options: [
      { text: "Spring (new beginnings)", points: { speed: 1, attack: 1 } },
      { text: "Summer (heat and energy)", points: { attack: 2, speed: 1 } },
      { text: "Autumn (harvest and preparation)", points: { defense: 1, 'special-defense': 1 } },
      { text: "Winter (stillness and resilience)", points: { defense: 2, 'special-defense': 1 } },
    ],
  },
  {
    id: 12,
    text: "In a video game, you prefer:",
    options: [
      { text: "Melee combat", points: { attack: 2, defense: 1 } },
      { text: "Magic or spells", points: { 'special-attack': 2, 'special-defense': 1 } },
      { text: "Stealth and speed", points: { speed: 2, attack: 1 } },
      { text: "Tanking and protecting", points: { defense: 2, 'special-defense': 1 } },
    ],
  },
  {
    id: 13,
    text: "What's your ideal pet?",
    options: [
      { text: "A loyal dog", points: { attack: 1, defense: 1 } },
      { text: "An independent cat", points: { speed: 1, 'special-attack': 1 } },
      { text: "A colorful bird", points: { speed: 2, 'special-attack': 1 } },
      { text: "A low-maintenance reptile", points: { defense: 2, 'special-defense': 1 } },
    ],
  },
  {
    id: 14,
    text: "You're more motivated by:",
    options: [
      { text: "Competition and victory", points: { attack: 2, speed: 1 } },
      { text: "Knowledge and discovery", points: { 'special-attack': 2, 'special-defense': 1 } },
      { text: "Security and stability", points: { defense: 2, 'special-defense': 1 } },
      { text: "Freedom and adventure", points: { speed: 2, attack: 1 } },
    ],
  },
  {
    id: 15,
    text: "Choose a hobby:",
    options: [
      { text: "Sports or gym", points: { attack: 2, defense: 1 } },
      { text: "Chess or puzzles", points: { 'special-attack': 2, 'special-defense': 1 } },
      { text: "Meditation or yoga", points: { defense: 1, 'special-defense': 2 } },
      { text: "Dancing or running", points: { speed: 2, attack: 1 } },
    ],
  },
  {
    id: 16,
    text: "Your friends would say you're:",
    options: [
      { text: "The protector", points: { defense: 2, 'special-defense': 1 } },
      { text: "The joker", points: { speed: 2, attack: 1 } },
      { text: "The brains", points: { 'special-attack': 2, 'special-defense': 1 } },
      { text: "The muscle", points: { attack: 2, defense: 1 } },
    ],
  },
  {
    id: 17,
    text: "What's your favorite type of music?",
    options: [
      { text: "Rock / Metal", points: { attack: 2, speed: 1 } },
      { text: "Classical / Jazz", points: { 'special-attack': 1, 'special-defense': 1 } },
      { text: "Pop / Dance", points: { speed: 2, attack: 1 } },
      { text: "Ambient / Chill", points: { defense: 1, 'special-defense': 2 } },
    ],
  },
  {
    id: 18,
    text: "How do you make decisions?",
    options: [
      { text: "Quickly and intuitively", points: { speed: 2, attack: 1 } },
      { text: "After careful analysis", points: { 'special-attack': 2, 'special-defense': 1 } },
      { text: "Based on past experience", points: { defense: 2, 'special-defense': 1 } },
      { text: "By discussing with others", points: { attack: 1, speed: 1 } },
    ],
  },
  {
    id: 19,
    text: "Your dream vacation is:",
    options: [
      { text: "A mountain trek", points: { attack: 1, defense: 1 } },
      { text: "A cultural city tour", points: { 'special-attack': 1, speed: 1 } },
      { text: "A relaxing beach", points: { defense: 1, 'special-defense': 2 } },
      { text: "An adventure theme park", points: { speed: 2, attack: 1 } },
    ],
  },
  {
    id: 20,
    text: "You're most afraid of:",
    options: [
      { text: "Being physically weak", points: { attack: 2, defense: 1 } },
      { text: "Being outsmarted", points: { 'special-defense': 2, 'special-attack': 1 } },
      { text: "Being slow to react", points: { speed: 2, attack: 1 } },
      { text: "Being vulnerable", points: { defense: 2, 'special-defense': 1 } },
    ],
  },
  {
    id: 21,
    text: "Choose a mythical creature:",
    options: [
      { text: "Dragon (power)", points: { attack: 2, 'special-attack': 1 } },
      { text: "Phoenix (rebirth)", points: { speed: 1, 'special-defense': 1 } },
      { text: "Griffin (guardian)", points: { defense: 2, attack: 1 } },
      { text: "Unicorn (magic)", points: { 'special-attack': 2, 'special-defense': 1 } },
    ],
  },
  {
    id: 22,
    text: "Your preferred climate:",
    options: [
      { text: "Hot and dry", points: { attack: 2, speed: 1 } },
      { text: "Cold and snowy", points: { defense: 2, 'special-defense': 1 } },
      { text: "Mild and rainy", points: { 'special-attack': 1, 'special-defense': 1 } },
      { text: "Windy and changeable", points: { speed: 2, 'special-attack': 1 } },
    ],
  },
  {
    id: 23,
    text: "In a conflict, you tend to:",
    options: [
      { text: "Fight back immediately", points: { attack: 2, speed: 1 } },
      { text: "Defend and hold your ground", points: { defense: 2, 'special-defense': 1 } },
      { text: "Use words to defuse", points: { 'special-attack': 1, 'special-defense': 1 } },
      { text: "Avoid or escape", points: { speed: 2, defense: 1 } },
    ],
  },
  {
    id: 24,
    text: "What's your favorite gemstone?",
    options: [
      { text: "Ruby (red)", points: { attack: 2, speed: 1 } },
      { text: "Sapphire (blue)", points: { defense: 2, 'special-defense': 1 } },
      { text: "Emerald (green)", points: { 'special-defense': 1, defense: 1 } },
      { text: "Diamond (clear)", points: { 'special-attack': 2, speed: 1 } },
    ],
  },
  {
    id: 25,
    text: "You're most like which Pokémon character?",
    options: [
      { text: "Ash (determined)", points: { attack: 1, speed: 1 } },
      { text: "Misty (passionate)", points: { 'special-attack': 1, speed: 1 } },
      { text: "Brock (caring)", points: { defense: 1, 'special-defense': 2 } },
      { text: "Gary (confident)", points: { attack: 1, 'special-attack': 1 } },
    ],
  },
];