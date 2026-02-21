import { useState } from 'react';
import PlayerTable from './components/PlayerTable';
import BottomNav from './components/BottomNav';
import EventsScreen from './components/EventsScreen';
import SettingsScreen from './components/SettingsScreen';
import { useTournamentPlayers } from './hooks/useTournamentPlayers';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('game');
  const [showRoleColumn, setShowRoleColumn] = useState(true);
  const { tournamentPlayers, loading, error, refresh } = useTournamentPlayers();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Мафия</h1>
        {activeTab === 'game' && (
          <button
            type="button"
            className={`app-header__eye ${!showRoleColumn ? 'app-header__eye--hidden' : ''}`}
            onClick={() => setShowRoleColumn((v) => !v)}
            title={showRoleColumn ? 'Скрыть роли' : 'Показать роли'}
            aria-label={showRoleColumn ? 'Скрыть роли' : 'Показать роли'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </header>
      <main className="app-main">
        {activeTab === 'game' && (
          <PlayerTable showRoleColumn={showRoleColumn} tournamentPlayers={tournamentPlayers} />
        )}
        {activeTab === 'events' && <EventsScreen />}
        {activeTab === 'settings' && (
          <SettingsScreen
            tournamentPlayers={tournamentPlayers}
            loading={loading}
            error={error}
            onRefresh={refresh}
          />
        )}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
