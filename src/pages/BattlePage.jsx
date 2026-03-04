// Battle screen 
// Loads teams, shows sprites/HP bars/moves/party chosen.

import React, { useEffect, useState } from 'react';
import { GEN1_POKEMON } from '../utils/constants.js';
import { fetchPokeData, fetchMoveData } from '../hooks/usePokemonData.js';
import BattleViewport  from '../components/BattleViewport.jsx';
import TeamStatusBar   from '../components/TeamStatusBar.jsx';
import BattleMoves     from '../components/BattleMoves.jsx';
import BattleConsole   from '../components/BattleConsole.jsx';

// Pick 6 random Gen 1 pokemon for the opponent
function randomAITeam() {
  const pool = [...GEN1_POKEMON];
  const picks = [];
  while (picks.length < 6) picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return picks;
}

// Convert raw pokemon data into the display object used by battle components
function buildBattler(pokemon, data) {
  const s = {};
  // Handle both raw PokeAPI shape {stat:{name}, base_stat} and pre-processed {name, value}
  (data?.stats || []).forEach(st => {
    const statName = st.stat ? st.stat.name : st.name;
    const statVal  = st.base_stat !== undefined ? st.base_stat : (st.value || 0);
    if (statName) s[statName] = statVal;
  });
  return {
    name:       pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1).replace(/-/g,' '),
    // types: handle both raw {type:{name}} and pre-cached strings
    types:      (data?.types || []).map(t => typeof t === 'string' ? t : t.type?.name).filter(Boolean),
    sprite:     data?.spritePixel || data?.sprite || null,
    spriteBack: data?.spriteBack  || null,
    maxHp:      s.hp     || 100,
    hp:         s.hp     || 100,
    moves:      pokemon.moves || [],
    pp:         Object.fromEntries((pokemon.moves || []).map(m => [m, 10])),
    item:       pokemon.item || null,
    status:     'none',
    fainted:    false,
  };
}

// Shown while fetching all pokemon + move data before battle starts
function LoadingScreen({ progress, total }) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;
  return (
    <div style={{ minHeight:'calc(100vh - var(--nav-h))', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'24px', background:'var(--black)' }}>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'28px', letterSpacing:'0.2em', color:'var(--white)', textTransform:'uppercase' }}>Preparing Battle</div>
      <div style={{ width:'300px', height:'4px', background:'var(--grey-800)' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:'var(--white)', transition:'width 0.2s ease' }} />
      </div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--grey-400)' }}>Loading... {pct}%</div>
    </div>
  );
}

// Party strip shown under moves — click to switch active Pokemon
// Row of your 6 pokemon shown under the moves — click one to switch
function PartyStrip({ playerTeam, activeIdx, onSwitch }) {
  return (
    <div style={{ background:'var(--grey-900)', borderTop:'1px solid var(--border)', padding:'8px 12px', display:'flex', gap:'8px', alignItems:'center', flexShrink:0 }}>
      <span style={{ fontFamily:'var(--font-display)', fontSize:'10px', letterSpacing:'0.12em', color:'var(--grey-500)', textTransform:'uppercase', flexShrink:0 }}>Party</span>
      {playerTeam.map((poke, i) => {
        const isActive  = i === activeIdx;
        const pct       = poke.hp / poke.maxHp;
        const hpColor   = pct > 0.5 ? 'var(--hp-green)' : pct > 0.2 ? 'var(--hp-yellow)' : 'var(--hp-red)';
        return (
          <div key={i} onClick={() => !poke.fainted && i !== activeIdx && onSwitch(i)}
            style={{
              display:     'flex', flexDirection:'column', alignItems:'center', gap:'2px',
              padding:     '5px 8px',
              background:  isActive ? 'var(--grey-700)' : 'var(--grey-800)',
              border:      `1px solid ${isActive ? 'var(--border-lt)' : 'var(--border)'}`,
              cursor:      poke.fainted || isActive ? 'default' : 'pointer',
              opacity:     poke.fainted ? 0.3 : 1,
              transition:  'all 0.15s',
              minWidth:    '52px',
            }}
            onMouseEnter={e => { if(!poke.fainted && !isActive) e.currentTarget.style.borderColor='var(--grey-400)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = isActive ? 'var(--border-lt)' : 'var(--border)'; }}>
            {poke.sprite
              ? <img src={poke.sprite} alt={poke.name} style={{ width:'36px', height:'36px', imageRendering:'pixelated' }} />
              : <div style={{ width:'36px', height:'36px', background:'var(--grey-700)' }} />
            }
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'8px', color: isActive ? 'var(--white)' : 'var(--grey-400)', textAlign:'center', textTransform:'capitalize', maxWidth:'52px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {poke.name}
            </div>
            {/* Mini HP bar */}
            <div style={{ width:'100%', height:'3px', background:'var(--grey-600)' }}>
              <div style={{ width:`${Math.max(0,pct*100)}%`, height:'100%', background:hpColor, transition:'width 0.3s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BattlePage({ team, setPage }) {
  const [ready,        setReady]        = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [total,        setTotal]        = useState(1);
  const [playerTeam,   setPlayerTeam]   = useState([]);
  const [aiTeam,       setAiTeam]       = useState([]);
  const [playerActive, setPlayerActive] = useState(0);
  const [aiActive]                      = useState(0);
  const [log,          setLog]          = useState([]);
  const [moveDataMap,  setMoveDataMap]  = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const aiNames   = randomAITeam();
      const aiPokemon = aiNames.map(name => ({ name, moves:[], item:null }));
      const allPokemon = [...team.map(p=>({...p})), ...aiPokemon];

      setTotal(allPokemon.length);

      const allData = {};
      for (const p of allPokemon) {
        if (cancelled) return;
        const data = await fetchPokeData(p.name);
        allData[p.name] = data;
        if (!p.moves || p.moves.length === 0) p.moves = data.moves.slice(0,4);
        setProgress(prev => prev + 1);
      }

      if (cancelled) return;

      const pTeam = team.map(p => buildBattler(
        { ...p, moves: p.moves?.length ? p.moves : allData[p.name]?.moves.slice(0,4) || [] },
        allData[p.name]
      ));
      const aTeam = aiPokemon.map(p => buildBattler(
        { ...p, moves: allData[p.name]?.moves.slice(0,4) || [] },
        allData[p.name]
      ));

      // Fetch move data for all moves
      const allMoveNames = new Set();
      [...pTeam, ...aTeam].forEach(p => p.moves.forEach(m => allMoveNames.add(m)));
      const mMap = {};
      await Promise.all([...allMoveNames].map(async m => {
        const d = await fetchMoveData(m);
        mMap[m] = d;
      }));

      if (cancelled) return;
      setMoveDataMap(mMap);
      setPlayerTeam(pTeam);
      setAiTeam(aTeam);
      setLog([`Go, ${pTeam[0]?.name}!`, `Opponent sent out ${aTeam[0]?.name}!`]);
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Switch active pokemon and log it to the battle console
  const handleSwitch = (newIdx) => {
    const poke = playerTeam[newIdx];
    if (!poke || poke.fainted) return;
    setPlayerActive(newIdx);
    setLog(prev => [...prev, `You sent out ${poke.name}!`]);
  };

  if (!ready) return <LoadingScreen progress={progress} total={total} />;

  const playerPoke = playerTeam[playerActive];
  const aiPoke     = aiTeam[aiActive];

  return (
    <div style={{ minHeight:'calc(100vh - var(--nav-h))', background:'var(--black)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <TeamStatusBar playerTeam={playerTeam} aiTeam={aiTeam} playerActive={playerActive} aiActive={aiActive} />

      <BattleViewport player={playerPoke} ai={aiPoke} />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', height:'200px', flexShrink:0, overflow:'hidden', gap:'1px', background:'var(--border)' }}>
        <BattleMoves
          pokemon={playerPoke}
          moveData={moveDataMap}
          onMove={() => {}}
          onSwitch={() => {}}
          disabled={true}
          playerTeam={playerTeam}
          playerActive={playerActive}
        />
        <BattleConsole log={log} />
      </div>

      <PartyStrip playerTeam={playerTeam} activeIdx={playerActive} onSwitch={handleSwitch} />
    </div>
  );
}
