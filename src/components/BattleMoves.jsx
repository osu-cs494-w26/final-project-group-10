// 2x2 move buttons for the active Pokemon, plus a switch Pokemon panel.

import React, { useState } from 'react';

// Type-tinted backgrounds for move buttons
const TYPE_BG = {
  fire:'#7a2a10',water:'#1a3a6a',grass:'#1a3a12',electric:'#4a3a00',
  psychic:'#4a1028',ice:'#0a3a48',dragon:'#280e58',dark:'#1a1008',
  fairy:'#4a1830',normal:'#303030',fighting:'#3a0e08',flying:'#283048',
  poison:'#300a48',ground:'#3a2a08',rock:'#302808',bug:'#1e3008',
  ghost:'#180a30',steel:'#283038',
};
// Bright accent borders for each type
const TYPE_ACCENT = {
  fire:'#e06030',water:'#4090d0',grass:'#50a030',electric:'#c0a820',
  psychic:'#d03060',ice:'#30a0b0',dragon:'#6030c0',dark:'#706040',
  fairy:'#c05070',normal:'#888',fighting:'#b03020',flying:'#6080a0',
  poison:'#8030a0',ground:'#a07820',rock:'#908020',bug:'#60902a',
  ghost:'#503088',steel:'#507088',
};

// 2x2 grid of the active pokemon's moves + a switch panel
export default function BattleMoves({ pokemon, moveData, onMove, onSwitch, disabled, playerTeam, playerActive }) {
  const [showSwitch, setShowSwitch] = useState(false);
  if (!pokemon) return null;

  const moves = pokemon.moves || [];
  const switchCandidates = (playerTeam||[]).map((p,i)=>({...p,idx:i})).filter(p=>!p.fainted && p.idx!==playerActive);

  // Show the switch panel instead of moves when player clicks Switch
  if (showSwitch) {
    return (
      <div style={{ background:'var(--grey-800)', border:'1px solid var(--border)', padding:'12px', display:'flex', flexDirection:'column', gap:'6px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border)', paddingBottom:'6px', marginBottom:'2px' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.12em', color:'var(--grey-300)', textTransform:'uppercase' }}>Switch Pokemon</span>
          <button onClick={()=>setShowSwitch(false)} style={{ background:'none', border:'none', color:'var(--grey-500)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'12px' }}>Back</button>
        </div>
        {switchCandidates.map(poke => {
          const pct = poke.hp/poke.maxHp;
          const hpColor = pct>0.5?'var(--hp-green)':pct>0.2?'var(--hp-yellow)':'var(--hp-red)';
          return (
            <button key={poke.idx} disabled={disabled} onClick={()=>{setShowSwitch(false);onSwitch(poke.idx,true);}}
              style={{ background:'var(--grey-700)', border:'1px solid var(--border-mid)', padding:'9px 12px', cursor:disabled?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:'10px', color:'var(--white)', fontFamily:'inherit', transition:'border-color 0.1s', opacity:disabled?0.5:1 }}
              onMouseEnter={e=>{if(!disabled)e.currentTarget.style.borderColor='var(--border-lt)'}}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-mid)'}>
              {poke.sprite&&<img src={poke.sprite} alt={poke.name} style={{width:'36px',height:'36px',imageRendering:'pixelated'}}/>}
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'13px',letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:'3px'}}>{poke.name}</div>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                  <div style={{flex:1,height:'4px',background:'var(--grey-600)'}}><div style={{width:`${pct*100}%`,height:'100%',background:hpColor}}/></div>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:'10px',color:'var(--grey-400)'}}>{poke.hp}/{poke.maxHp}</span>
                </div>
              </div>
            </button>
          );
        })}
        {switchCandidates.length===0&&<div style={{fontFamily:'var(--font-mono)',fontSize:'12px',color:'var(--grey-600)',textAlign:'center',padding:'12px'}}>No other Pokemon available</div>}
      </div>
    );
  }

  return (
    <div style={{ background:'var(--grey-800)', border:'1px solid var(--border)', padding:'12px', display:'flex', flexDirection:'column', gap:'6px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border)', paddingBottom:'6px', marginBottom:'2px' }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.12em', color:'var(--grey-400)', textTransform:'uppercase' }}>
          Moves — {pokemon.name}
        </span>
        <button disabled={disabled||switchCandidates.length===0} onClick={()=>setShowSwitch(true)}
          style={{ background:'transparent', border:'1px solid var(--border-mid)', color:disabled||switchCandidates.length===0?'var(--grey-700)':'var(--grey-300)', padding:'3px 12px', cursor:disabled||switchCandidates.length===0?'not-allowed':'pointer', fontFamily:'var(--font-display)', fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase' }}>
          Switch
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px' }}>
        {[0,1,2,3].map(i => {
          const moveName = moves[i];
          if (!moveName) return (
            <div key={i} style={{ background:'var(--grey-900)', border:'1px solid var(--border)', padding:'12px 14px', color:'var(--grey-700)', fontSize:'12px', fontFamily:'var(--font-mono)' }}>---</div>
          );

          const md      = moveData?.[moveName];
          const pp      = pokemon.pp?.[moveName] ?? 10;
          const maxPP   = md?.pp || 10;
          const noPP    = pp <= 0;
          const type    = md?.type || 'normal';
          const bg      = TYPE_BG[type]     || '#2a2a2a';
          const accent  = TYPE_ACCENT[type] || '#666';

          return (
            <button key={i} disabled={disabled||noPP} onClick={()=>onMove(moveName)}
              style={{ background:noPP?'var(--grey-900)':bg, border:'1px solid rgba(255,255,255,0.07)', borderLeft:`4px solid ${noPP?'var(--grey-700)':accent}`, padding:'9px 11px', cursor:disabled||noPP?'not-allowed':'pointer', textAlign:'left', opacity:disabled?0.5:noPP?0.3:1, transition:'filter 0.1s', display:'flex', flexDirection:'column', gap:'4px' }}
              onMouseEnter={e=>{if(!disabled&&!noPP)e.currentTarget.style.filter='brightness(1.2)'}}
              onMouseLeave={e=>{e.currentTarget.style.filter='none'}}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <span style={{ fontFamily:'var(--font-ui)', fontWeight:600, fontSize:'13px', textTransform:'capitalize', color:'var(--white)', lineHeight:1.2 }}>
                  {moveName.replace(/-/g,' ')}
                </span>
              </div>
              <div style={{ display:'flex', gap:'5px', fontSize:'10px', fontFamily:'var(--font-mono)', color:'rgba(255,255,255,0.5)', alignItems:'center' }}>
                <span style={{ background:'rgba(0,0,0,0.35)', padding:'1px 5px', textTransform:'uppercase', fontSize:'9px', color:accent }}>{type}</span>
                {md?.power>0&&<span>{md.power} PWR</span>}
                {md?.category&&<span style={{opacity:0.7}}>{md.category.slice(0,4).toUpperCase()}</span>}
                <span style={{ marginLeft:'auto', color:pp<=2?'#c05050':'rgba(255,255,255,0.45)' }}>{pp}/{maxPP} PP</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
