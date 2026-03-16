/*
 * App.jsx Root component. Manages auth state, current page,
 * battle team state, and renders the NavBar + active page.
 */

import React, { useState, useEffect, useLayoutEffect } from 'react';
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
import PokedexBackground    from './components/PokedexBackground.jsx';
// Import new quiz pages
import PersonalityQuizPage from './pages/PersonalityQuizPage.jsx';
import PersonalityResultPage from './pages/PersonalityResultPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import PokemonQuizPage from './pages/PokemonQuizPage.jsx';
import EvolutionQuizPage from './pages/EvolutionQuizPage.jsx';
import PokemonQuizResultPage from './pages/PokemonQuizResultPage.jsx';
import EvolutionQuizResultPage from './pages/EvolutionQuizResultPage.jsx';
// import new WTP pages
import WhosThatPokemonPage from './pages/WhosThatPokemonPage.jsx';
import WhosThatPokemonGamePage from './pages/WhosThatPokemonGamePage.jsx';

// Initialises auth, page routing, and battle state.
export default function App() {
  const { user, loading, signIn, signUp, signOut, resetPassword, updatePassword, resetMode } = useAuth();

  const [page,         setPage]         = useState('home');
  const [team,         setTeam]         = useState([]);
  const [battleMode,   setBattleMode]   = useState('custom');
  const [trainerBattle, setTrainerBattle] = useState(null);
  const [quizResult,   setQuizResult]   = useState(null); 
  const [pokemonQuizResult, setPokemonQuizResult] = useState(null);
  const [evolutionQuizResult, setEvolutionQuizResult] = useState(null);
  const [wtpSession, setWtpSession] = useState({ modeKey: null, setup: null });
  const [wtpPokedexTarget, setWtpPokedexTarget] = useState(null);

  useEffect(() => {
    if (wtpPokedexTarget) {
      console.info('Pending Pokédex handoff from WTP:', wtpPokedexTarget);
    }
  }, [wtpPokedexTarget]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [page]);



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
    switch (page) {
      case 'home':
        return <HomePage setPage={setPage} />;
      case 'battlemode':
        return <BattleModePage setPage={setPage} setBattleMode={setBattleMode} />;
      case 'select':
        return <SelectPage setPage={setPage} team={team} setTeam={setTeam} />;
      case 'saveteam':
        return <SaveTeamPage setPage={setPage} user={user} initialTeam={team}  />;
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
      case 'personality-quiz':
        return <PersonalityQuizPage setPage={setPage} setQuizResult={setQuizResult} />;
      case 'personality-result':
          return (
            <PersonalityResultPage
              result={quizResult}
              setPage={setPage}
              clearQuizResult={() => setQuizResult(null)}
              onSaveTeam={(teamToSave) => {
                setTeam(teamToSave);      // Set the team in App state
                setPage('saveteam');       // Navigate to SaveTeamPage
              }}
            />
          );
    case 'quiz':
      return <QuizPage setPage={setPage} />;
    case 'wtp':
      return (
        <WhosThatPokemonPage
          setPage={setPage}
          onSelectMode={(modeKey) => {
            setWtpSession({ modeKey, setup: null });
            setPage('wtp-game');
          }}
        />
      );
    case 'wtp-game':
      return (
        <WhosThatPokemonGamePage
          modeKey={wtpSession.modeKey}
          initialSetup={wtpSession.setup}
          onBackToModes={() => setPage('wtp')}
          onUpdateSession={(modeKey, setup) => setWtpSession({ modeKey, setup })}
          onViewPokedex={(pokemonName) => {
            // TODO: replace this state handoff with the project Pokédex detail page once it is available.
            setWtpPokedexTarget(pokemonName);
          }}
        />
      );
    case 'pokemon-quiz':
      return <PokemonQuizPage setPage={setPage} setPokemonQuizResult={setPokemonQuizResult} />;
    case 'evolution-quiz':
      return <EvolutionQuizPage setPage={setPage} setEvolutionQuizResult={setEvolutionQuizResult} />;
    case 'pokemon-quiz-result':
      return <PokemonQuizResultPage result={pokemonQuizResult} setPage={setPage} clearResult={() => setPokemonQuizResult(null)} />;
    case 'evolution-quiz-result':
      return <EvolutionQuizResultPage result={evolutionQuizResult} setPage={setPage} clearResult={() => setEvolutionQuizResult(null)} />;
      default:
        return <HomePage setPage={setPage} />;
    }
  };

  // Only show the scrolling Pokédex grid on home and battle pages.
  const showBackground = page === 'home' || page === 'battlemode' || page === 'battletrainer';
  const pageAnimation = page === 'wtp' || page === 'wtp-game' ? 'fadeInFast 0.2s ease' : 'fadeIn 0.3s ease';

  return (
    <div key={page} style={{ animation: pageAnimation, position: 'relative', zIndex: 1 }}>
      {showBackground && <PokedexBackground />}
      <NavBar page={page} setPage={setPage} user={user} onSignOut={signOut} onQuickBattle={() => { setBattleMode('random'); setPage('battle'); }} />
      {renderPage()}
    </div>
  );
}
