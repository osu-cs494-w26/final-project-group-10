/**
 * eeveelutionQuizQuestions.js
 * Bank of 20 Eeveelution personality questions.
 * Each option maps to different Eeveelutions based on stats and traits.
 */

export const eeveelutionQuizBank = [
  {
    id: 1,
    question: "Which weather condition do you prefer?",
    options: [
      { text: "Sunny and bright", points: { flareon: 2, leafeon: 1, espeon: 1 } },
      { text: "Rainy and calm", points: { vaporeon: 2, umbreon: 1, glaceon: 0 } },
      { text: "Cold and snowy", points: { glaceon: 2, vaporeon: 1, leafeon: 0 } },
      { text: "Dark and mysterious", points: { umbreon: 2, espeon: 1, flareon: 0 } },
    ],
  },
  {
    id: 2,
    question: "How would your friends describe you?",
    options: [
      { text: "Loyal and protective", points: { umbreon: 2, vaporeon: 1, leafeon: 1 } },
      { text: "Energetic and passionate", points: { flareon: 2, jolteon: 1, espeon: 0 } },
      { text: "Calm and collected", points: { vaporeon: 2, glaceon: 1, umbreon: 1 } },
      { text: "Intelligent and perceptive", points: { espeon: 2, jolteon: 1, flareon: 0 } },
    ],
  },
  {
    id: 3,
    question: "What's your ideal way to spend a weekend?",
    options: [
      { text: "Hiking in nature", points: { leafeon: 2, vaporeon: 1, glaceon: 0 } },
      { text: "Relaxing at the beach", points: { vaporeon: 2, flareon: 1, umbreon: 0 } },
      { text: "Reading by a fireplace", points: { flareon: 2, espeon: 1, leafeon: 1 } },
      { text: "Exploring the city at night", points: { umbreon: 2, jolteon: 1, espeon: 1 } },
    ],
  },
  {
    id: 4,
    question: "Which color appeals to you most?",
    options: [
      { text: "Red / Orange", points: { flareon: 2, espeon: 1, jolteon: 0 } },
      { text: "Blue / Teal", points: { vaporeon: 2, glaceon: 1, umbreon: 0 } },
      { text: "Yellow / Gold", points: { jolteon: 2, espeon: 1, flareon: 1 } },
      { text: "Purple / Black", points: { umbreon: 2, glaceon: 1, vaporeon: 0 } },
    ],
  },
  {
    id: 5,
    question: "What's your favorite type of Pokémon move?",
    options: [
      { text: "Fire attacks", points: { flareon: 2, espeon: 1, jolteon: 0 } },
      { text: "Water attacks", points: { vaporeon: 2, glaceon: 1, umbreon: 0 } },
      { text: "Electric attacks", points: { jolteon: 2, espeon: 1, flareon: 1 } },
      { text: "Grass attacks", points: { leafeon: 2, vaporeon: 1, glaceon: 1 } },
    ],
  },
  {
    id: 6,
    question: "What's your preferred battle style?",
    options: [
      { text: "Hit hard and fast", points: { jolteon: 2, flareon: 1, espeon: 1 } },
      { text: "Defensive and tanky", points: { vaporeon: 2, umbreon: 1, glaceon: 1 } },
      { text: "Special attacks from afar", points: { espeon: 2, glaceon: 1, vaporeon: 1 } },
      { text: "Balanced and adaptable", points: { leafeon: 2, umbreon: 1, jolteon: 0 } },
    ],
  },
  {
    id: 7,
    question: "Which time of day do you feel most alive?",
    options: [
      { text: "Morning sunrise", points: { espeon: 2, leafeon: 1, jolteon: 1 } },
      { text: "Afternoon", points: { flareon: 2, leafeon: 1, vaporeon: 0 } },
      { text: "Evening sunset", points: { glaceon: 2, umbreon: 1, vaporeon: 1 } },
      { text: "Midnight", points: { umbreon: 2, espeon: 1, jolteon: 0 } },
    ],
  },
  {
    id: 8,
    question: "What's your favorite season?",
    options: [
      { text: "Spring", points: { leafeon: 2, espeon: 1, vaporeon: 1 } },
      { text: "Summer", points: { flareon: 2, jolteon: 1, espeon: 1 } },
      { text: "Autumn", points: { umbreon: 2, leafeon: 1, glaceon: 0 } },
      { text: "Winter", points: { glaceon: 2, vaporeon: 1, umbreon: 1 } },
    ],
  },
  {
    id: 9,
    question: "Which personality trait best describes you?",
    options: [
      { text: "Passionate and intense", points: { flareon: 2, jolteon: 1, espeon: 0 } },
      { text: "Calm and adaptable", points: { vaporeon: 2, leafeon: 1, glaceon: 1 } },
      { text: "Quick and witty", points: { jolteon: 2, espeon: 1, flareon: 1 } },
      { text: "Mysterious and loyal", points: { umbreon: 2, glaceon: 1, vaporeon: 0 } },
    ],
  },
  {
    id: 10,
    question: "What's your ideal pet?",
    options: [
      { text: "A cat (independent)", points: { umbreon: 2, espeon: 1, jolteon: 0 } },
      { text: "A dog (loyal)", points: { flareon: 2, vaporeon: 1, leafeon: 1 } },
      { text: "A fish (peaceful)", points: { vaporeon: 2, glaceon: 1, umbreon: 0 } },
      { text: "A bird (energetic)", points: { jolteon: 2, espeon: 1, flareon: 1 } },
    ],
  },
  {
    id: 11,
    question: "How do you handle stress?",
    options: [
      { text: "Confront it directly", points: { flareon: 2, jolteon: 1, umbreon: 0 } },
      { text: "Go with the flow", points: { vaporeon: 2, leafeon: 1, glaceon: 1 } },
      { text: "Analyze and plan", points: { espeon: 2, umbreon: 1, jolteon: 1 } },
      { text: "Retreat and recharge", points: { glaceon: 2, vaporeon: 1, leafeon: 1 } },
    ],
  },
  {
    id: 12,
    question: "Which element do you feel connected to?",
    options: [
      { text: "Fire", points: { flareon: 2, espeon: 1, jolteon: 0 } },
      { text: "Water", points: { vaporeon: 2, glaceon: 1, umbreon: 0 } },
      { text: "Earth", points: { leafeon: 2, umbreon: 1, vaporeon: 1 } },
      { text: "Air", points: { jolteon: 2, espeon: 1, flareon: 1 } },
    ],
  },
  {
    id: 13,
    question: "What's your favorite gemstone?",
    options: [
      { text: "Ruby (red)", points: { flareon: 2, espeon: 1, jolteon: 0 } },
      { text: "Sapphire (blue)", points: { vaporeon: 2, glaceon: 1, umbreon: 0 } },
      { text: "Emerald (green)", points: { leafeon: 2, vaporeon: 1, glaceon: 1 } },
      { text: "Amethyst (purple)", points: { umbreon: 2, espeon: 1, flareon: 0 } },
    ],
  },
  {
    id: 14,
    question: "Which Pokémon type appeals to you most?",
    options: [
      { text: "Fire", points: { flareon: 2, espeon: 1, jolteon: 0 } },
      { text: "Water", points: { vaporeon: 2, glaceon: 1, umbreon: 0 } },
      { text: "Electric", points: { jolteon: 2, espeon: 1, flareon: 1 } },
      { text: "Grass", points: { leafeon: 2, vaporeon: 1, glaceon: 1 } },
    ],
  },
  {
    id: 15,
    question: "What's your ideal climate?",
    options: [
      { text: "Hot and dry", points: { flareon: 2, leafeon: 1, jolteon: 0 } },
      { text: "Tropical and humid", points: { vaporeon: 2, leafeon: 1, espeon: 0 } },
      { text: "Cool and crisp", points: { glaceon: 2, umbreon: 1, jolteon: 1 } },
      { text: "Temperate forests", points: { leafeon: 2, umbreon: 1, vaporeon: 1 } },
    ],
  },
  {
    id: 16,
    question: "How do you make decisions?",
    options: [
      { text: "With my heart", points: { flareon: 2, vaporeon: 1, umbreon: 0 } },
      { text: "With logic", points: { espeon: 2, jolteon: 1, glaceon: 1 } },
      { text: "With intuition", points: { umbreon: 2, espeon: 1, leafeon: 1 } },
      { text: "With experience", points: { vaporeon: 2, leafeon: 1, glaceon: 1 } },
    ],
  },
  {
    id: 17,
    question: "What's your favorite type of landscape?",
    options: [
      { text: "Volcanic mountains", points: { flareon: 2, jolteon: 1, umbreon: 0 } },
      { text: "Oceans and lakes", points: { vaporeon: 2, glaceon: 1, leafeon: 0 } },
      { text: "Forests and meadows", points: { leafeon: 2, umbreon: 1, vaporeon: 1 } },
      { text: "Snowy peaks", points: { glaceon: 2, vaporeon: 1, flareon: 0 } },
    ],
  },
  {
    id: 18,
    question: "Which Eeveelution do you think is the cutest?",
    options: [
      { text: "Flareon (fluffy)", points: { flareon: 1, vaporeon: 1, leafeon: 1 } },
      { text: "Vaporeon (elegant)", points: { vaporeon: 1, glaceon: 1, espeon: 1 } },
      { text: "Jolteon (spiky)", points: { jolteon: 1, umbreon: 1, flareon: 1 } },
      { text: "All are adorable!", points: { leafeon: 1, umbreon: 1, glaceon: 1 } },
    ],
  },
  {
    id: 19,
    question: "What's your energy level like?",
    options: [
      { text: "High energy, always moving", points: { jolteon: 2, flareon: 1, espeon: 0 } },
      { text: "Moderate, balanced", points: { leafeon: 2, vaporeon: 1, umbreon: 1 } },
      { text: "Calm and relaxed", points: { vaporeon: 2, glaceon: 1, leafeon: 1 } },
      { text: "Reserved, but powerful when needed", points: { umbreon: 2, glaceon: 1, flareon: 0 } },
    ],
  },
  {
    id: 20,
    question: "Which sounds most appealing to you?",
    options: [
      { text: "A crackling fire", points: { flareon: 2, jolteon: 1, espeon: 0 } },
      { text: "Ocean waves", points: { vaporeon: 2, glaceon: 1, umbreon: 0 } },
      { text: "A thunderstorm", points: { jolteon: 2, flareon: 1, umbreon: 1 } },
      { text: "A quiet forest", points: { leafeon: 2, vaporeon: 1, glaceon: 1 } },
    ],
  },
];