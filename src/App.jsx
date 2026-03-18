/*
 * App.jsx Root component. Manages auth state, team state, and renders
 * all routes via React Router. The parameterized /battle/trainer/:trainerId
 * route drives the trainer detail + team select flow.
 */

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './styles/global.css';

import { useAuth }               from './hooks/useAuth.js';
import AuthPage                  from './pages/AuthPage.jsx';
import NavBar                    from './components/NavBar.jsx';
import HomePage                  from './pages/HomePage.jsx';
import BattleModePage             from './pages/BattleModePage.jsx';
import SelectPage                from './pages/SelectPage.jsx';
import SaveTeamPage              from './pages/SaveTeamPage.jsx';
import BattleTrainerPage         from './pages/BattleTrainerPage.jsx';
import TrainerDetailPage         from './pages/TrainerDetailPage.jsx';
import BattlePage                from './pages/BattlePage.jsx';
import PokedexPage               from './pages/PokedexPage.jsx';
import QuizPage                  from './pages/QuizPage.jsx';
import PersonalityQuizPage       from './pages/PersonalityQuizPage.jsx';
import PersonalityResultPage     from './pages/PersonalityResultPage.jsx';
import PokemonQuizPage           from './pages/PokemonQuizPage.jsx';
import PokemonQuizResultPage     from './pages/PokemonQuizResultPage.jsx';
import EvolutionQuizPage         from './pages/EvolutionQuizPage.jsx';
import EvolutionQuizResultPage   from './pages/EvolutionQuizResultPage.jsx';
import WhosThatPokemonPage       from './components/wtp/WhosThatPokemonPage.jsx';
import WhosThatPokemonGamePage   from './components/wtp/WhosThatPokemonGamePage.jsx';
import WhosThatPokemonStatsPage  from './components/wtp/WhosThatPokemonStatsPage.jsx';
import PokedexBackground         from './components/PokedexBackground.jsx';

// Inner shell rendered after the auth check. Has access to useNavigate and useLocation.
function AppShell({ user, signOut }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [team,                setTeam]                = useState([]);
  const [battleMode,          setBattleMode]          = useState('custom');
  
  // Holds the active trainer battle teams and label once a fight is confirmed.
  const [trainerBattle,       setTrainerBattle]       = useState(null);
  const [quizResult,          setQuizResult]          = useState(null);
  const [pokemonQuizResult,   setPokemonQuizResult]   = useState(null);
  const [evolutionQuizResult, setEvolutionQuizResult] = useState(null);
  const [wtpSession,          setWtpSession]          = useState({ modeKey: null, config: null });
  const [wtpPokedexTarget,    setWtpPokedexTarget]    = useState(null);
  const [selectedPokemon,     setSelectedPokemon]     = useState(null);

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
  }, [location.pathname]);

  
  // Derives the current path for background and nav highlight logic.
  const path = location.pathname;

  
  // Shows the scrolling Pokédex background on home, mode select, trainer gallery,
  // Pokédex, WTP, and quiz sections. Excluded on active battle routes and pages with their own full screen layouts.
  const showBackground = path === '/' || path === '/battle'
    || path === '/battle/trainer'
    || (path.startsWith('/battle/trainer/') && path !== '/battle/trainer-fight')
    || path.startsWith('/pokedex')
    || path.startsWith('/wtp')
    || path.startsWith('/quiz');

  
  // Accepts either a legacy string key or a direct URL path like /team/build.
  const setPage = (key) => {
    if (key.startsWith('/')) { navigate(key); return; }
    const MAP = {
      home:               '/',
      battlemode:         '/battle',
      select:             '/battle/select',
      saveteam:           '/team/build',
      battletrainer:      '/battle/trainer',
      trainerbattle:      '/battle/trainer-fight',
      battle:             '/battle/fight',
      pokedex:            '/pokedex',
      wtp:                '/wtp',
      quiz:                '/quiz',
      
      'personality-quiz':  '/quiz/personality',
      'pokemon-quiz':      '/quiz/pokemon',
      'evolution-quiz':    '/quiz/evolution',
      
      personality:         '/quiz/personality',
      'personality-result':'/quiz/personality/result',
      pokemonquiz:         '/quiz/pokemon',
      'pokemon-result':        '/quiz/pokemon/result',
      'pokemon-quiz-result':    '/quiz/pokemon/result',
      evolutionquiz:       '/quiz/evolution',
      'evolution-result':       '/quiz/evolution/result',
      'evolution-quiz-result':  '/quiz/evolution/result',
    };
    navigate(MAP[key] || '/');
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', position: 'relative', zIndex: 1 }}>
      {showBackground && <PokedexBackground />}

      <NavBar
        page={path}
        setPage={setPage}
        user={user}
        onSignOut={signOut}
        onQuickBattle={() => { setBattleMode('random'); navigate('/battle/fight'); }}
      />

      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage setPage={setPage} />} />

        {/* Pokédex */}
        <Route path="/pokedex" element={
          <PokedexPage
            selectedPokemon={selectedPokemon}
            setSelectedPokemon={setSelectedPokemon}
            setPage={setPage}
            wtpPokedexTarget={wtpPokedexTarget}
            setWtpPokedexTarget={setWtpPokedexTarget}
          />
        } />

        {/* Battle routes */}
        <Route path="/battle"         element={<BattleModePage setPage={setPage} setBattleMode={setBattleMode} />} />
        <Route path="/battle/select"  element={<SelectPage     setPage={setPage} team={team} setTeam={setTeam} />} />
        <Route path="/team/build"     element={<SaveTeamPage   setPage={setPage} user={user} initialTeam={team} />} />

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

        {/* Who's That Pokémon */}
        <Route path="/wtp" element={
          <WhosThatPokemonPage
            setPage={setPage}
            onSelectMode={(modeKey, config) => {
              setWtpSession({ modeKey, config });
              navigate('/wtp/play');
            }}
            onViewStats={() => navigate('/wtp/stats')}
          />
        } />
        <Route path="/wtp/play" element={
          <WhosThatPokemonGamePage
            modeKey={wtpSession.modeKey}
            initialConfig={wtpSession.config}
            onBackToModes={() => navigate('/wtp')}
            onUpdateSession={(key, cfg) => setWtpSession({ modeKey: key, config: cfg })}
            onViewPokedex={(name) => { setWtpPokedexTarget(name); navigate('/pokedex'); }}
            onViewStats={() => navigate('/wtp/stats')}
          />
        } />
        <Route path="/wtp/stats" element={
          <WhosThatPokemonStatsPage onBack={() => navigate('/wtp')} />
        } />

        {/* Quiz hub */}
        <Route path="/quiz" element={<QuizPage setPage={setPage} />} />

        {/* Personality quiz */}
        <Route path="/quiz/personality" element={
          <PersonalityQuizPage
            setPage={setPage}
            setQuizResult={setQuizResult}
          />
        } />
        <Route path="/quiz/personality/result" element={
          quizResult
            ? <PersonalityResultPage
                result={quizResult}
                setPage={setPage}
                clearQuizResult={() => setQuizResult(null)}
                onSaveTeam={(rawTeam) => {
                  const mapped = rawTeam.map(p => ({
                    name:    p.name,
                    id:      p.id,
                    moves:   (p.moves || []).slice(0, 4),
                    item:    null,
                    ability: p.abilities?.[0] || null,
                    evs: { hp:0, attack:0, defense:0, 'special-attack':0, 'special-defense':0, speed:0 },
                    ivs: { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 },
                    cachedData: {
                      id:             p.id,
                      name:           p.name,
                      sprite:         p.staticSprite || p.sprite,
                      spriteBack:     p.spriteBack,
                      animatedSprite: p.animatedSprite,
                      staticSprite:   p.staticSprite || p.sprite,
                      types:          p.types || [],
                      stats:          (p.stats || []).map(s => ({ name: s.name, value: s.value ?? s.base_stat ?? 0 })),
                      abilities:      (p.abilities || []).map(a => ({ name: a, isHidden: false, desc: '' })),
                      moves:          p.moves || [],
                      height:         p.height,
                      weight:         p.weight,
                    },
                  }));
                  setTeam(mapped);
                  navigate('/team/build');
                }}
              />
            : <Navigate to="/quiz/personality" replace />
        } />

        {/* Pokemon quiz */}
        <Route path="/quiz/pokemon" element={
          <PokemonQuizPage
            setPage={setPage}
            setPokemonQuizResult={setPokemonQuizResult}
          />
        } />
        <Route path="/quiz/pokemon/result" element={
          pokemonQuizResult
            ? <PokemonQuizResultPage result={pokemonQuizResult} setPage={setPage} clearResult={() => setPokemonQuizResult(null)} />
            : <Navigate to="/quiz/pokemon" replace />
        } />

        {/* Evolution quiz */}
        <Route path="/quiz/evolution" element={
          <EvolutionQuizPage
            setPage={setPage}
            setEvolutionQuizResult={setEvolutionQuizResult}
          />
        } />
        <Route path="/quiz/evolution/result" element={
          evolutionQuizResult
            ? <EvolutionQuizResultPage result={evolutionQuizResult} setPage={setPage} clearResult={() => setEvolutionQuizResult(null)} />
            : <Navigate to="/quiz/evolution" replace />
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black)', fontFamily: 'var(--font-mono)', color: 'var(--grey-400)', letterSpacing: '0.2em', fontSize: '13px', textTransform: 'uppercase' }}>
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
