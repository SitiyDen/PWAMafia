import { useState, useMemo } from 'react';
import PlayerTable from './components/PlayerTable';
import BottomNav from './components/BottomNav';
import EventsScreen from './components/EventsScreen';
import GameTimer from './components/GameTimer';
import SettingsScreen from './components/SettingsScreen';
import { useTournamentPlayers } from './hooks/useTournamentPlayers';
import { useLocalStorage } from './hooks/useLocalStorage';
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
  
  const obsEnabled = useOBS === 'true';
  const timerVisible = showTimer === 'true';

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
          <PlayerTable showRoleColumn={showRoleColumn} tournamentPlayers={tournamentPlayers} />
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

                <label className={`toggle ${soundOn ? 'toggle--on' : 'toggle--off'}`}>
                  <span className="toggle-label">{soundOn ? 'Звук: Вкл' : 'Звук: Выкл'}</span>
                  <input
                    type="checkbox"
                    checked={soundOn}
                    onChange={() => setSoundOn((s) => !s)}
                    aria-label={soundOn ? 'Отключить звук' : 'Включить звук'}
                  />
                  <span className="toggle-slider" aria-hidden="true" />
                </label>
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
