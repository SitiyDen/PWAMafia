import { ROLES, STATES } from '../data/constants';
import PlayerNameSelect from './PlayerNameSelect';
import './PlayerTable.css';

/**
 * Строка с данными одного игрока
 */
function PlayerRow({ player, tournamentPlayers = [], showRoleColumn = true, onNameChange, onRoleChange, onStateChange }) {
  const handleNameChange = (nick) => onNameChange(player.id, nick);

  const handleRoleChange = (e) => {
    onRoleChange(player.id, e.target.value);
  };

  const handleStateChange = (e) => {
    onStateChange(player.id, e.target.value);
  };

  return (
    <div className={`player-row ${player.state !== 'В игре' ? 'player-row--dimmed' : ''}`}>
      <div className="player-cell player-cell--name">
        <span className="player-number">{player.id}</span>
        <PlayerNameSelect
          value={player.name}
          options={tournamentPlayers}
          onChange={handleNameChange}
          placeholder="—"
        />
      </div>
      {showRoleColumn && (
      <select
        className="player-select player-role"
        value={player.role}
        onChange={handleRoleChange}
        aria-label={`Роль слот ${player.id}`}
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      )}
      <select
        className="player-select player-state"
        value={player.state}
        onChange={handleStateChange}
        aria-label={`Состояние слот ${player.id}`}
      >
        {STATES.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
    </div>
  );
}

export default PlayerRow;
