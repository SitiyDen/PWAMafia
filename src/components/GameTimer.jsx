import { useState, useEffect, useRef } from 'react';
import './GameTimer.css';

function GameTimer({ initial = 60 }) {
  const [secondsLeft, setSecondsLeft] = useState(initial);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && intervalRef.current == null) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  const start = (duration) => {
    const dur = typeof duration === 'number' ? duration : initial;
    setSecondsLeft(dur);
    setRunning(true);
  };

  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="game-timer" role="region" aria-label="Таймер">
      <div className="game-timer__inner">
        <div className="game-timer__time" aria-live="polite">{format(secondsLeft)}</div>
        <div className="game-timer__controls">
          <button type="button" className="game-timer__start" onClick={() => start(initial)}>
            Старт {initial}с
          </button>
          <button type="button" className="game-timer__start" onClick={() => start(30)}>
            Старт 30с
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameTimer;
