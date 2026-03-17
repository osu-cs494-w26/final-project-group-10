/**
 * EvolutionQuizPage.jsx
 * 10-question Pokémon evolution quiz.
 */

import React, { useState, useEffect } from 'react';
import { evolutionQuizBank } from '../data/evolutionQuizQuestions';

// Use same styles as PokemonQuizPage
const S = {
  wrap: {
    minHeight: 'calc(100vh - var(--nav-h))',
    background: 'var(--black)',
    padding: '2rem',
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

export default function EvolutionQuizPage({ setPage, setEvolutionQuizResult }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    const shuffled = [...evolutionQuizBank].sort(() => 0.5 - Math.random());
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

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowExplanation(false);
      } else {
        setQuizComplete(true);
        setEvolutionQuizResult({ score, total: questions.length });
        setPage('evolution-quiz-result');
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
    <div style={S.wrap}>
      <div style={S.container}>
        <div style={S.title}>Evolution Quiz</div>
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