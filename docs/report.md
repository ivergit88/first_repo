# Финальный отчет по проекту Safe Notes

## 1. Описание системы

Safe Notes - небольшое веб-приложение для создания, просмотра, завершения и удаления заметок. Проект демонстрирует полный минимальный цикл разработки: идея, реализация, CI, контейнеризация, тесты, SAST, SCA и документация.

## 2. Архитектура

```text
public/index.html + public/app.js
        |
        | HTTP fetch
        v
src/server.js  ->  src/notes.js
        |
        v
src/storage.js -> .data/notes.json
```

- `src/server.js`: HTTP routing, static files, JSON API, security headers.
- `src/notes.js`: чистая бизнес-логика и валидация.
- `src/storage.js`: атомарная запись JSON-файла через temporary file + rename.
- `public/*`: frontend без опасного `innerHTML`.

## 3. Запуск

Локально:

```bash
npm install
npm start
```

Docker:

```bash
docker build -t safe-notes:local .
docker run --rm -p 3000:3000 -v safe-notes-data:/app/.data safe-notes:local
```

## 4. Тестирование

- Unit-тесты покрывают валидацию и операции над заметками.
- Functional-тесты поднимают HTTP server и проверяют реальные API-запросы.
- Команда: `npm test`.
- CI запускает тесты на PR и push.

## 5. CI и quality gate

Workflow `.github/workflows/ci.yml` включает:

- lint;
- format check;
- build check;
- tests;
- Docker build;
- Semgrep SAST;
- Trivy SCA/SBOM и vulnerability scan.

При ошибке любой job PR считается непрошедшим quality gate.

## 6. Безопасность

Реализовано:

- входная валидация и лимит тела запроса 16 KiB;
- `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`;
- запрет path traversal при отдаче static files;
- отсутствие runtime npm-зависимостей;
- Semgrep rules для XSS/eval/secrets/child_process;
- Trivy SCA и CycloneDX SBOM.

## 7. Выводы

Проект готов к передаче другому разработчику: есть README, инструкции запуска, тесты, CI, Dockerfile, security-документация и финальный отчет. Следующие технические улучшения - авторизация, SQLite/PostgreSQL, rate limiting и e2e-тесты.
