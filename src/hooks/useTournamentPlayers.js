import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getDefaultTournamentPlayers } from '../data/constants';
import { fetchTournamentPlayersFromSheets } from '../api/sheets';

/**
 * Хук для списка участников турнира.
 * Подгружает данные из Google Sheets, кэширует в localStorage.
 */
export function useTournamentPlayers() {
  const [tournamentPlayers, setTournamentPlayers] = useLocalStorage(
    'mafia-tournament-players',
    getDefaultTournamentPlayers()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshFromSheets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const players = await fetchTournamentPlayersFromSheets();
      if (players.length > 0) {
        setTournamentPlayers(players);
      }
    } catch (err) {
      setError(err.message || 'Не удалось загрузить список');
    } finally {
      setLoading(false);
    }
  }, [setTournamentPlayers]);

  // Убрали автоматическую загрузку при монтировании

  return {
    tournamentPlayers,
    setTournamentPlayers,
    loading,
    error,
    refresh: refreshFromSheets,
  };
}
