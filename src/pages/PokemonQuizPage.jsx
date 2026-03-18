/**
 * PokemonQuizPage.jsx
<<<<<<< HEAD
 * 10 question Pokémon trivia quiz.
=======
 * 10-question Pokémon trivia quiz. Responsive.
>>>>>>> 1840e686ef19670f1555def14c311d7500ed50e8
 */

import React, { useState, useEffect } from 'react';
import { pokemonQuizBank } from '../data/pokemonQuizQuestions';

const S = {
  wrap: {
    position: 'relative', zIndex: 1,
  },
  container: {},
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
  },
  selected: {
    background: 'var(--grey-700)',
    borderColor: 'var(--white)',
  },
  correct: {
    background: 'rgba(74, 222, 128, 0.2)',
    borderColor: '#4ade80',
  },
  incorrect: {
    background: 'rgba(248, 113, 113, 0.2)',
    borderColor: '#f87171',
  },
  btn: {
    background: 'var(--grey-700)',
    border: '1px solid var(--border-lt)',
    color: 'var(--white)',
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '12px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '1rem',
  },
};

export default function PokemonQuizPage({ setPage, setPokemonQuizResult }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    // Randomly select 10 questions
    const shuffled = [...pokemonQuizBank].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 10));
  }, []);

  const handleOptionClick = (optionIndex) => {
    if (showExplanation) return;
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correct;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowExplanation(true);

    // Move to next after 1 second
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowExplanation(false);
      } else {
        setQuizComplete(true);
        setPokemonQuizResult({ score, total: questions.length });
        setPage('pokemon-quiz-result');
      }
    }, 1000);
  };

  if (questions.length === 0) {
    return (
      <div style={S.wrap}>
        <div style={S.container}>
          <div style={S.title}>Loading quiz...</div>
        </div>
      </div>
    );
  }

  if (quizComplete) return null;

  const currentQ = questions[currentIndex];
  const progress = `${currentIndex + 1} / ${questions.length}`;

  return (
    <div className="pokemon-quiz" style={S.wrap}>
      <style>{`
        @media (max-width: 768px) {
          .pokemon-quiz > div { padding: 1.5rem !important; }
          .pokemon-quiz .${S.title} { font-size: 20px !important; }
          .pokemon-quiz .${S.question} { font-size: 18px !important; }
          .pokemon-quiz .${S.option} { padding: 12px !important; font-size: 14px !important; }
          .pokemon-quiz .${S.btn} { font-size: 14px !important; }
        }
        @media (max-width: 480px) {
          .pokemon-quiz .${S.title} { font-size: 18px !important; }
          .pokemon-quiz .${S.question} { font-size: 16px !important; }
          .pokemon-quiz .${S.option} { padding: 10px !important; font-size: 13px !important; }
        }
      `}</style>
      <div style={S.container}>
        <div style={S.title}>Pokémon Quiz</div>
        <div style={S.progress}>Question {progress}</div>
        <div style={S.question}>{currentQ.question}</div>
        <div style={S.options}>
          {currentQ.options.map((opt, idx) => {
            let optionStyle = { ...S.option };
            if (selectedOption === idx) {
              if (showExplanation) {
                if (idx === currentQ.correct) {
                  optionStyle = { ...optionStyle, ...S.correct };
                } else {
                  optionStyle = { ...optionStyle, ...S.incorrect };
                }
              } else {
                optionStyle = { ...optionStyle, ...S.selected };
              }
            } else if (showExplanation && idx === currentQ.correct) {
              optionStyle = { ...optionStyle, ...S.correct };
            }
            return (
              <button
                key={idx}
                style={optionStyle}
                onClick={() => handleOptionClick(idx)}
                disabled={showExplanation}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {selectedOption !== null && !showExplanation && (
          <button style={S.btn} onClick={handleNext}>
            Submit Answer
          </button>
        )}
        {showExplanation && (
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--grey-400)', marginTop: '1rem', textAlign: 'center' }}>
            {selectedOption === currentQ.correct ? '✓ Correct!' : '✗ Incorrect'}
          </div>
        )}
      </div>
    </div>
  );
}