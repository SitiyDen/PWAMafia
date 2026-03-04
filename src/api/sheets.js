/**
 * Загрузка списка игроков из Google Sheets
 * Таблица должна быть доступна по ссылке (Anyone with the link can view)
 */

const SHEET_ID = '1NLKHHpv4zLpLar6qguEFE_Zo9dt2sJDmQrpo4wVB-Vg';
const GID = '1484302407'; // Страница "Игроки"

const EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

/**
 * Парсит первую колонку из CSV (колонка A)
 * Строка 1 — заголовок, берём со строки 2
 */
function parseColumnAFromCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    let cell = '';
    if (line.startsWith('"')) {
      let j = 1;
      while (j < line.length) {
        if (line[j] === '"') {
          if (line[j + 1] === '"') {
            cell += '"';
            j += 2;
          } else {
            j++;
            break;
          }
        } else {
          cell += line[j++];
        }
      }
    } else {
      const commaIdx = line.indexOf(',');
      cell = commaIdx >= 0 ? line.slice(0, commaIdx) : line;
    }
    const trimmed = cell.trim();
    if (trimmed) result.push(trimmed);
  }
  return result.sort((a, b) => a.localeCompare(b, 'ru'));
}

/**
 * Загружает список игроков турнира из Google Sheets (колонка A, со 2-й строки)
 * @returns {Promise<string[]>} Массив ников
 * @throws {Error} При ошибке сети или доступа
 */
export async function fetchTournamentPlayersFromSheets() {
  const response = await fetch(EXPORT_URL, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`Ошибка загрузки: ${response.status}`);
  }
  const text = await response.text();
  const players = parseColumnAFromCSV(text);
  return players;
}

/**
 * Обновляет имя игрока в Google Sheets для указанного стола
 * 
 * ВАЖНО: Перед использованием нужно создать Google Apps Script Web App
 * 
 * Инструкция:
 * 1. Откройте https://script.google.com
 * 2. Создайте новый проект
 * 3. Замените код на код из /scripts/appsScript.gs
 * 4. Разверните как Web App (Deploy -> New deployment -> Web app)
 * 5. Скопируйте URL развернутого приложения
 * 6. Создайте файл .env с переменной VITE_APPS_SCRIPT_URL или используйте через константу
 * 
 * @param {number} tableNumber Номер стола (1, 2, 3...)
 * @param {number} playerNumber Номер игрока в таблице (1-10)
 * @param {string} playerName Имя игрока
 * @returns {Promise<void>}
 */
export async function updatePlayerNameInSheets(tableNumber, playerNumber, playerName) {
  // Получаем URL из переменных окружения или используем значение по умолчанию
  const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  
  if (!appsScriptUrl) {
    console.warn('VITE_APPS_SCRIPT_URL не настроен. Обновление Google Sheets отключено.');
    return;
  }

   try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      body: new URLSearchParams({
        action: 'updatePlayerName',
        tableNumber: tableNumber.toString(),
        playerNumber: playerNumber.toString(),
        playerName: playerName,
        spreadsheetId: SHEET_ID,
      }),
    });

    if (!response.ok) {
      console.error(`Ошибка обновления Google Sheets: ${response.status}`);
    }
  } catch (error) {
    console.error('Ошибка подключения к Google Apps Script:', error);
  }
}

/**
 * Обновляет роль игрока в Google Sheets для указанного стола
 * 
 * @param {number} tableNumber Номер стола (1, 2, 3...)
 * @param {number} playerNumber Номер игрока в таблице (1-10)
 * @param {string} playerRole Роль игрока
 * @returns {Promise<void>}
 */
export async function updatePlayerRoleInSheets(tableNumber, playerNumber, playerRole) {
  const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  
  if (!appsScriptUrl) {
    console.warn('VITE_APPS_SCRIPT_URL не настроен. Обновление Google Sheets отключено.');
    return;
  }

  try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      body: new URLSearchParams({
        action: 'updatePlayerRole',
        tableNumber: tableNumber.toString(),
        playerNumber: playerNumber.toString(),
        playerRole: playerRole,
        spreadsheetId: SHEET_ID,
      }),
    });

    if (!response.ok) {
      console.error(`Ошибка обновления Google Sheets: ${response.status}`);
    }
  } catch (error) {
    console.error('Ошибка подключения к Google Apps Script:', error);
  }
}

/**
 * Обновляет состояние игрока в Google Sheets для указанного стола
 * 
 * @param {number} tableNumber Номер стола (1, 2, 3...)
 * @param {number} playerNumber Номер игрока в таблице (1-10)
 * @param {string} playerState Состояние игрока
 * @returns {Promise<void>}
 */
export async function updatePlayerStateInSheets(tableNumber, playerNumber, playerState) {
  const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  
  if (!appsScriptUrl) {
    console.warn('VITE_APPS_SCRIPT_URL не настроен. Обновление Google Sheets отключено.');
    return;
  }

  try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      body: new URLSearchParams({
        action: 'updatePlayerState',
        tableNumber: tableNumber.toString(),
        playerNumber: playerNumber.toString(),
        playerState: playerState,
        spreadsheetId: SHEET_ID,
      }),
    });

    if (!response.ok) {
      console.error(`Ошибка обновления Google Sheets: ${response.status}`);
    }
  } catch (error) {
    console.error('Ошибка подключения к Google Apps Script:', error);
  }
}

/**
 * Синхронизирует данные отстрелов и голосований в Google Sheets
 * 
 * @param {number} tableNumber Номер стола (1, 2, 3...)
 * @param {string[]} shots Массив ID игроков из отстрелов (events.rows[3])
 * @param {string[]} votes Массив ID игроков из голосований (events.rows[4])
 * @returns {Promise<void>}
 */
export async function syncShotsAndVotesToSheets(tableNumber, shots, votes) {
  const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  
  if (!appsScriptUrl) {
    console.warn('VITE_APPS_SCRIPT_URL не настроен. Обновление Google Sheets отключено.');
    return;
  }

  try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      body: new URLSearchParams({
        action: 'syncShotsAndVotes',
        tableNumber: tableNumber.toString(),
        shots: JSON.stringify(shots),
        votes: JSON.stringify(votes),
        spreadsheetId: SHEET_ID,
      }),
    });

    if (!response.ok) {
      console.error(`Ошибка синхронизации отстрелов/голосований: ${response.status}`);
    }
  } catch (error) {
    console.error('Ошибка подключения к Google Apps Script:', error);
  }
}

/**
 * Синхронизирует все события (строки) в Google Sheets
 * @param {number} tableNumber Номер стола
 * @param {Array<Array<string>>} rows Массив строк событий (length 5)
 *   0: Лучший ход (3 элемента)
 *   1: Проверки Дона (7 элементов)
 *   2: Проверки Шерифа (7 элементов)
 *   3: Отстрелы (7 элементов)
 *   4: Голосование (7 элементов)
 */
export async function syncEventsToSheets(tableNumber, rows) {
  const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  
  if (!appsScriptUrl) {
    console.warn('VITE_APPS_SCRIPT_URL не настроен. Обновление Google Sheets отключено.');
    return;
  }

  try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      body: new URLSearchParams({
        action: 'syncEvents',
        tableNumber: tableNumber.toString(),
        rows: JSON.stringify(rows),
        spreadsheetId: SHEET_ID,
      }),
    });

    if (!response.ok) {
      console.error(`Ошибка синхронизации событий: ${response.status}`);
    }
  } catch (error) {
    console.error('Ошибка подключения к Google Apps Script при syncEvents:', error);
  }
}

/**
 * Сбрасывает данные игрока в Google Sheets для указанного стола
 * Удаляет значения в колонках A2-A11, E2-E11, F2-F11, G2-G11, H2-H11, I2-I3
 * Устанавливает по умолчанию роли «Мирный» (B) и состояние «В игре» (C)
 *
 * @param {number} tableNumber Номер стола
 * @returns {Promise<void>}
 */
export async function resetGameInSheets(tableNumber) {
  const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (!appsScriptUrl) {
    console.warn('VITE_APPS_SCRIPT_URL не настроен. Обновление Google Sheets отключено.');
    return;
  }

  try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      body: new URLSearchParams({
        action: 'resetGame',
        tableNumber: tableNumber.toString(),
        spreadsheetId: SHEET_ID,
      }),
    });

    if (!response.ok) {
      console.error(`Ошибка сброса Google Sheets: ${response.status}`);
    }
  } catch (error) {
    console.error('Ошибка подключения к Google Apps Script:', error);
  }
}
