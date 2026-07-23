import { useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTableNumber } from '../context/TableNumberContext';
import { useOBSContext } from '../context/OBSContext';
import './SettingsScreen.css';

function SettingsScreen({
  tournamentPlayers = [],
  loading = false,
  error = null,
  onRefresh,
}) {
  const { tableNumber, setTableNumber } = useTableNumber();
  const [showTimer, setShowTimer] = useLocalStorage('mafia-show-timer', 'true');

  const {
    obsEnabled,
    setObsEnabled,
    obsAddress,
    setObsAddress,
    obsStatus,
    isMuted,
    toggleMute,
    currentScene,
    scene1Name,
    setScene1Name,
    scene2Name,
    setScene2Name,
    sourceName,
    setSourceName,
    switchScene,
  } = useOBSContext();

  // Локальный буфер поля адреса: применяем в контекст только по потере фокуса,
  // чтобы не переподключаться к OBS на каждое нажатие клавиши при вводе.
  const [addressDraft, setAddressDraft] = useState(obsAddress);
  useEffect(() => {
    setAddressDraft(obsAddress);
  }, [obsAddress]);

  const handleTableNumberChange = (e) => {
    setTableNumber(e.target.value);
  };

  const toggleOBS = () => {
    setObsEnabled(!obsEnabled);
  };

  const toggleTimer = () => {
    setShowTimer((v) => (v === 'true' ? 'false' : 'true'));
  };

  const commitAddress = () => {
    setObsAddress(addressDraft);
  };

  return (
    <div className="settings-screen">
      <div className="settings-screen__section">
        <h3 className="settings-screen__subtitle">Номер стола</h3>
        <select
          className="settings-screen__table-select"
          value={tableNumber}
          onChange={handleTableNumberChange}
        >
          {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={String(num)}>
              Стол {num}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-screen__section">
        <h3 className="settings-screen__subtitle">Опции</h3>

        <label className="settings-screen__option">
          <input
            type="checkbox"
            checked={obsEnabled}
            onChange={toggleOBS}
          />
          <span>Использовать OBS</span>
        </label>

        {obsEnabled && (
          <div style={{ marginLeft: 20 }}>
            <div className="settings-screen__obs-address">
              <label>
                Адрес OBS WebSocket:
                <input
                  type="text"
                  value={addressDraft}
                  onChange={(e) => setAddressDraft(e.target.value)}
                  onBlur={commitAddress}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur(); } }}
                  className="settings-screen__input"
                />
              </label>
            </div>
            <p>Статус OBS: {obsStatus}</p>

            <div className="settings-screen__field">
              <label className="settings-screen__field-label">
                Название сцены 1 (как в OBS):
                <input
                  type="text"
                  value={scene1Name}
                  onChange={(e) => setScene1Name(e.target.value)}
                  className="settings-screen__input"
                />
              </label>
            </div>
            <div className="settings-screen__field">
              <label className="settings-screen__field-label">
                Название сцены 2 (как в OBS):
                <input
                  type="text"
                  value={scene2Name}
                  onChange={(e) => setScene2Name(e.target.value)}
                  className="settings-screen__input"
                />
              </label>
            </div>
            <div className="settings-screen__field">
              <label className="settings-screen__field-label">
                Название источника звука (как в OBS):
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="settings-screen__input"
                />
              </label>
            </div>

            <div className="sound-switch">
              <div className="scene-label">Сцена: {currentScene || '—'}</div>
              <div className="scene-toggle">
                <button
                  type="button"
                  className={`scene-btn ${currentScene === scene1Name ? 'active' : ''}`}
                  onClick={() => switchScene(scene1Name)}
                >
                  {scene1Name}
                </button>
                <button
                  type="button"
                  className={`scene-btn ${currentScene === scene2Name ? 'active' : ''}`}
                  onClick={() => switchScene(scene2Name)}
                >
                  {scene2Name}
                </button>
              </div>
            </div>

            <div className="sound-switch">
              <div className="scene-label">Звук:</div>
              <div className="scene-toggle">
                <button
                  type="button"
                  className={`scene-btn ${!isMuted ? 'active' : ''}`}
                  onClick={() => { if (isMuted) toggleMute(); }}
                  aria-label="Включить звук"
                >
                  Вкл
                </button>
                <button
                  type="button"
                  className={`scene-btn ${isMuted ? 'active' : ''}`}
                  onClick={() => { if (!isMuted) toggleMute(); }}
                  aria-label="Выключить звук"
                >
                  Выкл
                </button>
              </div>
            </div>
          </div>
        )}

        <label className="settings-screen__option">
          <input
            type="checkbox"
            checked={showTimer === 'true'}
            onChange={toggleTimer}
          />
          <span>Показывать таймер</span>
        </label>
      </div>

      <div className="settings-screen__section">
        <div className="settings-screen__header">
          <h2 className="settings-screen__title">Участники турнира</h2>
          <button
            type="button"
            className="settings-screen__refresh"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? 'Загрузка…' : 'Обновить'}
          </button>
        </div>

        {error && <p className="settings-screen__error">{error}</p>}

        <ul className="tournament-list">
          {tournamentPlayers.map((nick, index) => (
            <li key={index} className="tournament-list__item">
              <span className="tournament-list__number">
                {index + 1}
              </span>
              <span className="tournament-list__value">
                {nick || '—'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SettingsScreen;
