import { useState, useMemo, useEffect } from 'react';
import PlayerTable from './components/PlayerTable';
import BottomNav from './components/BottomNav';
import EventsScreen from './components/EventsScreen';
import GameTimer from './components/GameTimer';
import SettingsScreen from './components/SettingsScreen';
import { useTournamentPlayers } from './hooks/useTournamentPlayers';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTableNumber } from './context/TableNumberContext';
import { loadTableDataFromSheets } from './api/sheets';
import { getDefaultPlayers, getDefaultEvents } from './data/constants';
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
  const { tableNumber } = useTableNumber();
  const [players, setPlayers] = useState(() => {
    try {
      const key = `mafia-players-${tableNumber}`;
      const stored = JSON.parse(localStorage.getItem(key));
      return stored || getDefaultPlayers();
    } catch {
      return getDefaultPlayers();
    }
  });
  
  const [events, setEvents] = useState(() => {
    try {
      const key = `mafia-events-${tableNumber}`;
      const stored = JSON.parse(localStorage.getItem(key));
      return stored || getDefaultEvents();
    } catch {
      return getDefaultEvents();
    }
  });
  
  const obsEnabled = useOBS === 'true';
  const timerVisible = showTimer === 'true';

  // Синхронизируем players с localStorage каждый раз при смене стола
  useEffect(() => {
    try {
      const key = `mafia-players-${tableNumber}`;
      const stored = JSON.parse(localStorage.getItem(key));
      setPlayers(stored || getDefaultPlayers());
    } catch (error) {
      console.error('Error reading players from localStorage:', error);
      setPlayers(getDefaultPlayers());
    }
  }, [tableNumber]);

  // Синхронизируем events с localStorage каждый раз при смене стола
  useEffect(() => {
    try {
      const key = `mafia-events-${tableNumber}`;
      const stored = JSON.parse(localStorage.getItem(key));
      setEvents(stored || getDefaultEvents());
    } catch (error) {
      console.error('Error reading events from localStorage:', error);
      setEvents(getDefaultEvents());
    }
  }, [tableNumber]);

  // Сохраняем players в localStorage при изменении
  useEffect(() => {
    try {
      const key = `mafia-players-${tableNumber}`;
      localStorage.setItem(key, JSON.stringify(players));
    } catch (error) {
      console.error('Error saving players to localStorage:', error);
    }
  }, [players, tableNumber]);

  // Сохраняем events в localStorage при изменении
  useEffect(() => {
    try {
      const key = `mafia-events-${tableNumber}`;
      localStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events to localStorage:', error);
    }
  }, [events, tableNumber]);

  // Load table data when tableNumber changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadTableDataFromSheets(parseInt(tableNumber, 10));
        if (data) {
          // Update players from Google Sheets if available
          if (data.players) {
            setPlayers(data.players);
          }
          // Update events from Google Sheets if available
          if (data.events) {
            setEvents(data.events);
          }
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
          <PlayerTable showRoleColumn={showRoleColumn} tournamentPlayers={tournamentPlayers} players={players} setPlayers={setPlayers} />
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
        {activeTab === 'events' && <EventsScreen players={players} setPlayers={setPlayers} events={events} setEvents={setEvents} />}
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
