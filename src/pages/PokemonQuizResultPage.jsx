/**
 * PokemonQuizResultPage.jsx
 * Displays score for Pokémon trivia quiz. Responsive.
 */

import React from 'react';

const S = {
  wrap: {
    minHeight: 'calc(100vh - var(--nav-h))',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '2rem', position: 'relative', zIndex: 1,
  },
  container: {},
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--white)',
    marginBottom: '2rem',
  },
  score: {
    fontFamily: 'var(--font-mono)',
    fontSize: '48px',
    color: 'var(--white)',
    marginBottom: '0.5rem',
  },
  percentage: {
    fontFamily: 'var(--font-mono)',
    fontSize: '18px',
    color: 'var(--grey-500)',
    marginBottom: '2rem',
  },
  btnRow: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  btn: {
    background: 'var(--grey-700)',
    border: '1px solid var(--border-lt)',
    color: 'var(--white)',
    fontFamily: 'var(--font-display)',
    fontSize: '14px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '12px 24px',
    cursor: 'pointer',
  },
};

export default function PokemonQuizResultPage({ result, setPage, clearResult }) {
  if (!result) {
    return <div style={S.wrap}>No result found.</div>;
  }

  const { score, total } = result;
  const percent = Math.round((score / total) * 100);

  const handleRetake = () => {
    clearResult();
    setPage('pokemon-quiz');
  };

  const handleBack = () => {
    setPage('quiz');
  };

  return (
    <div className="pokemon-quiz-result" style={S.wrap}>
      <style>{`
        @media (max-width: 768px) {
          .pokemon-quiz-result > div { padding: 2rem 1rem !important; }
          .pokemon-quiz-result .${S.title} { font-size: 24px !important; }
          .pokemon-quiz-result .${S.score} { font-size: 40px !important; }
          .pokemon-quiz-result .${S.percentage} { font-size: 16px !important; }
          .pokemon-quiz-result .${S.btnRow} { flex-direction: column !important; gap: 0.5rem !important; }
          .pokemon-quiz-result .${S.btn} { width: 100% !important; }
        }
      `}</style>
      <div style={S.container}>
        <div style={S.title}>Quiz Complete!</div>
        <div style={S.score}>{score} / {total}</div>
        <div style={S.percentage}>{percent}%</div>
        <div className="quiz-btn-row" style={S.btnRow}>
          <button style={S.btn} onClick={handleRetake}>Retake Quiz</button>
          <button style={S.btn} onClick={handleBack}>Back to Quizzes</button>
        </div>
      </div>
    </div>
  );
}