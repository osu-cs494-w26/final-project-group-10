/**
 * PersonalityResultPage.jsx
 * Displays the user's matched nature and recommended team of 6 Pokémon.
 * Uses animated sprites (GIFs) from Generation V when available.
 */

import React from 'react';

const S = {
  wrap: {
    minHeight: '100vh',
    background: 'var(--black)',
    color: 'var(--white)',
    padding: '2rem',
    fontFamily: 'var(--font-mono)',
  },
  container: {
    maxWidth: '800px',
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
    marginBottom: '1rem',
    textAlign: 'center',
  },
  natureBox: {
    background: 'var(--grey-800)',
    border: '1px solid var(--border)',
    padding: '1.5rem',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  natureName: {
    fontSize: '28px',
    fontFamily: 'var(--font-display)',
    textTransform: 'capitalize',
    marginBottom: '0.5rem',
    color: 'var(--white)',
  },
  natureDesc: {
    fontSize: '14px',
    color: 'var(--grey-400)',
    lineHeight: 1.5,
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  pokemonCard: {
    background: 'var(--grey-800)',
    border: '1px solid var(--border)',
    padding: '1rem',
    textAlign: 'center',
  },
  sprite: {
    width: '96px',
    height: '96px',
    imageRendering: 'pixelated',
    marginBottom: '0.5rem',
    objectFit: 'contain',
  },
  pokemonName: {
    fontSize: '14px',
    textTransform: 'capitalize',
    marginBottom: '0.25rem',
  },
  types: {
    fontSize: '11px',
    color: 'var(--grey-500)',
    textTransform: 'uppercase',
  },
  btnRow: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btn: {
    background: 'var(--grey-700)',
    border: '1px solid var(--border-lt)',
    color: 'var(--white)',
    fontFamily: 'var(--font-display)',
    fontSize: '14px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    padding: '12px 24px',
    cursor: 'pointer',
  },
  saveBtn: {
    background: 'var(--grey-700)',
    border: '1px solid #4ade80',
    color: '#4ade80',
    fontFamily: 'var(--font-display)',
    fontSize: '14px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    padding: '12px 24px',
    cursor: 'pointer',
  },
};

export default function PersonalityResultPage({ result, setPage, clearQuizResult, onSaveTeam }) {
  if (!result || !result.nature || !result.team) {
    return <div style={S.wrap}>No result found. Please take the quiz first.</div>;
  }

  const { nature, team } = result;
  const increased = nature.increased_stat?.name || 'none';
  const decreased = nature.decreased_stat?.name || 'none';

  const handleRetake = () => {
    clearQuizResult();
    setPage('personality-quiz');
  };

  const handleContinue = () => {
    setPage('home');
  };

  const handleSaveTeam = () => {
    onSaveTeam(team);
  };

  const getSpriteUrl = (pokemon) => {
    // Use animated sprite if available, otherwise fall back to static
    if (pokemon.animatedSprite) return pokemon.animatedSprite;
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
  };

  return (
    <div style={S.wrap}>
      <div style={S.container}>
        <div style={S.title}>Your Trainer Personality</div>

        <div style={S.natureBox}>
          <div style={S.natureName}>{nature.name}</div>
          <div style={S.natureDesc}>
            You value <strong>{increased}</strong> over <strong>{decreased}</strong>.
          </div>
        </div>

        <div style={{ ...S.title, fontSize: '20px', marginBottom: '1rem' }}>Your Recommended Team</div>

        <div style={S.teamGrid}>
          {team.map((pokemon) => (
            <div key={pokemon.id} style={S.pokemonCard}>
              <img
                style={S.sprite}
                src={getSpriteUrl(pokemon)}
                alt={pokemon.name}
                onError={(e) => {
                  // Fallback to static PNG if animated fails
                  e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
                }}
              />
              <div style={S.pokemonName}>{pokemon.name}</div>
              <div style={S.types}>
                {pokemon.types.join(' / ')}
              </div>
            </div>
          ))}
        </div>

        <div style={S.btnRow}>
          <button style={S.btn} onClick={handleRetake}>Retake Quiz</button>
          <button style={S.saveBtn} onClick={handleSaveTeam}>Save Team to Pokédex</button>
          <button style={S.btn} onClick={handleContinue}>Continue to PokéPortal</button>
        </div>
      </div>
    </div>
  );
}