/*
 * BattleConsole.jsx Scrolling battle log panel showing turn-by-turn messages.
 */

import React, { useEffect, useRef } from 'react';

// Scrollable battle log auto-scrolls to bottom on new entries
// Renders the message log and auto-scrolls to the latest entry.
export default function BattleConsole({ log }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  return (
    <div style={{
      background:    'var(--grey-900)',
      border:        '1px solid var(--border)',
      display:       'flex',
      flexDirection: 'column',
      overflow:      'hidden',
      // Fixed height - does not grow infinitely
      height:        '100%',
    }}>
      {/* Header */}
      <div style={{
        borderBottom:  '1px solid var(--border)',
        padding:       '8px 12px',
        fontFamily:    'var(--font-display)',
        fontSize:      '11px',
        letterSpacing: '0.15em',
        color:         'var(--grey-400)',
        textTransform: 'uppercase',
        flexShrink:    0,
      }}>
        Battle Log
      </div>

      {/* Scrollable log fixed, shows last entries */}
      <div style={{
        overflowY:     'auto',
        flex:          1,
        padding:       '8px 12px',
        display:       'flex',
        flexDirection: 'column',
        gap:           '1px',
      }}>
        {log.map((entry, i) => {
          const isTurnHeader = entry.startsWith('--- Turn');
          const isCrit       = entry.includes('critical');
          const isSuper      = entry.includes('super effective');
          const isNotVery    = entry.includes('not very');
          const isNoEff      = entry.includes('no effect');
          const isFaint      = entry.includes('fainted');
          const isWin        = entry.includes('You win') || entry.includes('You lose');
          const isSent       = entry.includes('sent out') || entry.includes('Go,') || entry.includes('You sent out');

          let color = 'var(--grey-400)';
          let weight = 400;
          let marginTop = 0;

          if (isTurnHeader) { color = 'var(--grey-600)'; marginTop = 6; }
          else if (isWin)   { color = 'var(--white)'; weight = 700; }
          else if (isFaint) { color = 'var(--grey-200)'; weight = 600; }
          else if (isCrit)  { color = '#c8c860'; }
          else if (isSuper) { color = '#80b880'; }
          else if (isNotVery){ color = '#b88060'; }
          else if (isNoEff) { color = 'var(--grey-600)'; }
          else if (isSent)  { color = 'var(--grey-300)'; }
          else if (i === log.length - 1) { color = 'var(--grey-200)'; }

          return (
            <div key={i} style={{
              fontFamily:  'var(--font-mono)',
              fontSize:    '12px',
              lineHeight:  1.6,
              color,
              fontWeight:  weight,
              marginTop,
              paddingLeft: isTurnHeader ? 0 : '8px',
              borderLeft:  isFaint || isWin ? '2px solid var(--grey-600)' : 'none',
              animation:   i === log.length - 1 ? 'fadeIn 0.2s ease both' : undefined,
            }}>
              {entry}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
