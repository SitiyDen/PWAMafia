# Чек-лист: Синхронизация с Google Sheets ✅

## Реализовано

### 1. ✅ Обновлены компоненты React
- [x] **PlayerRow.jsx** — добавлен импорт `updatePlayerNameInSheets` и вызов при выборе имени
- [x] **PlayerTable.jsx** — добавлен параметр `tableNumber` и передача в PlayerRow
- [x] **App.jsx** — использование `tableNumber` из localStorage (настройка Номер стола)
- [x] **SettingsScreen.jsx** — поле ввода адреса OBS WebSocket (из предыдущей задачи)

### 2. ✅ API для Google Sheets
- [x] **sheets.js** — добавлена функция `updatePlayerNameInSheets(tableNumber, playerNumber, playerName)`
- [x] Функция отправляет POST запрос на Google Apps Script
- [x] Безопасное обращение к переменной окружения `VITE_APPS_SCRIPT_URL`

### 3. ✅ Google Apps Script
- [x] **scripts/appsScript.gs** — готовый скрипт для развертывания
- [x] Функция `doPost(e)` — обработчик POST запросов
- [x] Функция `updatePlayerName()` — обновление данных в Sheets
- [x] Автоматическое создание листов "СтолX" если их нет

### 4. ✅ Конфигурация
- [x] **.env.local** — файл с переменной VITE_APPS_SCRIPT_URL (создан пустой)
- [x] **.env.example** — шаблон с инструкциями
- [x] **.gitignore** — добавлены .env файлы (не будут в git)

### 5. ✅ Документация
- [x] **README.md** — описание функции синхронизации и инструкции
- [x] **SETUP_GOOGLE_SHEETS.md** — подробное руководство по настройке
- [x] Комментарии в коде с объяснениями

## Как начать использовать

### Быстрая настройка (7 шагов)

1. Откройте https://script.google.com
2. Создайте новый проект
3. Скопируйте содержимое `scripts/appsScript.gs` в редактор
4. Deploy → New Deployment → Web app → Anyone has access
5. Скопируйте URL развернутого приложения
6. Вставьте URL в `.env.local`: `VITE_APPS_SCRIPT_URL=ваш_url`
7. Перезагрузите приложение

### Структура Google Sheets

```
Стол1 (лист)
├─ A1: Игрок (заголовок)
├─ A2: Имя игрока 1
├─ A3: Имя игрока 2
└─ A11: Имя игрока 10

Стол2 (лист)
├─ A2: Имя игрока 1
└─ ...

Стол3, Стол4... (и т.д.)
```

## Тестирование

1. **Локально:**
   - `npm run dev`
   - Перейдите в Настройки
   - Выберите "Номер стола = 1"
   - На вкладке Игра выберите имя игрока
   - Посмотрите DevTools → Console на ошибки

2. **В Google Sheets:**
   - Откройте вашу таблицу
   - Перейдите на лист "Стол1"
   - Проверьте, что имя появилось в колонке A

3. **Отключение:**
   - Если нет `VITE_APPS_SCRIPT_URL` — синхронизация отключена (ошибок не будет)

## Файлы, которые были изменены/созданы

```
Изменены:

### 6. ✅ События по ячейкам
- [x] **EventsScreen.jsx** — добавлен `updateEventCellInSheets` и логика вызова для каждой ячейки; третий элемент "Лучшего хода" отправляется только при вводе
- [x] **sheets.js** — новая функция `updateEventCellInSheets` для одного поля
- [x] **appsScript.gs** — обработка `updateEventCell`, новые утилиты `updateEventCell` и `getEventCellAddress`

├─ src/components/PlayerRow.jsx
├─ src/components/PlayerTable.jsx  
├─ src/App.jsx
├─ src/api/sheets.js
├─ README.md
└─ .gitignore

Созданы:
├─ scripts/appsScript.gs
├─ .env.local (пустой)
├─ .env.example (шаблон)
└─ SETUP_GOOGLE_SHEETS.md (руководство)
```

## Важно

⚠️ **Переменные окружения:**
- `VITE_APPS_SCRIPT_URL` должна быть в `.env.local`
- Файл `.env.local` НЕ коммитится в git (добавлен в .gitignore)
- Каждый разработчик должен создать свой `.env.local` с его Google Apps Script URL

⚠️ **Структура Google Sheets:**
- Листы должны называться **Стол1, Стол2, Стол3** и т.д.
- Игроки в колонке **A**, строки **2-11**
- Если листа нет — Google Apps Script создаст его автоматически

## Если что-то не работает

1. Проверьте консоль браузера (F12 → Console)
2. Проверьте логи Google Apps Script (https://script.google.com → Execution log)
3. Прочитайте SETUP_GOOGLE_SHEETS.md раздел "Отладка"
4. Убедитесь, что VITE_APPS_SCRIPT_URL заполнена в .env.local

## Следующие шаги (опционально)

- [ ] Добавить UI элемент для проверки статуса синхронизации
- [ ] Добавить кеширование для снижения количества запросов
- [ ] Добавить логирование всех обновлений
- [ ] Синхронизировать данные ролей и состояний (сейчас только имена)
