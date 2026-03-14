/*
 * PokedexBackground.jsx Animated background that scrolls all Gen 1–5
 * Pokémon sprites downward in a grid. Uses CSS keyframes for a seamless loop.
 * Sprites load lazily directly from the PokeAPI CDN no fetch calls needed.
 */

import React, { useMemo } from 'react';

const SPRITE = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

// Builds the flat array of Pokédex IDs 1–649 (Gen 1–5).
function buildDexIds() {
  const ids = [];
  for (let i = 1;   i <= 151; i++) ids.push(i);
  for (let i = 152; i <= 251; i++) ids.push(i);
  for (let i = 252; i <= 386; i++) ids.push(i);
  for (let i = 387; i <= 493; i++) ids.push(i);
  for (let i = 494; i <= 649; i++) ids.push(i);
  return ids;
}

const BOX  = 72;   // px per cell
const COLS = 22;   // wider covers screens up to ~1584px, clipped by overflow:hidden

// Fixed background layer: renders the sprite grid twice for a seamless scroll loop.
export default function PokedexBackground() {
  const ids = useMemo(() => buildDexIds(), []);

  // Pad so total count is divisible by COLS (avoids a short last row)
  const padded = useMemo(() => {
    const rem = ids.length % COLS;
    const extra = rem === 0 ? 0 : COLS - rem;
    // cycle back through the start to fill the padding
    return [...ids, ...ids.slice(0, extra)];
  }, [ids]);

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < padded.length; i += COLS) {
      result.push(padded.slice(i, i + COLS));
    }
    return result;
  }, [padded]);

  const rowCount   = rows.length;
  const passHeight = rowCount * BOX; // no gap pixel-perfect

  // Render the grid as a flat CSS grid (no gap, no flex gap) to avoid subpixel glitches
  const GridRows = ({ keyPrefix }) =>
    rows.map((row, ri) => (
      row.map((id, ci) => (
        <div key={`${keyPrefix}-${ri}-${ci}`} style={{
          width:      `${BOX}px`,
          height:     `${BOX}px`,
          background: '#000',
          outline:    '1px solid #1a1a1a',
          outlineOffset: '-1px',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          flexGrow:   1,
          boxSizing:  'border-box',
        }}>
          <img
            src={SPRITE(id)}
            alt=""
            loading="lazy"
            decoding="async"
            width={56}
            height={56}
            style={{ imageRendering: 'pixelated', display: 'block' }}
          />
        </div>
      ))
    ));

  return (
    <>
      <style>{`
        @keyframes scrollPokemon {
          0%   { transform: translateY(0px); }
          100% { transform: translateY(-${passHeight}px); }
        }
      `}</style>

      <div style={{
        position:       'fixed',
        inset:          0,
        zIndex:         0,
        overflow:       'hidden',
        pointerEvents:  'none',
        background:     '#000',
      }}>
        {/* Scrolling strip two identical passes for seamless loop */}
        <div style={{
          display:    'flex',
          flexWrap:   'wrap',
          width:      '100vw',
          animation:  `scrollPokemon ${rowCount * 2.5}s linear infinite`,
          willChange: 'transform',
        }}>
          <GridRows keyPrefix="a" />
          <GridRows keyPrefix="b" />
        </div>

        {/* Overlay darkens grid so page content is readable */}
        <div style={{
          position:   'absolute',
          inset:      0,
          background: 'rgba(0,0,0,0.80)',
        }} />
      </div>
    </>
  );
}
