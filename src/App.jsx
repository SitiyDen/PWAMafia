import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import gameData from './data/data-game.json';
import { updatePlayerNameInSheets } from './api/sheets';
import logoPS from './assets/logoPS.png';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('game');
  const [showRoleColumn, setShowRoleColumn] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const { tournamentPlayers, loading, error, refresh } = useTournamentPlayers();
  
  const [useOBS] = useLocalStorage('mafia-use-obs', 'false');
  const [showTimer] = useLocalStorage('mafia-show-timer', 'true');
  const { tableNumber } = useTableNumber();
  const isInitialLoad = useRef(true);
  const [gameNumber, setGameNumber] = useState(() => {
    try {
      const stored = localStorage.getItem('mafia-game-number');
      return stored || '1';
    } catch {
      return '1';
    }
  });
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

  // Сохраняем gameNumber в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem('mafia-game-number', gameNumber);
    } catch (error) {
      console.error('Error saving gameNumber to localStorage:', error);
    }
  }, [gameNumber]);

  const fillPlayersFromData = useCallback((skipConfirm = false) => {
    if (!skipConfirm) {
      const ok = window.confirm('Таблица игроков будет перезаполнена, уверены?');
      if (!ok) return;
    }

    const tourNumber = parseInt(gameNumber, 10);
    const tableNum = parseInt(tableNumber, 10);

    const tour = gameData.tours.find(t => t.tour === tourNumber);
    if (!tour) {
      if (!skipConfirm) alert(`Тур ${tourNumber} не найден в данных.`);
      return;
    }

    const table = tour.tables.find(t => t.table === tableNum);
    if (!table) {
      if (!skipConfirm) alert(`Стол ${tableNum} не найден в туре ${tourNumber}.`);
      return;
    }

    const newPlayers = getDefaultPlayers();
    table.players.forEach(player => {
      if (player.seat >= 1 && player.seat <= 10) {
        newPlayers[player.seat - 1].name = player.name;
      }
    });

    setPlayers(newPlayers);

    // Обновляем имена в Google Sheets
    table.players.forEach(player => {
      if (player.seat >= 1 && player.seat <= 10) {
        updatePlayerNameInSheets(tableNum, player.seat, player.name).catch(err =>
          console.error('Failed to update player name in sheets:', err)
        );
      }
    });
  }, [gameNumber, tableNumber, setPlayers]);

  // Load table data when tableNumber or gameNumber changes (but not on initial load)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
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
  }, [tableNumber, gameNumber]);


  return (
    <div className="app">
      <header className="app-header">
        <img src={logoPS} alt="Logo" className="app-header__logo" />
        <h1>Мафия</h1>
        {activeTab === 'game' && (
          <div className="app-header__buttons">
            <button
              type="button"
              className="app-header__fill-players"
              onClick={() => fillPlayersFromData(false)}
              title="Заполнить список игроков"
              aria-label="Заполнить список игроков"
            >
              👥
            </button>
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
          </div>
        )}
      </header>
      <main className="app-main">
        {activeTab === 'game' && (
          <PlayerTable showRoleColumn={showRoleColumn} tournamentPlayers={tournamentPlayers} players={players} setPlayers={setPlayers} events={events} setEvents={setEvents} />
        )}
        {activeTab === 'game' && timerVisible && (
          <div className="game-timer-container">
            <GameTimer />
          </div>
        )}
        {activeTab === 'game' && (
          <div className="game-hud">
            {obsEnabled && (
              <div className="game-hud__controls">
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
                {/* Timer moved to global level */}
              </div>
            )}
          </div>
        )}
        {activeTab === 'events' && <EventsScreen players={players} setPlayers={setPlayers} events={events} setEvents={setEvents} gameNumber={gameNumber} setGameNumber={setGameNumber} tableNumber={tableNumber} fillPlayersFromData={fillPlayersFromData} />}
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
