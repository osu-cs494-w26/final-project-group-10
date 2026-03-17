/**
 * EvolutionQuizResultPage.jsx
 * Displays score for evolution quiz.
 */

import React from 'react';

const S = {
  // Same style object as above
  wrap: {
    minHeight: 'calc(100vh - var(--nav-h))',
    background: 'var(--black)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  container: {
    maxWidth: '600px',
    width: '100%',
    background: 'var(--grey-900)',
    border: '1px solid var(--border)',
    padding: '3rem 2rem',
    textAlign: 'center',
  },
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

export default function EvolutionQuizResultPage({ result, setPage, clearResult }) {
  if (!result) {
    return <div style={S.wrap}>No result found.</div>;
  }

  const { score, total } = result;
  const percent = Math.round((score / total) * 100);

  const handleRetake = () => {
    clearResult();
    setPage('evolution-quiz');
  };

  const handleBack = () => {
    clearResult();
    setPage('quiz');
  };

  return (
    <div style={S.wrap}>
      <div style={S.container}>
        <div style={S.title}>Evolution Quiz Complete!</div>
        <div style={S.score}>{score} / {total}</div>
        <div style={S.percentage}>{percent}%</div>
        <div style={S.btnRow}>
          <button style={S.btn} onClick={handleRetake}>Retake Quiz</button>
          <button style={S.btn} onClick={handleBack}>Back to Quizzes</button>
        </div>
      </div>
    </div>
  );
}