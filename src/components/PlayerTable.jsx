import { useLocalStorage } from '../hooks/useLocalStorage';
import { getDefaultPlayers } from '../data/constants';
import PlayerRow from './PlayerRow';
import './PlayerTable.css';

/**
 * Таблица игроков с сохранением в localStorage
 */
function PlayerTable({ showRoleColumn = true, tournamentPlayers = [], tableNumber = 1 }) {
  const [players, setPlayers] = useLocalStorage('mafia-players', getDefaultPlayers());
  const DEFAULT_EVENTS = { rows: [Array(3).fill(''), Array(7).fill(''), Array(7).fill(''), Array(7).fill(''), Array(7).fill('')] };
  const [events, setEvents] = useLocalStorage('mafia-events', DEFAULT_EVENTS);

  const updatePlayer = (id, field, value) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleNameChange = (id, name) => updatePlayer(id, 'name', name);
  const handleRoleChange = (id, role) => updatePlayer(id, 'role', role);

  const handleStateChange = (id, state) => {
    setPlayers((prev) => {
      const oldPlayer = prev.find((p) => p.id === id);
      const prevState = oldPlayer ? oldPlayer.state : null;

      const updated = prev.map((p) => (p.id === id ? { ...p, state } : p));

      if (prevState !== state) {
        // Убит -> add to Отстрелы (row index 3)
        if (state === 'Убит') {
          setEvents((ev) => {
            const copy = { rows: ev.rows.map((r) => r.slice()) };
            const shots = copy.rows[3];
            const strId = String(id);
            if (!shots.includes(strId)) {
              const emptyIdx = shots.findIndex((s) => s === '');
              if (emptyIdx !== -1) shots[emptyIdx] = strId;
            }
            return copy;
          });
        } else if (prevState === 'Убит' && state !== 'Убит') {
          // removed killed — remove from shots and shift left
          setEvents((ev) => {
            const copy = { rows: ev.rows.map((r) => r.slice()) };
            const shots = copy.rows[3];
            const strId = String(id);
            const idx = shots.findIndex((s) => s === strId);
            if (idx !== -1) {
              for (let i = idx; i < shots.length - 1; i++) shots[i] = shots[i + 1];
              shots[shots.length - 1] = '';
            }
            return copy;
          });
        }

        // Заголосован -> add to Голосование (row index 4)
        if (state === 'Заголосован') {
          setEvents((ev) => {
            const copy = { rows: ev.rows.map((r) => r.slice()) };
            const votes = copy.rows[4];
            const strId = String(id);
            if (!votes.includes(strId)) {
              const emptyIdx = votes.findIndex((s) => s === '');
              if (emptyIdx !== -1) votes[emptyIdx] = strId;
            }
            return copy;
          });
        } else if (prevState === 'Заголосован' && state !== 'Заголосован') {
          setEvents((ev) => {
            const copy = { rows: ev.rows.map((r) => r.slice()) };
            const votes = copy.rows[4];
            const strId = String(id);
            const idx = votes.findIndex((s) => s === strId);
            if (idx !== -1) {
              for (let i = idx; i < votes.length - 1; i++) votes[i] = votes[i + 1];
              votes[votes.length - 1] = '';
            }
            return copy;
          });
        }
      }

      return updated;
    });
  };

  return (
    <div className={`player-table ${!showRoleColumn ? 'player-table--hide-role' : ''}`}>
      {players.map((player) => (
        <PlayerRow
          key={player.id}
          player={player}
          tournamentPlayers={tournamentPlayers}
          showRoleColumn={showRoleColumn}
          tableNumber={tableNumber}
          onNameChange={handleNameChange}
          onRoleChange={handleRoleChange}
          onStateChange={handleStateChange}
        />
      ))}
    </div>
  );
}

export default PlayerTable;
