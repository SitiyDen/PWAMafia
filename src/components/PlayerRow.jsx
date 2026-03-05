import { ROLES, STATES } from '../data/constants';
import PlayerNameSelect from './PlayerNameSelect';
import { useTableNumber } from '../context/TableNumberContext';
import './PlayerTable.css';

import { updatePlayerNameInSheets, updatePlayerRoleInSheets, updatePlayerStateInSheets } from '../api/sheets';

/**
 * Строка с данными одного игрока
 */
function PlayerRow({ player, tournamentPlayers = [], showRoleColumn = true, onNameChange, onRoleChange, onStateChange }) {
  const { tableNumber } = useTableNumber();
  const handleNameChange = (nick) => {
    onNameChange(player.id, nick);
    // Update Google Sheets
    updatePlayerNameInSheets(parseInt(tableNumber, 10), player.id, nick).catch(
      (err) => console.error('Failed to update sheets:', err)
    );
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    onRoleChange(player.id, newRole);
    // Update Google Sheets
    updatePlayerRoleInSheets(parseInt(tableNumber, 10), player.id, newRole).catch(
      (err) => console.error('Failed to update sheets:', err)
    );
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    onStateChange(player.id, newState);
    // Update Google Sheets
    updatePlayerStateInSheets(parseInt(tableNumber, 10), player.id, newState).catch(
      (err) => console.error('Failed to update sheets:', err)
    );
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
