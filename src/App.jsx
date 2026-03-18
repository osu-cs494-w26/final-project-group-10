/*
 * App.jsx Root component. Manages auth state, team state, and renders
 * all routes via React Router. The parameterized /battle/trainer/:trainerId
 * route drives the trainer detail + team-select flow.
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './styles/global.css';

import { useAuth }           from './hooks/useAuth.js';
import AuthPage              from './pages/AuthPage.jsx';
import NavBar                from './components/NavBar.jsx';
import HomePage              from './pages/HomePage.jsx';
import BattleModePage        from './pages/BattleModePage.jsx';
import SelectPage            from './pages/SelectPage.jsx';
import SaveTeamPage          from './pages/SaveTeamPage.jsx';
import BattleTrainerPage     from './pages/BattleTrainerPage.jsx';
import TrainerDetailPage     from './pages/TrainerDetailPage.jsx';
import BattlePage            from './pages/BattlePage.jsx';
import PokedexBackground     from './components/PokedexBackground.jsx';

// Inner shell rendered after the auth check. Has access to useNavigate and useLocation.
function AppShell({ user, signOut }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [team,          setTeam]          = useState([]);
  const [battleMode,    setBattleMode]    = useState('custom');
  // Holds the active trainer battle teams and label once a fight is confirmed.
  const [trainerBattle, setTrainerBattle] = useState(null);
  const [quizResult,   setQuizResult]   = useState(null); 
  const [pokemonQuizResult, setPokemonQuizResult] = useState(null);
  const [evolutionQuizResult, setEvolutionQuizResult] = useState(null);
  const [wtpSession, setWtpSession] = useState({ modeKey: null, config: null });
  const [wtpPokedexTarget, setWtpPokedexTarget] = useState(null);
  const skipNextScrollResetRef = React.useRef(false);

  useEffect(() => {
    if (wtpPokedexTarget) {
      console.info('Pending Pokédex handoff from WTP:', wtpPokedexTarget);
    }
  }, [wtpPokedexTarget]);

  useLayoutEffect(() => {
    if (skipNextScrollResetRef.current) {
      skipNextScrollResetRef.current = false;
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [page]);

  const setPagePreserveScroll = (nextPage) => {
    skipNextScrollResetRef.current = true;
    setPage(nextPage);
  };



  const [selectedPokemon, setSelectedPokemon] = useState(null);

  // Derives the current path for background and nav highlight logic.
  const path = location.pathname;
  // Shows the scrolling Pokédex background on home, mode select, and the trainer gallery.
  // Excluded on active battle routes where it would cover the arena.
  const showBackground = path === '/' || path === '/battle'
    || path === '/battle/trainer'
    || (path.startsWith('/battle/trainer/') && path !== '/battle/trainer-fight');

  // Accepts either a legacy string key like home or a direct URL path like /team/build.
  const setPage = (key) => {
    if (key.startsWith('/')) { navigate(key); return; }
    const MAP = {
      home:          '/',
      battlemode:    '/battle',
      select:        '/battle/select',
      saveteam:      '/team/build',
      battletrainer: '/battle/trainer',
      trainerbattle: '/battle/trainer-fight',
      battle:        '/battle/fight',
    };
    navigate(MAP[key] || '/');
  };

  return (
    <div style={{ animation:'fadeIn 0.3s ease', position:'relative', zIndex:1 }}>
      {showBackground && <PokedexBackground />}

      <NavBar
        page={path}
        setPage={setPage}
        user={user}
        onSignOut={signOut}
        onQuickBattle={() => { setBattleMode('random'); navigate('/battle/fight'); }}
      />

      <Routes>
        {/* Standard pages */}
        <Route path="/"               element={<HomePage       setPage={setPage} />} />
        <Route path="/battle"         element={<BattleModePage setPage={setPage} setBattleMode={setBattleMode} />} />
        <Route path="/battle/select"  element={<SelectPage     setPage={setPage} team={team} setTeam={setTeam} />} />
        <Route path="/team/build"     element={<SaveTeamPage   setPage={setPage} user={user} />} />

        {/* Trainer gallery */}
        <Route path="/battle/trainer" element={
          <BattleTrainerPage setPage={setPage} user={user} />
        } />

        {/* Parameterized trainer detail page */}
        <Route path="/battle/trainer/:trainerId" element={
          <TrainerDetailPage
            user={user}
            onBattleStart={(playerTeam, opponentTeam, trainerLabel) => {
              setTrainerBattle({ playerTeam, opponentTeam, trainerLabel });
              navigate('/battle/trainer-fight');
            }}
            onBack={() => navigate('/battle/trainer')}
            onBuildTeam={() => navigate('/team/build')}
          />
        } />

        {/* Active battle pages */}
        <Route path="/battle/trainer-fight" element={
          trainerBattle ? (
            <BattlePage
              team={trainerBattle.playerTeam}
              opponentTeam={trainerBattle.opponentTeam}
              trainerLabel={trainerBattle.trainerLabel}
              setPage={(p) => {
                if (p === 'battlemode') { setTrainerBattle(null); navigate('/battle/trainer'); }
                else setPage(p);
              }}
            />
          ) : <Navigate to="/battle/trainer" replace />
        } />
        <Route path="/battle/fight" element={
          <BattlePage team={battleMode === 'random' ? [] : team} setPage={setPage} />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

/* Root: handles auth gate before rendering the shell */
export default function App() {
  const { user, loading, signIn, signUp, signOut, resetPassword, updatePassword, resetMode } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--black)', fontFamily:'var(--font-mono)', color:'var(--grey-400)', letterSpacing:'0.2em', fontSize:'13px', textTransform:'uppercase' }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <AuthPage signIn={signIn} signUp={signUp} resetPassword={resetPassword} updatePassword={updatePassword} resetMode={resetMode} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AppShell user={user} signOut={signOut} />
    </BrowserRouter>
  );
}
