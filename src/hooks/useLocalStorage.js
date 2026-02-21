import { useState, useCallback } from 'react';

/**
 * Хук для сохранения данных в localStorage с автоматической синхронизацией
 * @param {string} key - Ключ в localStorage
 * @param {any} initialValue - Начальное значение, если в storage пусто
 * @returns {[any, function]} - Текущее значение и функция обновления
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Ошибка чтения localStorage["${key}"]:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const valueToStore = typeof value === 'function' ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.warn(`Ошибка записи в localStorage["${key}"]:`, error);
        }
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
