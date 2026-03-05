import { createContext, useContext, useState, useEffect } from 'react';

const TableNumberContext = createContext();

export function TableNumberProvider({ children }) {
  const [tableNumber, setTableNumberState] = useState('1');

  // Инициализируем из localStorage при загрузке
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mafia-table-number');
      if (stored) setTableNumberState(stored);
    } catch {
      setTableNumberState('1');
    }
  }, []);

  // Сохраняем в localStorage при изменении
  const setTableNumber = (newValue) => {
    setTableNumberState(newValue);
    try {
      localStorage.setItem('mafia-table-number', newValue);
    } catch (error) {
      console.error('Error saving table number:', error);
    }
  };

  return (
    <TableNumberContext.Provider value={{ tableNumber, setTableNumber }}>
      {children}
    </TableNumberContext.Provider>
  );
}

export function useTableNumber() {
  const context = useContext(TableNumberContext);
  if (!context) {
    throw new Error('useTableNumber должен использоваться внутри TableNumberProvider');
  }
  return context;
}
