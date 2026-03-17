/*
 * App.jsx Root component. Manages auth state, current page,
 * battle team state, and renders the NavBar + active page.
 */

import React, { useState } from 'react';
import './styles/global.css';

import { useAuth }          from './hooks/useAuth.js';
import AuthPage             from './pages/AuthPage.jsx';
import NavBar               from './components/NavBar.jsx';
import HomePage             from './pages/HomePage.jsx';
import BattleModePage       from './pages/BattleModePage.jsx';
import SelectPage           from './pages/SelectPage.jsx';
import SaveTeamPage         from './pages/SaveTeamPage.jsx';
import BattleTrainerPage from './pages/BattleTrainerPage.jsx';
import BattlePage           from './pages/BattlePage.jsx';
import PokedexPage          from './pages/PokedexPage.jsx';
import PokedexBackground    from './components/PokedexBackground.jsx';

// Initialises auth, page routing, and battle state.
export default function App() {
  const { user, loading, signIn, signUp, signOut, resetPassword, updatePassword, resetMode } = useAuth();

  const [page,         setPage]         = useState('home');
  const [team,         setTeam]         = useState([]);
  const [battleMode,   setBattleMode]   = useState('custom');
  // For legend battles: { playerTeam, opponentTeam, trainerLabel }
  const [trainerBattle, setTrainerBattle] = useState(null);

  const [selectedPokemon, setSelectedPokemon] = useState(null);

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--black)', fontFamily:'var(--font-mono)', color:'var(--grey-400)', letterSpacing:'0.2em', fontSize:'13px', textTransform:'uppercase' }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return <AuthPage signIn={signIn} signUp={signUp} resetPassword={resetPassword} updatePassword={updatePassword} resetMode={resetMode} />;
  }

  // Returns the correct page component for the current route.
const renderPage = () => {
    if (page === 'pokedex' || page.startsWith('pokedex/')) {
      const pokemonName = page.startsWith('pokedex/') ? page.split('/')[1] : selectedPokemon;
      return (
        <PokedexPage
          selectedPokemon={pokemonName}
          setSelectedPokemon={setSelectedPokemon}
          setPage={setPage}
        />
      );
    }

    switch (page) {
      case 'home':
        return <HomePage setPage={setPage} />;
      case 'battlemode':
        return <BattleModePage setPage={setPage} setBattleMode={setBattleMode} />;
      case 'select':
        return <SelectPage setPage={setPage} team={team} setTeam={setTeam} />;
      case 'saveteam':
        return <SaveTeamPage setPage={setPage} user={user} />;
      case 'battletrainer':
        return (
          <BattleTrainerPage
            setPage={setPage}
            user={user}
            setBattleTeams={setTrainerBattle}
          />
        );
      case 'trainerbattle':
        return trainerBattle ? (
          <BattlePage
            team={trainerBattle.playerTeam}
            opponentTeam={trainerBattle.opponentTeam}
            trainerLabel={trainerBattle.trainerLabel}
            setPage={(p) => { if (p === 'battlemode') setTrainerBattle(null); setPage(p === 'battlemode' ? 'battletrainer' : p); }}
          />
        ) : <BattleTrainerPage setPage={setPage} user={user} setBattleTeams={setTrainerBattle} />;
      case 'battle':
        return <BattlePage team={battleMode === 'random' ? [] : team} setPage={setPage} />;
      case 'pokedex':
        return <PokedexPage selectedPokemon={selectedPokemon} setSelectedPokemon={setSelectedPokemon} setPage={setPage} />;
      default:
        return <HomePage setPage={setPage} />;
    }
  }; 

  // Only show the scrolling Pokédex grid on home and battle pages.
const showBackground = page === 'home' || page === 'battlemode' || page === 'battletrainer';

  return (
    <div key={page.startsWith('pokedex') ? 'pokedex' : page} style={{ animation: 'fadeIn 0.3s ease', position: 'relative', zIndex: 1 }}>
      {showBackground && <PokedexBackground />}
      <NavBar page={page} setPage={setPage} user={user} onSignOut={signOut} onQuickBattle={() => { setBattleMode('random'); setPage('battle'); }} />
      {renderPage()}
    </div>
  );
}
