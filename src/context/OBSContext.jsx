import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sha256 } from '../utils/sha256';

const OBSContext = createContext();

const OBS_PASSWORD = '123456';

export function OBSProvider({ children }) {
  const [useOBS, setUseOBS] = useLocalStorage('mafia-use-obs', 'false');
  const [obsAddress, setObsAddress] = useLocalStorage('mafia-obs-address', 'ws://localhost:4455');
  const [scene1Name, setScene1Name] = useLocalStorage('mafia-obs-scene1', 'Сцена 1');
  const [scene2Name, setScene2Name] = useLocalStorage('mafia-obs-scene2', 'Сцена 2');
  const [sourceName, setSourceName] = useLocalStorage(
    'mafia-obs-source',
    'Захват входного аудиопотока'
  );

  const [obsStatus, setObsStatus] = useState('disconnected');
  const [isMuted, setIsMuted] = useState(false);
  const [currentScene, setCurrentScene] = useState(null);

  const socketRef = useRef(null);
  const identifiedRef = useRef(null);
  const sourceNameRef = useRef(sourceName);

  // Источник звука можно менять "на лету" без переподключения к OBS —
  // держим актуальное имя в ref для использования внутри обработчика сокета,
  // и сразу запрашиваем состояние mute для нового источника.
  useEffect(() => {
    sourceNameRef.current = sourceName;
    if (identifiedRef.current) {
      requestMuteState(sourceName);
    }
  }, [sourceName]);

  useEffect(() => {
    if (useOBS !== 'true') {
      disconnectOBS();
      return;
    }

    connectOBS();

    return () => {
      disconnectOBS();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useOBS, obsAddress]);

  function connectOBS() {
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
          const response = await generateAuth(OBS_PASSWORD, auth.salt, auth.challenge);

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

        socket.send(
          JSON.stringify({
            op: 6,
            d: {
              requestType: 'GetCurrentProgramScene',
              requestId: 'getCurrentScene',
            },
          })
        );

        requestMuteState(sourceNameRef.current);
      }

      // Request response
      if (message.op === 7 && message.d.requestId === 'getCurrentScene') {
        const sceneName = message.d.responseData?.currentProgramSceneName;
        if (sceneName) setCurrentScene(sceneName);
      }

      if (message.op === 7 && message.d.requestId === 'getMute') {
        const muted = message.d.responseData?.inputMuted;
        if (typeof muted === 'boolean') setIsMuted(muted);
      }

      // Event (напр. смена сцены сделана из самого OBS)
      if (message.op === 5 && message.d.eventType === 'CurrentProgramSceneChanged') {
        setCurrentScene(message.d.eventData?.sceneName ?? null);
      }

      // Event (напр. звук замьютили прямо в OBS)
      if (message.op === 5 && message.d.eventType === 'InputMuteStateChanged') {
        if (message.d.eventData?.inputName === sourceNameRef.current) {
          setIsMuted(message.d.eventData.inputMuted);
        }
      }
    };

    socket.onerror = () => {
      setObsStatus('error');
    };

    socket.onclose = () => {
      identifiedRef.current = false;
      setObsStatus('disconnected');
      setCurrentScene(null);
    };
  }

  function requestMuteState(inputName) {
    if (!socketRef.current || !identifiedRef.current || !inputName) return;

    socketRef.current.send(
      JSON.stringify({
        op: 6,
        d: {
          requestType: 'GetInputMute',
          requestId: 'getMute',
          requestData: { inputName },
        },
      })
    );
  }

  function disconnectOBS() {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    identifiedRef.current = false;
  }

  function generateAuth(password, salt, challenge) {
    const encoder = new TextEncoder();

    const secret = sha256(encoder.encode(password + salt));
    const secretBase64 = btoa(String.fromCharCode(...secret));

    const auth = sha256(encoder.encode(secretBase64 + challenge));

    return btoa(String.fromCharCode(...auth));
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
            inputName: sourceNameRef.current,
            inputMuted: newState,
          },
        },
      })
    );
  }

  function switchScene(sceneName) {
    if (!identifiedRef.current || !sceneName) return;

    socketRef.current.send(
      JSON.stringify({
        op: 6,
        d: {
          requestType: 'SetCurrentProgramScene',
          requestId: 'switchScene',
          requestData: { sceneName },
        },
      })
    );

    // Оптимистично обновляем, событие CurrentProgramSceneChanged подтвердит смену
    setCurrentScene(sceneName);
  }

  const value = {
    obsEnabled: useOBS === 'true',
    setObsEnabled: (enabled) => setUseOBS(enabled ? 'true' : 'false'),
    obsAddress,
    setObsAddress,
    obsStatus,
    isMuted,
    toggleMute,
    currentScene,
    scene1Name,
    setScene1Name,
    scene2Name,
    setScene2Name,
    sourceName,
    setSourceName,
    switchScene,
  };

  return <OBSContext.Provider value={value}>{children}</OBSContext.Provider>;
}

export function useOBSContext() {
  const context = useContext(OBSContext);
  if (!context) {
    throw new Error('useOBSContext должен использоваться внутри OBSProvider');
  }
  return context;
}
