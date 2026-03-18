/**
 * PersonalityQuizPage.jsx
 * A multi step quiz to determine the user's Pokémon nature.
 * Asks 10 random questions from a bank of 25.
 * On completion, navigates to result page with nature and team.
 */

import React, { useState, useEffect } from 'react';
import { 
  fetchAllNatures, 
  getAllPokemonList, 
  selectTeamForNature,
  generateTeamVariants, 
  computePreferredStats, 
  findMatchingNature 
} from '../utils/personalityUtils';
import { questionBank } from '../data/quizQuestions';

const S = {
  wrap: {
    position: 'relative', zIndex: 1,
    color: 'var(--white)', fontFamily: 'var(--font-mono)',
  },
  container: {},
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  question: {
    fontSize: '18px',
    marginBottom: '1.5rem',
    color: 'var(--grey-200)',
    lineHeight: 1.4,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  option: {
    background: 'var(--grey-800)',
    border: '1px solid var(--border)',
    color: 'var(--white)',
    padding: '12px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
    borderRadius: '4px',
    '&:hover': {
      background: 'var(--grey-700)',
      borderColor: 'var(--grey-400)',
    },
  },
  selected: {
    background: 'var(--grey-700)',
    borderColor: 'var(--white)',
  },
  progress: {
    textAlign: 'center',
    marginBottom: '1rem',
    color: 'var(--grey-500)',
    fontSize: '12px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '2rem',
  },
  loadingText: {
    fontSize: '18px',
    marginBottom: '1rem',
  },
  loadingSubtext: {
    fontSize: '14px',
    color: 'var(--grey-500)',
  },
};

export default function PersonalityQuizPage({ setPage, setQuizResult }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [statScores, setStatScores] = useState({
    attack: 0,
    defense: 0,
    'special-attack': 0,
    'special-defense': 0,
    speed: 0,
  });
  const [natures, setNatures] = useState([]);
  const [allPokemon, setAllPokemon] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Initialize quiz: select 10 random questions and fetch natures + all pokemon (Gen 1-5)
  useEffect(() => {
    async function initializeQuiz() {
      setInitialLoading(true);

      // Randomly select 10 unique questions
      const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 10);
      setQuestions(selected);

      try {
        // Fetch natures and get Gen 1-5 list
        const naturesData = await fetchAllNatures();
        setNatures(naturesData);
        setAllPokemon(getAllPokemonList()); // synchronous
      } catch (error) {
        console.error('Error initializing quiz:', error);
      } finally {
        setInitialLoading(false);
      }
    }

    initializeQuiz();
  }, []);

  const handleOptionSelect = (optionIndex) => {
    const question = questions[currentIndex];
    const option = question.options[optionIndex];

    // Update answers
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    // Update stat scores
    const newScores = { ...statScores };
    for (const [stat, points] of Object.entries(option.points)) {
      newScores[stat] = (newScores[stat] || 0) + points;
    }
    setStatScores(newScores);

    // Move to next question or finish
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Quiz complete - compute nature and team
      computeResults(newScores);
    }
  };


const computeResults = async (scores) => {
  setLoading(true);
  try {
    const { preferred, least } = computePreferredStats(scores);
    const nature = findMatchingNature(natures, preferred, least);

    // Generate all three team variants
    const teams = await generateTeamVariants(nature, allPokemon);

    // Save result with all teams
    setQuizResult({ 
      nature, 
      teams, // object with balanced, offensive, defensive
    });
    setPage('personality-result');
  } catch (error) {
    console.error('Error building teams:', error);
    alert('Something went wrong. Please try again.');
    // reset quiz
    setCurrentIndex(0);
    setAnswers([]);
    setStatScores({ attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 });
  } finally {
    setLoading(false);
  }
};

  if (initialLoading) {
    return (
      <div className="quiz-sub-wrap" style={S.wrap}>
        <div className="quiz-sub-container" style={S.container}>
          <div style={S.title}>Loading Quiz...</div>
          <div style={S.loadingContainer}>
            <div style={S.loadingText}>Preparing your personality assessment</div>
            <div style={S.loadingSubtext}>Fetching data from PokéAPI</div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-sub-wrap" style={S.wrap}>
        <div className="quiz-sub-container" style={S.container}>
          <div style={S.title}>Error</div>
          <div style={S.loadingContainer}>
            <div style={S.loadingText}>Could not load quiz questions</div>
            <button 
              style={{ ...S.option, marginTop: '1rem' }}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = `${currentIndex + 1} / ${questions.length}`;

  return (
    <div className="quiz-sub-wrap" style={S.wrap}>
      <div className="quiz-sub-container" style={S.container}>
      <button
        onClick={() => setPage('quiz')}
        style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s', alignSelf:'flex-start', marginBottom:'1.5rem', display:'block' }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background='none'}
      >
        ← Back to Quizzes
      </button>
        <div style={S.title}>Trainer Personality Quiz</div>
        <div style={S.progress}>Question {progress}</div>
        
        {loading ? (
          <div style={S.loadingContainer}>
            <div style={S.loadingText}>Analyzing your personality...</div>
            <div style={S.loadingSubtext}>Summoning your ideal team from over 650 Pokémon</div>
          </div>
        ) : (
          <>
            <div style={S.question}>{currentQuestion.text}</div>
            <div style={S.options}>
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  style={S.option}
                  onClick={() => handleOptionSelect(idx)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}