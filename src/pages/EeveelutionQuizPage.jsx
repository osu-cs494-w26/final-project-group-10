/**
 * EeveelutionQuizPage.jsx
 * 10-question quiz to determine your ideal Eeveelution.
 * Uses a scoring system based on 20 questions.
 */

import React, { useState, useEffect } from 'react';
import { eeveelutionQuizBank } from '../data/eeveelutionQuizQuestions';

const S = {
  wrap: {
    minHeight: 'calc(100vh - var(--nav-h))',
    padding: '2rem',
    position: 'relative',
    zIndex: 1,
  },
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    background: 'var(--grey-900)',
    border: '1px solid var(--border)',
    padding: '2rem',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--white)',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  progress: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--grey-500)',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  question: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    color: 'var(--white)',
    marginBottom: '2rem',
    lineHeight: 1.4,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem',
  },
  option: {
    background: 'var(--grey-800)',
    border: '1px solid var(--border)',
    color: 'var(--white)',
    padding: '14px 18px',
    fontSize: '16px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    '&:hover': {
      background: 'var(--grey-700)',
      borderColor: 'var(--grey-400)',
    },
  },
  selected: {
    background: 'var(--grey-700)',
    borderColor: 'var(--white)',
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

// Map Eeveelution names to sprite URLs
const eeveelutionSprites = {
  flareon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/136.gif',
  vaporeon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/134.gif',
  jolteon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/135.gif',
  espeon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/196.gif',
  umbreon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/197.gif',
  leafeon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/470.gif',
  glaceon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/471.gif',
};

// Map Eeveelution names to display names and descriptions
const eeveelutionDetails = {
  flareon: {
    name: 'Flareon',
    desc: 'Passionate, energetic, and warm-hearted. You light up any room you enter!',
    type: 'Fire',
  },
  vaporeon: {
    name: 'Vaporeon',
    desc: 'Calm, adaptable, and intuitive. You go with the flow and bring peace to others.',
    type: 'Water',
  },
  jolteon: {
    name: 'Jolteon',
    desc: 'Quick-witted, sharp, and full of energy. You\'re always on the move and ready for anything!',
    type: 'Electric',
  },
  espeon: {
    name: 'Espeon',
    desc: 'Intelligent, perceptive, and mystical. You have a deep understanding of the world around you.',
    type: 'Psychic',
  },
  umbreon: {
    name: 'Umbreon',
    desc: 'Mysterious, loyal, and protective. You\'re a trusted friend who shines brightest in the dark.',
    type: 'Dark',
  },
  leafeon: {
    name: 'Leafeon',
    desc: 'Grounded, peaceful, and connected to nature. You find beauty in the simple things.',
    type: 'Grass',
  },
  glaceon: {
    name: 'Glaceon',
    desc: 'Cool, composed, and elegant. You remain calm under pressure and inspire others.',
    type: 'Ice',
  },
};

export default function EeveelutionQuizPage({ setPage, setEeveelutionResult }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [scores, setScores] = useState({
    flareon: 0,
    vaporeon: 0,
    jolteon: 0,
    espeon: 0,
    umbreon: 0,
    leafeon: 0,
    glaceon: 0,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Initialize quiz: randomly select 10 questions
  useEffect(() => {
    setInitialLoading(true);
    const shuffled = [...eeveelutionQuizBank].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    setQuestions(selected);
    setInitialLoading(false);
  }, []);

  const handleOptionSelect = (optionIndex) => {
    const question = questions[currentIndex];
    const option = question.options[optionIndex];

    // Update answers
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    // Update scores
    const newScores = { ...scores };
    for (const [eeveelution, points] of Object.entries(option.points)) {
      newScores[eeveelution] = (newScores[eeveelution] || 0) + points;
    }
    setScores(newScores);

    // Move to next question or finish
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Quiz complete - calculate result
      computeResult(newScores);
    }
  };

  const computeResult = (finalScores) => {
    setLoading(true);

    // Find the Eeveelution with highest score
    let maxScore = -1;
    let result = 'flareon';

    for (const [eeveelution, score] of Object.entries(finalScores)) {
      if (score > maxScore) {
        maxScore = score;
        result = eeveelution;
      } else if (score === maxScore && Math.random() > 0.5) {
        // Tie breaker with randomness
        result = eeveelution;
      }
    }

    // Set result and navigate
    setEeveelutionResult({
      eeveelution: result,
      details: eeveelutionDetails[result],
      sprite: eeveelutionSprites[result],
      scores: finalScores 
    });
    setPage('eeveelution-result');
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="quiz-sub-wrap" style={S.wrap}>
        <div className="quiz-sub-container" style={S.container}>
          <div style={S.title}>Loading Quiz...</div>
          <div style={S.loadingContainer}>
            <div style={S.loadingText}>Preparing your Eeveelution assessment</div>
            <div style={S.loadingSubtext}>Getting ready to find your perfect match</div>
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

  const currentQ = questions[currentIndex];
  const progress = `${currentIndex + 1} / ${questions.length}`;

  return (
    <div className="quiz-sub-wrap" style={S.wrap}>
      <div className="quiz-sub-container" style={S.container}>
        <button
          onClick={() => setPage('quiz')}
          style={{
            background: 'none',
            border: '1px solid var(--white)',
            color: 'var(--white)',
            padding: '10px 24px',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            transition: 'all 0.15s',
            marginBottom: '1.5rem',
            display: 'block',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          ← Back to Quizzes
        </button>

        <div style={S.title}>Which Eeveelution Are You?</div>
        <div style={S.progress}>Question {progress}</div>

        {loading ? (
          <div style={S.loadingContainer}>
            <div style={S.loadingText}>Analyzing your personality...</div>
            <div style={S.loadingSubtext}>Finding your perfect Eeveelution match</div>
          </div>
        ) : (
          <>
            <div style={S.question}>{currentQ.question}</div>
            <div style={S.options}>
              {currentQ.options.map((option, idx) => (
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

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .eeveelution-quiz > div { padding: 1.5rem !important; }
          .eeveelution-quiz .${S.title} { font-size: 20px !important; }
          .eeveelution-quiz .${S.question} { font-size: 18px !important; }
          .eeveelution-quiz .${S.option} { padding: 12px !important; font-size: 14px !important; }
          .eeveelution-quiz .${S.progress} { font-size: 11px !important; }
        }
        @media (max-width: 480px) {
          .eeveelution-quiz > div { padding: 1rem !important; }
          .eeveelution-quiz .${S.title} { font-size: 18px !important; }
          .eeveelution-quiz .${S.question} { font-size: 16px !important; }
          .eeveelution-quiz .${S.option} { padding: 10px !important; font-size: 13px !important; }
        }
      `}</style>
    </div>
  );
}