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
