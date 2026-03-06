import { useRef, useEffect } from 'react';
import { resetGameInSheets, updateEventCellInSheets, updatePlayerStateInSheets, updateGameNumberInSheets, updatePlayerNameInSheets } from '../api/sheets';
import { getDefaultPlayers, getDefaultEvents } from '../data/constants';
import './EventsScreen.css';

// Order required by user
const ROWS = ['Лучший ход', 'Проверки Дона', 'Проверки Шерифа', 'Отстрелы', 'Голосование'];
const ROW_LENGTHS = [3, 7, 7, 7, 7];
const BEST_MOVE_IDX = 0;

function EventsScreen({ players, setPlayers, events, setEvents, gameNumber, setGameNumber, tableNumber, fillPlayersFromData }) {
  // ensure stored shape
  useEffect(() => {
    if (!events || !events.rows || events.rows.length !== ROWS.length) {
      setEvents({ rows: ROW_LENGTHS.map((len) => Array(len).fill('')) });
      return;
    }

    // normalize row lengths to expected ROW_LENGTHS (handles older saved shapes)
    const needNormalize = events.rows.some((r, i) => !r || r.length !== ROW_LENGTHS[i]);
    if (needNormalize) {
      const normalized = ROW_LENGTHS.map((len, i) => {
        const row = (events.rows && events.rows[i]) ? events.rows[i].slice(0, len) : [];
        return row.concat(Array(Math.max(0, len - row.length)).fill(''));
      });
      setEvents({ rows: normalized });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputRefs = useRef(ROW_LENGTHS.map((len) => Array(len).fill(null)));

  const resetGame = () => {
    const ok = window.confirm('Вы уверены что хотите начать новую игру?');
    if (!ok) return;

    // reset players to defaults
    setPlayers(getDefaultPlayers());
    // clear events
    setEvents(getDefaultEvents());

    // reset google sheets if configured
    resetGameInSheets(parseInt(tableNumber, 10)).catch(err =>
      console.error('Failed to reset sheets:', err)
    );
  };

  const changeGameNumber = (newNumber) => {
    const ok = window.confirm('Вы уверены что хотите начать новую игру?');
    if (!ok) return;

    console.log(`Changing game number to ${newNumber} for table ${tableNumber}`);

    // Update game number
    setGameNumber(newNumber.toString());

    // reset players to defaults
    setPlayers(getDefaultPlayers());
    // clear events
    setEvents(getDefaultEvents());

    // Update game number in sheets
    updateGameNumberInSheets(parseInt(tableNumber, 10), newNumber).catch(err =>
      console.error('Failed to update game number in sheets:', err)
    );

    // reset google sheets if configured
    resetGameInSheets(parseInt(tableNumber, 10)).catch(err =>
      console.error('Failed to reset sheets:', err)
    );
  };

  const handleGameNumberPrevious = () => {
    const current = parseInt(gameNumber, 10);
    if (current > 1) {
      changeGameNumber(current - 1);
    }
  };

  const handleGameNumberNext = () => {
    changeGameNumber(parseInt(gameNumber, 10) + 1);
  };

  const handleChange = (rowIdx, idx, raw) => {
    let v = raw === '' ? '' : raw.replace(/[^0-9]/g, '');
    if (v !== '') {
      let n = parseInt(v, 10);
      if (Number.isNaN(n)) n = '';
      else if (n < 1) n = 1;
      else if (n > 10) n = 10;
      v = n.toString();
    }

    setEvents((prev) => {
      const copy = { rows: prev.rows.map((r) => r.slice()) };
      copy.rows[rowIdx][idx] = v;
      return copy;
    });

    // auto-focus for Лучший ход row
    if (rowIdx === BEST_MOVE_IDX && v !== '') {
      const next = idx + 1;
      if (next < ROW_LENGTHS[rowIdx]) {
        const el = inputRefs.current[rowIdx][next];
        if (el && typeof el.focus === 'function') el.focus();
      }
    }

    // update player state for Отстрелы and Голосование
    if (rowIdx === 3 && v !== '') { // Отстрелы
      const playerId = parseInt(v, 10);
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, state: 'Убит' } : p));
      updatePlayerStateInSheets(parseInt(tableNumber, 10), playerId, 'Убит').catch(err =>
        console.error('Failed to update player state in sheets:', err)
      );
    } else if (rowIdx === 4 && v !== '') { // Голосование
      const playerId = parseInt(v, 10);
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, state: 'Заголосован' } : p));
      updatePlayerStateInSheets(parseInt(tableNumber, 10), playerId, 'Заголосован').catch(err =>
        console.error('Failed to update player state in sheets:', err)
      );
    }

    // push individual update to Google Sheets
    updateEventCellInSheets(parseInt(tableNumber, 10), rowIdx, idx, v).catch(err =>
      console.error('Failed to update event cell in sheets:', err)
    );
  };

  const values = events.rows;

  return (
    <div className="events-screen">
      <div className="game-number-section">
        <div className="game-number-controls">
          <span className="game-number-label">Тур</span>
          <button 
            type="button" 
            className="game-number-btn game-number-btn--prev"
            onClick={handleGameNumberPrevious}
            aria-label="Предыдущая игра"
            title="Предыдущая игра"
          >
            ◀
          </button>
          <input
            type="number"
            min="1"
            className="game-number-input"
            value={gameNumber}
            onChange={(e) => setGameNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const newNum = parseInt(e.target.value, 10);
                if (!isNaN(newNum) && newNum > 0) {
                  changeGameNumber(newNum.toString());
                }
              }
            }}
            onBlur={(e) => {
              const newNum = parseInt(e.target.value, 10);
              if (!isNaN(newNum) && newNum > 0 && newNum.toString() !== gameNumber) {
                changeGameNumber(newNum.toString());
              }
            }}
            aria-label="Номер игры"
            title="Введите номер игры"
          />
          <button 
            type="button" 
            className="game-number-btn game-number-btn--next"
            onClick={handleGameNumberNext}
            aria-label="Следующая игра"
            title="Следующая игра"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="events-list">
        {ROWS.map((title, rowIdx) => (
          <div className="event-row" key={title}>
            <div className="event-row__title">{title}</div>
            <div className="event-row__inputs">
              {values[rowIdx].map((v, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[rowIdx][i] = el; }}
                  className="event-input"
                  inputMode="numeric"
                  type="number"
                  min="1"
                  max="10"
                  value={v}
                  onChange={(e) => handleChange(rowIdx, i, e.target.value)}
                  aria-label={`${title} ${i + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="events-actions">
        <button type="button" className="events-new-game" onClick={resetGame}>Новая игра</button>
      </div>
    </div>
  );
}

export default EventsScreen;
