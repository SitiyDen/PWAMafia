import { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './SettingsScreen.css';

function SettingsScreen({
  tournamentPlayers = [],
  loading = false,
  error = null,
  onRefresh,
}) {
  const [tableNumber, setTableNumber] = useLocalStorage('mafia-table-number', '1');
  const [useOBS, setUseOBS] = useLocalStorage('mafia-use-obs', 'false');
  const [showTimer, setShowTimer] = useLocalStorage('mafia-show-timer', 'true');
  // OBS websocket address can be configured by the user
  const [obsAddress, setObsAddress] = useLocalStorage(
    'mafia-obs-address',
    'ws://192.168.0.174:4455'
  );

  const [obsStatus, setObsStatus] = useState('disconnected');
  const [isMuted, setIsMuted] = useState(false);

  const socketRef = useRef(null);
  const identifiedRef = useRef(false);

  const OBS_PASSWORD = '123456';
  const SOURCE_NAME = 'Захват входного аудиопотока'; // <-- имя источника в OBS

  const handleTableNumberChange = (e) => {
    setTableNumber(e.target.value);
  };

  const toggleOBS = () => {
    setUseOBS((v) => (v === 'true' ? 'false' : 'true'));
  };

  const toggleTimer = () => {
    setShowTimer((v) => (v === 'true' ? 'false' : 'true'));
  };

  const handleObsAddressChange = (e) => {
    setObsAddress(e.target.value);
  };

  // ==========================
  // Подключение к OBS
  // ==========================
  useEffect(() => {
    if (useOBS !== 'true') {
      disconnectOBS();
      return;
    }

    connectOBS();

    return () => {
      disconnectOBS();
    };
  }, [useOBS]);

  function connectOBS() {
    // use the configured websocket address
    const socket = new WebSocket(obsAddress);
    socketRef.current = socket;

    socket.onopen = () => {
      setObsStatus('connecting');
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      // Hello
      if (message.op === 0) {
        const auth = message.d.authentication;

        if (auth) {
          const response = await generateAuth(
            OBS_PASSWORD,
            auth.salt,
            auth.challenge
          );

          socket.send(
            JSON.stringify({
              op: 1,
              d: {
                rpcVersion: 1,
                authentication: response,
              },
            })
          );
        } else {
          socket.send(
            JSON.stringify({
              op: 1,
              d: { rpcVersion: 1 },
            })
          );
        }
      }

      // Identified
      if (message.op === 2) {
        identifiedRef.current = true;
        setObsStatus('connected');
      }
    };

    socket.onerror = () => {
      setObsStatus('error');
    };

    socket.onclose = () => {
      identifiedRef.current = false;
      setObsStatus('disconnected');
    };
  }

  function disconnectOBS() {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }

  async function generateAuth(password, salt, challenge) {
    const encoder = new TextEncoder();

    const secret = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(password + salt)
    );

    const secretBase64 = btoa(
      String.fromCharCode(...new Uint8Array(secret))
    );

    const auth = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(secretBase64 + challenge)
    );

    return btoa(String.fromCharCode(...new Uint8Array(auth)));
  }

  function toggleMute() {
    if (!identifiedRef.current) return;

    const newState = !isMuted;
    setIsMuted(newState);

    socketRef.current.send(
      JSON.stringify({
        op: 6,
        d: {
          requestType: 'SetInputMute',
          requestId: 'toggleMute',
          requestData: {
            inputName: SOURCE_NAME,
            inputMuted: newState,
          },
        },
      })
    );
  }

  return (
    <div className="settings-screen">
      <div className="settings-screen__section">
        <h3 className="settings-screen__subtitle">Номер стола</h3>
        <select
          className="settings-screen__table-select"
          value={tableNumber}
          onChange={handleTableNumberChange}
        >
          {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={String(num)}>
              Стол {num}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-screen__section">
        <h3 className="settings-screen__subtitle">Опции</h3>

        <label className="settings-screen__option">
          <input
            type="checkbox"
            checked={useOBS === 'true'}
            onChange={toggleOBS}
          />
          <span>Использовать OBS</span>
        </label>

        {useOBS === 'true' && (
          <div style={{ marginLeft: 20 }}>
            <div className="settings-screen__obs-address">
              <label>
                Адрес OBS WebSocket:
                <input
                  type="text"
                  value={obsAddress}
                  onChange={handleObsAddressChange}
                  className="settings-screen__input"
                />
              </label>
            </div>
            <p>Статус OBS: {obsStatus}</p>
            <button onClick={toggleMute}>
              {isMuted ? 'Включить звук' : 'Выключить звук'}
            </button>
          </div>
        )}

        <label className="settings-screen__option">
          <input
            type="checkbox"
            checked={showTimer === 'true'}
            onChange={toggleTimer}
          />
          <span>Показывать таймер</span>
        </label>
      </div>

      <div className="settings-screen__section">
        <div className="settings-screen__header">
          <h2 className="settings-screen__title">Участники турнира</h2>
          <button
            type="button"
            className="settings-screen__refresh"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? 'Загрузка…' : 'Обновить'}
          </button>
        </div>

        {error && <p className="settings-screen__error">{error}</p>}

        <ul className="tournament-list">
          {tournamentPlayers.map((nick, index) => (
            <li key={index} className="tournament-list__item">
              <span className="tournament-list__number">
                {index + 1}
              </span>
              <span className="tournament-list__value">
                {nick || '—'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SettingsScreen;