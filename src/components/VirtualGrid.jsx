/*
 * VirtualGrid.jsx Virtualised 2 column Pokémon card grid.
 * Only renders rows visible in the scroll window plus an overscan buffer
 * above and below. Cuts mounted PokemonCard count from roughly 300 to 16.
 * Uses a ResizeObserver to track container height so the visible window
 * stays accurate after layout changes.
 */

import { memo, useRef, useState, useEffect } from 'react';
import PokemonCard from './PokemonCard.jsx';

const CARD_H    = 210;
const COL_COUNT = 2;
const OVERSCAN  = 4;

// Renders only the card rows currently visible in the scroll container.
const VirtualGrid = memo(function VirtualGrid({ items, pokeData, teamFull, draggedName, selectedCard, onDragStart, onDragEnd, onClick, onAdd }) {
  const containerRef = useRef(null);
  const [scrollTop,  setScrollTop]  = useState(0);
  const [viewHeight, setViewHeight] = useState(600);

  // Tracks scroll position and container height via a passive listener and ResizeObserver.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setViewHeight(el.clientHeight);
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(() => setViewHeight(el.clientHeight));
    ro.observe(el);
    return () => { el.removeEventListener('scroll', onScroll); ro.disconnect(); };
  }, []);

  if (!items.length) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-500)' }}>No Pokémon match</div>
    </div>
  );

  const rowCount     = Math.ceil(items.length / COL_COUNT);
  const totalH       = rowCount * CARD_H;
  const firstRow     = Math.max(0, Math.floor(scrollTop / CARD_H) - OVERSCAN);
  const lastRow      = Math.min(rowCount - 1, Math.ceil((scrollTop + viewHeight) / CARD_H) + OVERSCAN);
  const visibleItems = [];
  for (let r = firstRow; r <= lastRow; r++) {
    for (let c = 0; c < COL_COUNT; c++) {
      const idx = r * COL_COUNT + c;
      if (idx < items.length) visibleItems.push({ name: items[idx], row: r, col: c });
    }
  }

  return (
    <div ref={containerRef} className={teamFull ? 'team-full' : ''} style={{ flex:1, overflowY:'auto', padding:'8px', position:'relative' }}>
      {/* Spacer sets the scrollbar to the correct total height. */}
      <div style={{ height: totalH, position:'relative' }}>
        {visibleItems.map(({ name, row, col }) => (
          <div key={name} style={{
            position: 'absolute',
            top:   row * CARD_H,
            left:  col === 0 ? 0 : 'calc(50% + 3px)',
            width: 'calc(50% - 3px)',
          }}>
            <PokemonCard
              name={name}
              cardData={pokeData[name]}
              isDragging={draggedName === name}
              isSelected={selectedCard === name}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={onClick}
              onAdd={onAdd}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

export default VirtualGrid;
