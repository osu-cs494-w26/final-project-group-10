// Root component 
// Manages current page, team state, and renders NavBar.

import React, { useState } from 'react';
import './styles/global.css';

import NavBar    from './components/NavBar.jsx';
import HomePage  from './pages/HomePage.jsx';
import SelectPage from './pages/SelectPage.jsx';
import BattlePage from './pages/BattlePage.jsx';

export default function App() {
  const [page, setPage] = useState('home');
  const [team, setTeam] = useState([]);

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage setPage={setPage} />;
      case 'select':
        return <SelectPage setPage={setPage} team={team} setTeam={setTeam} />;
      case 'battle':
        return <BattlePage team={team} setPage={setPage} />;
      default:
        return <HomePage setPage={setPage} />;
    }
  };

  return (
    <div key={page} style={{ animation: 'fadeIn 0.3s ease' }}>
      <NavBar page={page} setPage={setPage} />
      {renderPage()}
    </div>
  );
}
