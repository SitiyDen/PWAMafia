import { useState, useRef, useEffect } from 'react';
import './PlayerNameSelect.css';

/**
 * Поисковый выбор игрока: ввод текста фильтрует список
 */
function PlayerNameSelect({ value, options, onChange, placeholder = '—' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const filtered = query.trim()
    ? options.filter((nick) =>
        nick.toLowerCase().includes(query.toLowerCase().trim())
      )
    : options;

  const displayValue = open ? query : (value || '');

  useEffect(() => {
    if (open) setQuery(value || '');
    else setQuery('');
  }, [open, value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (nick) => {
    onChange(nick);
    setOpen(false);
    setQuery('');
  };

  const handleFocus = () => setOpen(true);

  const handleChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="player-name-select" ref={containerRef}>
      <input
        type="text"
        className="player-name-select__input"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && (
        <ul className="player-name-select__dropdown">
          <li
            className="player-name-select__option"
            onClick={() => handleSelect('')}
          >
            {placeholder}
          </li>
          {filtered.slice(0, 80).map((nick) => (
            <li
              key={nick}
              className="player-name-select__option"
              onClick={() => handleSelect(nick)}
            >
              {nick || '(пусто)'}
            </li>
          ))}
          {filtered.length > 80 && (
            <li className="player-name-select__hint">
              Найдено {filtered.length}, введите больше букв
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default PlayerNameSelect;
