import { useState, useMemo, useEffect } from 'react';
import PlayerTable from './components/PlayerTable';
import BottomNav from './components/BottomNav';
import EventsScreen from './components/EventsScreen';
import GameTimer from './components/GameTimer';
import SettingsScreen from './components/SettingsScreen';
import { useTournamentPlayers } from './hooks/useTournamentPlayers';
import { useLocalStorage } from './hooks/useLocalStorage';
import { loadTableDataFromSheets } from './api/sheets';
import logoPS from './assets/logoPS.png';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('game');
  const [showRoleColumn, setShowRoleColumn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const SCENES = ['Заставка', 'Игра'];
  const [scene, setScene] = useState(SCENES[1]);
  const { tournamentPlayers, loading, error, refresh } = useTournamentPlayers();
  
  const [useOBS] = useLocalStorage('mafia-use-obs', 'false');
  const [showTimer] = useLocalStorage('mafia-show-timer', 'true');
  const [tableNumber, setTableNumber] = useLocalStorage('mafia-table-number', '1');
  
  const obsEnabled = useOBS === 'true';
  const timerVisible = showTimer === 'true';

  // Load table data when tableNumber changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadTableDataFromSheets(parseInt(tableNumber, 10));
        if (data) {
          // Update localStorage for players only
          localStorage.setItem('mafia-players', JSON.stringify(data.players));
        }
      } catch (error) {
        console.error('Failed to load table data:', error);
      }
    };
    loadData();
  }, [tableNumber]);


  return (
    <div className="app">
      <header className="app-header">
        <img src={logoPS} alt="Logo" className="app-header__logo" />
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
          <PlayerTable showRoleColumn={showRoleColumn} tournamentPlayers={tournamentPlayers} tableNumber={parseInt(tableNumber, 10)} />
        )}
        {activeTab === 'game' && (
          <div className="game-hud">
            {obsEnabled && (
              <div className="game-hud__controls">
                <div className="scene-switch">
                  <div className="scene-label">Сцена:</div>
                  <div className="scene-toggle">
                    {SCENES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`scene-btn ${scene === s ? 'active' : ''}`}
                        onClick={() => setScene(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* sound buttons mirror scene switch style */}
                <div className="sound-switch">
                  <div className="scene-label">Звук:</div>
                  <div className="scene-toggle">
                    <button
                      type="button"
                      className={`scene-btn ${soundOn ? 'active' : ''}`}
                      onClick={() => setSoundOn(true)}
                      aria-label="Включить звук"
                    >
                      Вкл
                    </button>
                    <button
                      type="button"
                      className={`scene-btn ${!soundOn ? 'active' : ''}`}
                      onClick={() => setSoundOn(false)}
                      aria-label="Выключить звук"
                    >
                      Выкл
                    </button>
                  </div>
                </div>
              </div>
            )}

            {timerVisible && (
              <div className="game-hud__timer">
                <GameTimer />
              </div>
            )}
          </div>
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
