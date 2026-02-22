import { useRef, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getDefaultPlayers } from '../data/constants';
import './EventsScreen.css';

// Order required by user
const ROWS = ['Лучший ход', 'Проверки Дона', 'Проверки Шерифа', 'Отстрелы', 'Голосование'];
const ROW_LENGTHS = [3, 7, 7, 7, 7];
const BEST_MOVE_IDX = 0;

function EventsScreen() {
  const initial = { rows: ROW_LENGTHS.map((len) => Array(len).fill('')) };
  const [events, setEvents] = useLocalStorage('mafia-events', initial);

  // ensure stored shape
  useEffect(() => {
    if (!events || !events.rows || events.rows.length !== ROWS.length) {
      setEvents(initial);
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

  const [, setPlayers] = useLocalStorage('mafia-players', getDefaultPlayers());

  const resetGame = () => {
    const ok = window.confirm('Вы уверены что хотите начать новую игру?');
    if (!ok) return;

    // reset players to defaults
    setPlayers(getDefaultPlayers());
    // clear events
    setEvents(initial);
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
  };

  const values = events.rows;

  return (
    <div className="events-screen">
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
