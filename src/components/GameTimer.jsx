import { useState, useEffect, useRef } from 'react';
import './GameTimer.css';

function GameTimer({ initial = 60 }) {
  const [secondsLeft, setSecondsLeft] = useState(initial);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && intervalRef.current == null) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
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
      <div className="game-timer__card">
        <div className="game-timer__row">
          <button type="button" className="game-timer__btn" onClick={() => start(30)}>30s</button>
          <div className="game-timer__display">
            <div className="game-timer__time" aria-live="polite">{format(secondsLeft)}</div>
          </div>
          <button type="button" className="game-timer__btn" onClick={() => start(60)}>60s</button>
        </div>
      </div>
    </div>
  );
}

export default GameTimer;
