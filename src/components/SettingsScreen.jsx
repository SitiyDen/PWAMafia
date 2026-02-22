import { useLocalStorage } from '../hooks/useLocalStorage';
import './SettingsScreen.css';

function SettingsScreen({
  tournamentPlayers = [],
  loading = false,
  error = null,
  onRefresh,
}) {
  const [tableNumber, setTableNumber] = useLocalStorage('mafia-table-number', '1');
  const [useOBS, setUseOBS] = useLocalStorage('mafia-use-obs', 'false');
  const [showTimer, setShowTimer] = useLocalStorage('mafia-show-timer', 'true');

  const handleTableNumberChange = (e) => {
    setTableNumber(e.target.value);
  };

  const toggleOBS = () => {
    setUseOBS((v) => (v === 'true' ? 'false' : 'true'));
  };

  const toggleTimer = () => {
    setShowTimer((v) => (v === 'true' ? 'false' : 'true'));
  };

  return (
    <div className="settings-screen">
      <div className="settings-screen__section">
        <h3 className="settings-screen__subtitle">Номер стола</h3>
        <select
          className="settings-screen__table-select"
          value={tableNumber}
          onChange={handleTableNumberChange}
          aria-label="Номер стола"
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
            checked={useOBS === 'true'}
            onChange={toggleOBS}
            aria-label="Использовать OBS"
          />
          <span>Использовать OBS</span>
        </label>
        <label className="settings-screen__option">
          <input
            type="checkbox"
            checked={showTimer === 'true'}
            onChange={toggleTimer}
            aria-label="Показывать таймер"
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
            title="Загрузить из Google Таблицы"
          >
            {loading ? 'Загрузка…' : 'Обновить'}
          </button>
        </div>
        {error && <p className="settings-screen__error">{error}</p>}
        <ul className="tournament-list">
          {tournamentPlayers.map((nick, index) => (
            <li key={index} className="tournament-list__item tournament-list__item--readonly">
              <span className="tournament-list__number">{index + 1}</span>
              <span className="tournament-list__value">{nick || '—'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SettingsScreen;
