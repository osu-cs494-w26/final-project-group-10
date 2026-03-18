/**
 * EeveelutionQuizResultPage.jsx
 * Displays your ideal Eeveelution match.
 */

import React from 'react';

const S = {
  wrap: {
    minHeight: 'calc(100vh - var(--nav-h))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    zIndex: 1,
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
  resultCard: {
    background: 'var(--grey-800)',
    border: '1px solid var(--border)',
    padding: '2rem',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  sprite: {
    width: '120px',
    height: '120px',
    imageRendering: 'pixelated',
    objectFit: 'contain',
  },
  eeveelutionName: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    textTransform: 'capitalize',
    color: 'var(--white)',
    letterSpacing: '0.1em',
  },
  type: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--grey-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  description: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--grey-300)',
    lineHeight: 1.6,
    marginTop: '0.5rem',
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
    transition: 'all 0.15s',
    '&:hover': {
      background: 'var(--grey-600)',
    },
  },
  backBtn: {
    background: 'none',
    border: '1px solid var(--white)',
    color: 'var(--white)',
    fontFamily: 'var(--font-display)',
    fontSize: '14px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '10px 24px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginBottom: '2rem',
    display: 'inline-block',
  },
};

// Type colors for accents
const typeColors = {
  Fire: '#F08030',
  Water: '#6890F0',
  Electric: '#F8D030',
  Psychic: '#F85888',
  Dark: '#705848',
  Grass: '#78C850',
  Ice: '#98D8D8',
};

export default function EeveelutionQuizResultPage({ result, setPage, clearResult }) {
  if (!result) {
    return (
      <div style={S.wrap}>
        <div style={S.container}>
          <div style={S.title}>No Result Found</div>
          <div style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>
            Please take the quiz first to see your Eeveelution match.
          </div>
          <button
            style={S.backBtn}
            onClick={() => setPage('eeveelution-quiz')}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            Take Quiz
          </button>
        </div>
      </div>
    );
  }

  const { eeveelution, details, sprite } = result;
  const typeColor = typeColors[details.type] || '#888';

  const handleRetake = () => {
    clearResult();
    setPage('eeveelution-quiz');
  };

  const handleBack = () => {
    clearResult();
    setPage('quiz');
  };

  return (
    <div className="eeveelution-result" style={S.wrap}>
      <style>{`
        @media (max-width: 768px) {
          .eeveelution-result > div { padding: 2rem 1rem !important; }
          .eeveelution-result h2 { font-size: 24px !important; }
          .eeveelution-result .result-card { padding: 1.5rem !important; }
          .eeveelution-result .pokemon-name { font-size: 20px !important; }
          .eeveelution-result .description { font-size: 12px !important; }
          .eeveelution-result .sprite { width: 96px !important; height: 96px !important; }
          .eeveelution-result .btn-row { flex-direction: column !important; gap: 0.5rem !important; }
          .eeveelution-result button { width: 100% !important; }
        }
        @media (max-width: 480px) {
          .eeveelution-result > div { padding: 1.5rem 1rem !important; }
          .eeveelution-result h2 { font-size: 20px !important; }
          .eeveelution-result .pokemon-name { font-size: 18px !important; }
        }
      `}</style>

      <div style={S.container}>
        {/* Back button to quiz hub */}
        <button
          onClick={handleBack}
          style={S.backBtn}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          ← Back to Quizzes
        </button>

        <h2 style={S.title}>Your Eeveelution Match</h2>
        
        <div
          className="result-card"
          style={{ ...S.resultCard, borderLeft: `4px solid ${typeColor}` }}
        >
          <img
            className="sprite"
            src={sprite}
            alt={details.name}
            style={S.sprite}
            onError={(e) => {
              e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                eeveelution === 'flareon' ? '136' :
                eeveelution === 'vaporeon' ? '134' :
                eeveelution === 'jolteon' ? '135' :
                eeveelution === 'espeon' ? '196' :
                eeveelution === 'umbreon' ? '197' :
                eeveelution === 'leafeon' ? '470' : '471'
              }.png`;
            }}
          />
          <div className="pokemon-name" style={S.eeveelutionName}>{details.name}</div>
          <div className="type" style={{ ...S.type, color: typeColor }}>{details.type} Type</div>
          <div className="description" style={S.description}>{details.desc}</div>
        </div>

        <div className="btn-row" style={S.btnRow}>
          <button style={S.btn} onClick={handleRetake}>
            Retake Quiz
          </button>
          <button style={S.btn} onClick={handleBack}>
            Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
}