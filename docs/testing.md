# Тестирование

## Уровни тестов

1. **Unit-тесты** (`tests/notes.test.js`): проверяют бизнес-логику создания, валидации, переключения и удаления заметок.
2. **Functional API-тесты** (`tests/server.test.js`): поднимают реальный HTTP-сервер на случайном порту и проверяют `/health` и `/api/notes`.

## Запуск

```bash
npm test
```

## Интеграция в CI

Workflow `.github/workflows/ci.yml` запускает тесты на каждом push в `main` и на каждом Pull Request в `main`. Если тесты падают, job `checks` завершается с ошибкой и quality gate не проходит.
