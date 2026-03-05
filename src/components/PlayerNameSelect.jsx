import { useState, useRef, useEffect } from 'react';
import './PlayerNameSelect.css';

/**
 * Поисковый выбор игрока: ввод текста фильтрует список
 */
function PlayerNameSelect({ value, options, onChange, placeholder = '—' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = query.trim()
    ? options.filter((nick) =>
        nick.toLowerCase().includes(query.toLowerCase().trim())
      )
    : options;

  const displayValue = open ? query : (value || '');

  useEffect(() => {
    if (open) {
      setQuery(value || '');
      // Focus input after modal opens
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery('');
    }
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
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="player-name-select" ref={containerRef}>
      <input
        ref={inputRef}
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
        <>
          <div
            className="player-name-select__backdrop"
            onClick={handleBackdropClick}
          />
          <div className="player-name-select__modal">
            <div className="player-name-select__modal-content">
              <div className="player-name-select__modal-header">
                <h2 className="player-name-select__modal-title">Выбор игрока</h2>
                <button
                  className="player-name-select__close-btn"
                  onClick={() => {
                    setOpen(false);
                    setQuery('');
                  }}
                  aria-label="Закрыть"
                >
                  ✕
                </button>
              </div>
              <div className="player-name-select__modal-search-wrapper">
                <input
                  type="text"
                  className="player-name-select__modal-search"
                  value={query}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Поиск игрока..."
                  autoComplete="off"
                />
                {query && (
                  <button
                    type="button"
                    className="player-name-select__clear-btn"
                    onClick={() => setQuery('')}
                    aria-label="Очистить поиск"
                  >
                    ✕
                  </button>
                )}
              </div>
              <ul className="player-name-select__modal-list">
                <li
                  className="player-name-select__modal-option"
                  onClick={() => handleSelect('')}
                >
                  {placeholder}
                </li>
                {filtered.slice(0, 200).map((nick) => (
                  <li
                    key={nick}
                    className="player-name-select__modal-option"
                    onClick={() => handleSelect(nick)}
                  >
                    {nick || '(пусто)'}
                  </li>
                ))}
                {filtered.length > 200 && (
                  <li className="player-name-select__modal-hint">
                    Найдено {filtered.length}, введите больше букв
                  </li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PlayerNameSelect;
