// Battle arena — player bottom-left with their HP bar right of sprite while the opponent is top right with HP bar left of sprite.

import React from 'react';
import HPBar from './HPBar.jsx';

export default function BattleViewport({ player, ai }) {
  return (
    <div style={{ display:'flex', flexShrink:0, height:'280px', background:'var(--grey-900)', border:'1px solid var(--border)', overflow:'hidden' }}>

      {/* Left border panel */}
      <div style={{ width:'250px', flexShrink:0, background:'var(--grey-800)', borderRight:'2px solid var(--border-lt)' }} />

      {/* Main battle field */}
      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        {/* Grid texture */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(var(--grey-800) 1px, transparent 1px)', backgroundSize:'32px 32px', opacity:0.35 }} />

        {/* Player — bottom left, HP bar to the RIGHT of sprite */}
        <div style={{ position:'absolute', bottom:'16px', left:'24px', display:'flex', alignItems:'flex-end', gap:'14px' }}>
          <div style={{ opacity: player?.fainted ? 0.2 : 1, transition:'opacity 0.4s' }}>
            {player?.spriteBack
              ? <img src={player.spriteBack} alt={player?.name} style={{ width:'120px', height:'120px', imageRendering:'pixelated', filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.9))', display:'block' }} />
              : <div style={{ width:'120px', height:'120px', background:'var(--grey-800)' }} />
            }
          </div>
          <HPBar battler={player} side="player" />
        </div>

        {/* Opponent — top right, HP bar to the LEFT of sprite (inverted mirror) */}
        <div style={{ position:'absolute', top:'16px', right:'24px', display:'flex', alignItems:'flex-start', gap:'14px', flexDirection:'row' }}>
          <HPBar battler={ai} side="ai" />
          <div style={{ opacity: ai?.fainted ? 0.2 : 1, transition:'opacity 0.4s' }}>
            {ai?.sprite
              ? <img src={ai.sprite} alt={ai?.name} style={{ width:'120px', height:'120px', imageRendering:'pixelated', filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.9))', display:'block' }} />
              : <div style={{ width:'120px', height:'120px', background:'var(--grey-800)' }} />
            }
          </div>
        </div>
      </div>

      {/* Right border panel */}
      <div style={{ width:'250px', flexShrink:0, background:'var(--grey-800)', borderLeft:'2px solid var(--border-lt)' }} />
    </div>
  );
}
