import { useState, useEffect, useRef } from 'react';
import './GameTimer.css';

function GameTimer({ initial = 60 }) {
  const [secondsLeft, setSecondsLeft] = useState(initial);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('timer'); // 'timer' или 'stopwatch'
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && intervalRef.current == null) {
      intervalRef.current = setInterval(() => {
        if (mode === 'timer') {
          setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
        } else if (mode === 'stopwatch') {
          setSecondsLeft((s) => s + 1);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, mode]);

  const start = (duration) => {
    setMode('timer');
    const dur = typeof duration === 'number' ? duration : initial;
    setSecondsLeft(dur);
    setRunning(true);
  };

  const startStopwatch = () => {
    if (!running) {
      // Если не запущен, запускаем секундомер с 0
      setMode('stopwatch');
      setSecondsLeft(0);
      setRunning(true);
    } else {
      // Если запущен, останавливаем
      setRunning(false);
    }
  };

  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="game-timer" role="region" aria-label="Таймер">
      <div className="game-timer__card">
        <div className="game-timer__row">
          <button type="button" className="game-timer__btn" onClick={() => start(30)}>30s</button>
          <div className="game-timer__display" onClick={startStopwatch} style={{ cursor: 'pointer' }}>
            <div className={`game-timer__time ${mode === 'timer' && secondsLeft <= 10 && running ? 'game-timer__time--warning' : ''}`} aria-live="polite">{format(secondsLeft)}</div>
          </div>
          <button type="button" className="game-timer__btn" onClick={() => start(60)}>60s</button>
        </div>
      </div>
    </div>
  );
}

export default GameTimer;
