/*
 * MoveTooltip.jsx Hover tooltip showing a move's type, power, PP,
 * accuracy, category, and description. Renders via a React portal.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { fetchMoveData } from '../hooks/usePokemonData.js';
import { TYPE_BG } from '../utils/constants.js';

const TYPE_ACCENT = {
  fire:'#e06030',water:'#4090d0',grass:'#50a030',electric:'#c0a820',
  psychic:'#d03060',ice:'#30a0b0',dragon:'#6030c0',dark:'#a09060',
  fairy:'#c05070',normal:'#888',fighting:'#b03020',flying:'#6080a0',
  poison:'#8030a0',ground:'#a07820',rock:'#908020',bug:'#60902a',
  ghost:'#503088',steel:'#507088',
};
const CAT_LABEL = { physical:'Physical', special:'Special', status:'Status' };
const CAT_COLOR = { physical:'#e07040', special:'#4090d0', status:'#aaa' };
const CAT_BG    = { physical:'rgba(224,112,64,0.18)', special:'rgba(64,144,208,0.18)', status:'rgba(170,170,170,0.12)' };
const TIP_W = 340;
const TIP_ESTIMATED_H = 220;

function TooltipContent({ moveName, preloaded }) {
  const [data, setData] = useState(preloaded || null);
  useEffect(() => { if (!data) fetchMoveData(moveName).then(setData); }, [moveName]);

  if (!data) return (
    <div style={{ padding:'16px 18px', fontFamily:'var(--font-mono)', fontSize:'13px', color:'var(--grey-500)', width: TIP_W }}>Loading…</div>
  );

  const accent = TYPE_ACCENT[data.type] || '#888';
  const bg     = TYPE_BG[data.type]     || '#111';

  return (
    <div style={{ width: TIP_W }}>
      <div style={{ background: bg, borderBottom: `2px solid ${accent}70`, padding: '12px 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize: 18, letterSpacing:'0.08em', textTransform:'capitalize', color:'var(--white)' }}>
            {data.name || moveName}
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', fontWeight:700, color: CAT_COLOR[data.category] || '#888', background: CAT_BG[data.category] || 'transparent', border:`1px solid ${(CAT_COLOR[data.category] || '#888')}55`, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>
            {CAT_LABEL[data.category] || data.category || ''}
          </span>
        </div>
        <div style={{ display:'flex', gap: 6, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ background: accent, color:'#000', fontFamily:'var(--font-mono)', fontSize: 11, padding:'2px 9px', textTransform:'uppercase', fontWeight: 700 }}>
            {data.type}
          </span>
          {data.power > 0 && (
            <span style={{ border:`1px solid ${accent}80`, color:'var(--grey-100)', fontFamily:'var(--font-mono)', fontSize: 12, padding:'2px 9px', fontWeight: 600 }}>
              PWR {data.power}
            </span>
          )}
          {data.accuracy > 0 && (
            <span style={{ border:'1px solid var(--border)', color:'var(--grey-300)', fontFamily:'var(--font-mono)', fontSize: 12, padding:'2px 9px' }}>
              ACC {data.accuracy}%
            </span>
          )}
          {data.pp > 0 && (
            <span style={{ border:'1px solid var(--border)', color:'var(--grey-400)', fontFamily:'var(--font-mono)', fontSize: 12, padding:'2px 9px' }}>
              PP {data.pp}
            </span>
          )}
        </div>
      </div>
      {(data.effect || data.flavor) && (
        <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap: 8 }}>
          {data.effect && (
            <p style={{ margin:0, fontFamily:'var(--font-mono)', fontSize: 12, color:'var(--grey-200)', lineHeight: 1.7 }}>{data.effect}</p>
          )}
          {data.flavor && (
            <p style={{ margin:0, fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--grey-500)', lineHeight: 1.6, fontStyle:'italic', borderTop: data.effect ? '1px solid var(--border)' : 'none', paddingTop: data.effect ? 8 : 0 }}>{data.flavor}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Wraps a move button and positions the tooltip above or below it.
export default function MoveTooltip({ moveName, preloaded, children }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos]         = useState({ top: 0, left: 0 });
  const timerRef = useRef(null);

  const showAt = useCallback((el) => {
    clearTimeout(timerRef.current);
    const rect   = el.getBoundingClientRect();
    const GAP    = 8;
    const margin = 6;

    const spaceAbove = rect.top - GAP;
    const spaceBelow = window.innerHeight - rect.bottom - GAP;
    let top;
    if (spaceAbove >= TIP_ESTIMATED_H || spaceAbove >= spaceBelow) {
      top = rect.top - TIP_ESTIMATED_H - GAP;
      if (top < margin) top = margin;
    } else {
      top = rect.bottom + GAP;
      if (top + TIP_ESTIMATED_H > window.innerHeight - margin) {
        top = window.innerHeight - TIP_ESTIMATED_H - margin;
      }
    }

    let left = rect.left + rect.width / 2 - TIP_W / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - TIP_W - margin));

    setPos({ top, left });
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(false), 100);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!moveName) return children;

  return (
    <div
      style={{ display:'contents' }}
      onMouseEnter={e => showAt(e.currentTarget.children[0] || e.currentTarget)}
      onMouseLeave={hide}>
      {children}
      {visible && createPortal(
        <div
          onMouseEnter={() => clearTimeout(timerRef.current)}
          onMouseLeave={hide}
          style={{
            position:'fixed', top: pos.top, left: pos.left,
            zIndex: 9999,
            background:'var(--grey-900)',
            border:`1px solid ${preloaded?.type ? (TYPE_ACCENT[preloaded.type] || 'var(--border-lt)') : 'var(--border-lt)'}`,
            boxShadow:'0 12px 40px rgba(0,0,0,0.85)',
            pointerEvents:'auto',
          }}>
          <TooltipContent moveName={moveName} preloaded={preloaded} />
        </div>,
        document.body
      )}
    </div>
  );
}
