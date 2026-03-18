/**
 * PersonalityResultPage.jsx
 * Displays nature, region affinity, ideal starter, and three team builds.
 * Features animated sprites and centered starter card. Responsive.
 */

import React, { useState } from 'react';
import { natureRegionMap, natureStarterMap } from '../data/personalityMappings';

const S = {
  wrap: {
    minHeight: '100vh',
    color: 'var(--white)',
    padding: 'clamp(1rem,3vw,2rem)',
    fontFamily: 'var(--font-mono)',
    position: 'relative',
    zIndex: 1,
  },
  container: {},
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--white)',
    textAlign: 'center',
  },
  regionBadge: {
    background: 'var(--grey-800)',
    border: '1px solid var(--border-lt)',
    padding: '6px 16px',
    fontFamily: 'var(--font-display)',
    fontSize: '14px',
    letterSpacing: '0.1em',
    color: 'var(--white)',
    borderRadius: '30px',
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
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--white)',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  starterCard: {
    background: 'var(--grey-800)',
    border: '1px solid var(--border)',
    padding: '1.5rem',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    maxWidth: '300px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  starterSprite: {
    width: '120px',
    height: '120px',
    imageRendering: 'pixelated',
    objectFit: 'contain',
  },
  starterName: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    textTransform: 'capitalize',
    color: 'var(--white)',
    letterSpacing: '0.1em',
  },
  tabRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '0.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  tab: (active, accent) => ({
    background: 'transparent',
    border: 'none',
    borderBottom: active ? `2px solid ${accent}` : '2px solid transparent',
    color: active ? 'var(--white)' : 'var(--grey-500)',
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
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
    marginTop: '1rem',
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
    transition: 'all 0.15s',
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
    transition: 'all 0.15s',
  },
};

// Map starter names to Pokémon IDs for sprite URLs
const starterIdMap = {
  'Charmander': '4',
  'Squirtle': '7',
  'Bulbasaur': '1',
  'Chikorita': '152',
  'Cyndaquil': '155',
  'Totodile': '158',
  'Treecko': '252',
  'Torchic': '255',
  'Mudkip': '258',
  'Turtwig': '387',
  'Chimchar': '390',
  'Piplup': '393',
  'Snivy': '495',
  'Tepig': '498',
  'Oshawott': '501',
  'Pikachu': '25',
  'Eevee': '133',
  'Riolu': '447',
  'Zorua': '570',
};

export default function PersonalityResultPage({ result, setPage, clearQuizResult, onSaveTeam }) {
  const [activeTeam, setActiveTeam] = useState('balanced');

  if (!result || !result.nature || !result.teams) {
    return <div style={S.wrap}>No result found. Please take the quiz first.</div>;
  }

  const { nature, teams } = result;
  const increased = nature.increased_stat?.name || 'none';
  const decreased = nature.decreased_stat?.name || 'none';

  // Determine region from nature name
  const region = natureRegionMap[nature.name] || 'Kanto';
  
  // Determine ideal starter based on increased stat
  const preferredStat = increased;
  const starterName = natureStarterMap[preferredStat] || 'Pikachu';
  
  // Get animated sprite for starter if available, otherwise static
  const starterId = starterIdMap[starterName] || '25';
  const starterAnimatedUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${starterId}.gif`;
  const starterStaticUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${starterId}.png`;

  const handleRetake = () => {
    clearQuizResult();
    setPage('personality-quiz');
  };

  const handleContinue = () => {
    setPage('home');
  };

  const handleSaveTeam = () => {
    onSaveTeam(teams[activeTeam]);
  };

  const getPokemonSpriteUrl = (pokemon) => {
    if (pokemon.animatedSprite) return pokemon.animatedSprite;
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
  };

  const accentColor = '#c8b820';

  return (
    <div className="personality-result" style={S.wrap}>
      <style>{`
        @media (max-width: 768px) {
          .personality-result > div { padding: 1.5rem !important; }
          .personality-result .${S.title} { font-size: 20px !important; }
          .personality-result .${S.natureName} { font-size: 24px !important; }
          .personality-result .${S.starterCard} { max-width: 240px !important; }
          .personality-result .${S.starterSprite} { width: 96px !important; height: 96px !important; }
          .personality-result .${S.starterName} { font-size: 18px !important; }
          .personality-result .${S.tab} { font-size: 14px !important; padding: 6px 12px !important; }
          .personality-result .${S.teamGrid} { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important; }
          .personality-result .${S.sprite} { width: 72px !important; height: 72px !important; }
          .personality-result .${S.btnRow} button { font-size: 12px !important; padding: 10px 18px !important; }
        }
        @media (max-width: 480px) {
          .personality-result .${S.titleRow} { flex-direction: column !important; gap: 0.5rem !important; }
          .personality-result .${S.title} { font-size: 18px !important; }
          .personality-result .${S.regionBadge} { font-size: 12px !important; }
          .personality-result .${S.natureName} { font-size: 20px !important; }
          .personality-result .${S.starterCard} { max-width: 100% !important; }
          .personality-result .${S.teamGrid} { grid-template-columns: repeat(2, 1fr) !important; }
          .personality-result .${S.btnRow} { flex-direction: column !important; }
          .personality-result .${S.btnRow} button { width: 100% !important; }
        }
      `}</style>
      <div style={S.container}>
        {/* Title with Region Badge */}
        <div style={S.titleRow}>
          <div style={S.title}>Your Trainer Personality</div>
          <span style={S.regionBadge}>{region} Region</span>
        </div>

        {/* Nature Box */}
        <div style={S.natureBox}>
          <div style={S.natureName}>{nature.name}</div>
          <div style={S.natureDesc}>
            You value <strong>{increased}</strong> over <strong>{decreased}</strong>.
          </div>
        </div>

        {/* Ideal Starter */}
        <div style={S.sectionTitle}>Your Ideal Starter</div>
        <div style={S.starterCard}>
          <img
            src={starterAnimatedUrl}
            alt={starterName}
            style={S.starterSprite}
            onError={(e) => { e.target.src = starterStaticUrl; }}
          />
          <div style={S.starterName}>{starterName}</div>
        </div>

        {/* Team Tabs */}
        <div style={S.tabRow}>
          <button style={S.tab(activeTeam === 'balanced', accentColor)} onClick={() => setActiveTeam('balanced')}>Balanced</button>
          <button style={S.tab(activeTeam === 'offensive', accentColor)} onClick={() => setActiveTeam('offensive')}>Offensive</button>
          <button style={S.tab(activeTeam === 'defensive', accentColor)} onClick={() => setActiveTeam('defensive')}>Defensive</button>
        </div>

        {/* Team Display */}
        <div style={{ ...S.sectionTitle, fontSize: '18px', marginBottom: '1rem' }}>
          {activeTeam === 'balanced' ? 'Balanced Build' : activeTeam === 'offensive' ? 'Offensive Build' : 'Defensive Build'}
        </div>
        <div style={S.teamGrid}>
          {teams[activeTeam].map((pokemon) => (
            <div key={pokemon.id} style={S.pokemonCard}>
              <img style={S.sprite} src={getPokemonSpriteUrl(pokemon)} alt={pokemon.name}
                onError={(e) => { e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`; }}
              />
              <div style={S.pokemonName}>{pokemon.name}</div>
              <div style={S.types}>{pokemon.types.join(' / ')}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={S.btnRow}>
          <button style={S.btn} onClick={handleRetake}>Retake Quiz</button>
          <button style={S.saveBtn} onClick={handleSaveTeam}>
            Save {activeTeam === 'balanced' ? 'Balanced' : activeTeam === 'offensive' ? 'Offensive' : 'Defensive'} Team
          </button>
          <button style={S.btn} onClick={handleContinue}>Continue to PokéPortal</button>
        </div>
      </div>
    </div>
  );
}