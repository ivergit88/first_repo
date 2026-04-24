# Safe Notes

Safe Notes - учебное веб-приложение для быстрых приватных заметок и небольших todo-списков. Проект выбран специально для курса по веб-разработке и безопасной поставке ПО: он достаточно маленький для ревью, но содержит frontend, backend, хранение данных, CI, Docker, тесты и security-проверки.

## Цель продукта

Дать пользователю простой локальный сервис, где можно:

- создавать короткие заметки с заголовком, текстом и цветовой меткой;
- отмечать заметки выполненными;
- фильтровать заметки по статусу;
- удалять заметки без ручного редактирования файлов;
- запускать проект одинаково локально, в CI и в контейнере.

## Функциональность MVP

- Web UI на HTML/CSS/JavaScript без тяжелого фреймворка.
- HTTP API на Node.js.
- JSON-хранилище в `.data/notes.json`.
- Валидация входных данных: длина, тип, допустимые значения.
- Безопасный вывод данных на странице через `textContent`, а не через `innerHTML`.
- Базовые security headers для всех ответов.
- Healthcheck endpoint `/health` для Docker и CI.

## Предполагаемая архитектура

```text
browser
  | fetch('/api/notes')
  v
Node.js HTTP server
  |-- src/server.js       routing, headers, static files
  |-- src/notes.js        бизнес-логика заметок
  |-- src/storage.js      чтение/запись JSON
  |-- public/             frontend
  `-- .data/notes.json    локальное состояние
```

## Стек

- Runtime: Node.js 22 LTS.
- Frontend: vanilla HTML/CSS/JavaScript.
- Backend: встроенный `node:http`, без runtime-зависимостей.
- Тесты: `node:test` и `node:assert`.
- CI: GitHub Actions.
- Контейнеризация: Docker multi-stage/minimal image на `node:22-alpine`.
- Security: Semgrep, Trivy/SBOM.

## Как запустить локально

```bash
npm install
npm start
```

Открыть: <http://localhost:3000>

Переменные окружения:

| Переменная | По умолчанию | Описание |
| --- | --- | --- |
| `PORT` | `3000` | порт HTTP-сервера |
| `DATA_DIR` | `.data` | директория для JSON-хранилища |
| `NODE_ENV` | `development` | режим запуска |

## Проверки качества

```bash
npm run lint
npm run format:check
npm test
npm run security:semgrep:local
```

## Docker

```bash
docker build -t safe-notes:local .
docker run --rm -p 3000:3000 -v safe-notes-data:/app/.data safe-notes:local
```

## Планы развития

1. Добавить авторизацию с безопасным хранением паролей.
2. Поддержать экспорт/импорт заметок.
3. Добавить полноценную БД SQLite/PostgreSQL.
4. Включить rate limiting для публичного API.
5. Добавить e2e-тесты через Playwright.

## Учтенный фидбек по ДЗ 1

- Уточнена цель продукта и пользовательские сценарии.
- Добавлена архитектурная схема и описание модулей.
- Добавлены команды запуска, проверки качества и планы развития.

Подробный журнал обсуждения: [`docs/feedback/readme-feedback.md`](docs/feedback/readme-feedback.md).
