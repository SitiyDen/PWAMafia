/**
 * Google Apps Script для обновления данных в Google Sheets
 * 
 * Как развернуть:
 * 1. Откройте https://script.google.com
 * 2. Создайте новый проект
 * 3. Скопируйте этот код в редактор
 * 4. Нажимите Deploy -> New Deployment -> Web app
 * 5. Выберите "Execute as" - ваш аккаунт
 * 6. Выберите "Who has access" - Anyone
 * 7. Скопируйте URL и вставьте в .env как VITE_APPS_SCRIPT_URL
 */

function doPost(e) {
  try {
    const data = e.parameter;
    
    if (data.action === 'updatePlayerName') {
      updatePlayerName(
        data.spreadsheetId,
        Number(data.tableNumber),
        Number(data.playerNumber),
        data.playerName
      );
      
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: 'Имя игрока успешно обновлено'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'updatePlayerRole') {
      updatePlayerRole(
        data.spreadsheetId,
        Number(data.tableNumber),
        Number(data.playerNumber),
        data.playerRole
      );
      
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: 'Роль игрока успешно обновлена'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'updatePlayerState') {
      updatePlayerState(
        data.spreadsheetId,
        Number(data.tableNumber),
        Number(data.playerNumber),
        data.playerState
      );
      
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: 'Состояние игрока успешно обновлено'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'resetGame') {
      resetGame(
        data.spreadsheetId,
        Number(data.tableNumber)
      );
      
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: 'Игра сброшена в таблице'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'syncShotsAndVotes') {
      syncShotsAndVotes(
        data.spreadsheetId,
        Number(data.tableNumber),
        JSON.parse(data.shots || '[]'),
        JSON.parse(data.votes || '[]')
      );
      
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: 'Отстрелы и голосования синхронизированы'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'syncEvents') {
      syncEvents(
        data.spreadsheetId,
        Number(data.tableNumber),
        JSON.parse(data.rows || '[]')
      );
      
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: 'События синхронизированы'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'updateEventCell') {
      updateEventCell(
        data.spreadsheetId,
        Number(data.tableNumber),
        Number(data.rowIdx),
        Number(data.cellIdx),
        data.value
      );
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: 'Ячейка события обновлена'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'loadTableData') {
      const tableData = loadTableData(
        data.spreadsheetId,
        Number(data.tableNumber)
      );
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          data: tableData
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'updateGameNumber') {
      updateGameNumber(
        data.spreadsheetId,
        Number(data.tableNumber),
        data.gameNumber
      );
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: 'Номер игры обновлен'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: 'Неизвестное действие'
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Обновляет имя игрока в указанном листе
 * @param {string} spreadsheetId ID таблицы
 * @param {number} tableNumber Номер стола (1, 2, 3...)
 * @param {number} playerNumber Номер игрока (1-10)
 * @param {string} playerName Имя игрока
 */
function updatePlayerName(spreadsheetId, tableNumber, playerNumber, playerName) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  
  // Лист называется "Стол1", "Стол2" и т.д.
  const sheetName = `Стол${tableNumber}`;
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  // Если листа нет, создаем его
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  // Игроки расположены в колонке A, строки 2-11 (A2 для игрока 1)
  // playerNumber: 1 -> строка 2, 2 -> строка 3, и т.д.
  const row = playerNumber + 1;
  const column = 1; // колонка A
  
  sheet.getRange(row, column).setValue(playerName);
}

/**
 * Обновляет Роль игрока в указанном листе
 * @param {string} spreadsheetId ID таблицы
 * @param {number} tableNumber Номер стола (1, 2, 3...)
 * @param {number} playerNumber Номер игрока (1-10)
 * @param {string} playerState Состояние игрока
 */
function updatePlayerRole(spreadsheetId, tableNumber, playerNumber, playerRole) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  
  // Лист называется "Стол1", "Стол2" и т.д.
  const sheetName = `Стол${tableNumber}`;
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  // Если листа нет, создаем его
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  // Состояния расположены в колонке B, строки 2-11 (B2 для игрока 1)
  // playerNumber: 1 -> строка 2, 2 -> строка 3, и т.д.
  const row = playerNumber + 1;
  const column = 2; // колонка B
  
  sheet.getRange(row, column).setValue(playerRole);
}

/**
 * Обновляет состояние игрока в указанном листе
 * @param {string} spreadsheetId ID таблицы
 * @param {number} tableNumber Номер стола (1, 2, 3...)
 * @param {number} playerNumber Номер игрока (1-10)
 * @param {string} playerState Состояние игрока
 */
function updatePlayerState(spreadsheetId, tableNumber, playerNumber, playerState) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  
  // Лист называется "Стол1", "Стол2" и т.д.
  const sheetName = `Стол${tableNumber}`;
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  // Если листа нет, создаем его
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  // Состояния расположены в колонке C, строки 2-11 (C2 для игрока 1)
  // playerNumber: 1 -> строка 2, 2 -> строка 3, и т.д.
  const row = playerNumber + 1;
  const column = 3; // колонка C
  
  sheet.getRange(row, column).setValue(playerState);
}

/**
 * Для тестирования функций (откройте Applications Script -> Run)
 */
function resetGame(spreadsheetId, tableNumber) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheetName = `Стол${tableNumber}`;
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  // clear ranges
  const clearRanges = [
    'A2:A11',
    'E2:E11',
    'F2:F11',
    'G2:G11',
    'H2:H11',
    'I2:I3',
  ];
  clearRanges.forEach(r => sheet.getRange(r).clearContent());
  
  // set default roles (B2:B11) and states (C2:C11)
  const roleRange = sheet.getRange('B2:B11');
  const stateRange = sheet.getRange('C2:C11');

  roleRange.setValues(Array(10).fill(['Мирный']));
  stateRange.setValues(Array(10).fill(['В игре']));
}

/**
 * Синхронизирует данные отстрелов и голосований в Google Sheets
 * @param {string} spreadsheetId ID таблицы
 * @param {number} tableNumber Номер стола (1, 2, 3...)
 * @param {string[]} shots Массив ID игроков из отстрелов (E2:E11)
 * @param {string[]} votes Массив ID игроков из голосований (F2:F11)
 */
function syncShotsAndVotes(spreadsheetId, tableNumber, shots, votes) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheetName = `Стол${tableNumber}`;
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  // Prepare data for sheets (need to be 2D arrays)
  // Pad arrays to 10 elements to fill E2:E11 and F2:F11
  const paddedShots = shots.slice(0, 10).concat(Array(Math.max(0, 10 - shots.length)).fill(''));
  const paddedVotes = votes.slice(0, 10).concat(Array(Math.max(0, 10 - votes.length)).fill(''));
  
  const shotsData = paddedShots.map(s => [s || '']);
  const votesData = paddedVotes.map(v => [v || '']);
  
  const shotsRange = sheet.getRange('E2:E11');
  const votesRange = sheet.getRange('F2:F11');
  
  shotsRange.setValues(shotsData);
  votesRange.setValues(votesData);
}

function syncEvents(spreadsheetId, tableNumber, rows) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheetName = `Стол${tableNumber}`;
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  // rows[0] best move → I2-I4 (3 cells)
  const bestMove = rows[0] || [];
  const bestMoveRange = sheet.getRange('I2:I4');
  bestMoveRange.setValues(
    Array(3)
      .fill(0)
      .map((_, i) => [bestMove[i] || ''])
  );

  // rows[1] don checks → G2-G8 (7 cells)
  const don = rows[1] || [];
  const donRange = sheet.getRange('G2:G8');
  donRange.setValues(
    Array(7)
      .fill(0)
      .map((_, i) => [don[i] || ''])
  );

  // rows[2] sheriff checks → H2-H8
  const sheriff = rows[2] || [];
  const sheriffRange = sheet.getRange('H2:H8');
  sheriffRange.setValues(
    Array(7)
      .fill(0)
      .map((_, i) => [sheriff[i] || ''])
  );

  // rows[3] shots → E2-E8
  const shots = rows[3] || [];
  const shotsRange = sheet.getRange('E2:E8');
  shotsRange.setValues(
    Array(7)
      .fill(0)
      .map((_, i) => [shots[i] || ''])
  );

  // rows[4] votes → F2-F8
  const votes = rows[4] || [];
  const votesRange = sheet.getRange('F2:F8');
  votesRange.setValues(
    Array(7)
      .fill(0)
      .map((_, i) => [votes[i] || ''])
  );
}

/**
 * Обновляет одну ячейку из таблицы событий.
 * Поддерживает строки:
 * 0 – лучший ход (I2‥I4)
 * 1 – проверки Дона (G2‥G8)
 * 2 – проверки Шерифа (H2‥H8)
 * 3 – отстрелы (E2‥E8)
 * 4 – голосование (F2‥F8)
 */
function updateEventCell(spreadsheetId, tableNumber, rowIdx, cellIdx, value) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheetName = `Стол${tableNumber}`;
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  const address = getEventCellAddress(rowIdx, cellIdx);
  if (!address) return;

  sheet.getRange(address).setValue(value || '');
}

function getEventCellAddress(rowIdx, cellIdx) {
  switch (rowIdx) {
    case 0:
      return `I${2 + cellIdx}`;
    case 1:
      return `G${2 + cellIdx}`;
    case 2:
      return `H${2 + cellIdx}`;
    case 3:
      return `E${2 + cellIdx}`;
    case 4:
      return `F${2 + cellIdx}`;
    default:
      return null;
  }
}

/**
 * Загружает все данные стола из Google Sheets
 * @param {string} spreadsheetId ID таблицы
 * @param {number} tableNumber Номер стола
 * @returns {object} Объект с данными стола
 */
function loadTableData(spreadsheetId, tableNumber) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheetName = `Стол${tableNumber}`;
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    // Если листа нет, возвращаем пустые данные
    return {
      players: Array(10).fill(null).map((_, i) => ({
        id: i + 1,
        name: '',
        role: 'Мирный',
        state: 'В игре'
      })),
      events: {
        rows: [
          Array(3).fill(''), // лучший ход
          Array(7).fill(''), // дон
          Array(7).fill(''), // шериф
          Array(7).fill(''), // отстрелы
          Array(7).fill('')  // голосование
        ]
      }
    };
  }

  // Загружаем игроков A2:A11, B2:B11, C2:C11
  const namesRange = sheet.getRange('A2:A11').getValues().flat();
  const rolesRange = sheet.getRange('B2:B11').getValues().flat();
  const statesRange = sheet.getRange('C2:C11').getValues().flat();

  const players = namesRange.map((name, i) => ({
    id: i + 1,
    name: name || '',
    role: rolesRange[i] || 'Мирный',
    state: statesRange[i] || 'В игре'
  }));

  // Загружаем события
  const bestMove = sheet.getRange('I2:I4').getValues().flat().map(v => v || '');
  const donChecks = sheet.getRange('G2:G8').getValues().flat().map(v => v || '');
  const sheriffChecks = sheet.getRange('H2:H8').getValues().flat().map(v => v || '');
  const shots = sheet.getRange('E2:E8').getValues().flat().map(v => v || '');
  const votes = sheet.getRange('F2:F8').getValues().flat().map(v => v || '');

  const events = {
    rows: [bestMove, donChecks, sheriffChecks, shots, votes]
  };

  return { players, events };
}

/**
 * Обновляет номер игры в Google Sheets (ячейка B14)
 * @param {string} spreadsheetId ID таблицы
 * @param {number} tableNumber Номер стола (1, 2, 3...)
 * @param {string|number} gameNumber Номер игры
 */
function updateGameNumber(spreadsheetId, tableNumber, gameNumber) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheetName = `Стол${tableNumber}`;
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  // Ячейка B14 для номера игры
  sheet.getRange('B14').setValue(gameNumber);
}

/**
 * Для тестирования функций (откройте Applications Script -> Run)
 */
function test() {
  updatePlayerName(
    '1NLKHHpv4zLpLar6qguEFE_Zo9dt2sJDmQrpo4wVB-Vg',
    1,
    1,
    'Тестовый Игрок'
  );
  updatePlayerRole(
    '1NLKHHpv4zLpLar6qguEFE_Zo9dt2sJDmQrpo4wVB-Vg',
    1,
    1,
    'Мафия'
  );
  updatePlayerState(
    '1NLKHHpv4zLpLar6qguEFE_Zo9dt2sJDmQrpo4wVB-Vg',
    1,
    1,
    'В игре'
  );
  resetGame(
    '1NLKHHpv4zLpLar6qguEFE_Zo9dt2sJDmQrpo4wVB-Vg',
    1
  );
}
