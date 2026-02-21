import { useLocalStorage } from '../hooks/useLocalStorage';
import { getDefaultPlayers } from '../data/constants';
import PlayerRow from './PlayerRow';
import './PlayerTable.css';

/**
 * Таблица игроков с сохранением в localStorage
 */
function PlayerTable({ showRoleColumn = true, tournamentPlayers = [] }) {
  const [players, setPlayers] = useLocalStorage('mafia-players', getDefaultPlayers());

  const updatePlayer = (id, field, value) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleNameChange = (id, name) => updatePlayer(id, 'name', name);
  const handleRoleChange = (id, role) => updatePlayer(id, 'role', role);
  const handleStateChange = (id, state) => updatePlayer(id, 'state', state);

  return (
    <div className={`player-table ${!showRoleColumn ? 'player-table--hide-role' : ''}`}>
      {players.map((player) => (
        <PlayerRow
          key={player.id}
          player={player}
          tournamentPlayers={tournamentPlayers}
          showRoleColumn={showRoleColumn}
          onNameChange={handleNameChange}
          onRoleChange={handleRoleChange}
          onStateChange={handleStateChange}
        />
      ))}
    </div>
  );
}

export default PlayerTable;
