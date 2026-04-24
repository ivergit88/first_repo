# Docker-инструкция

## Сборка

```bash
docker build -t safe-notes:local .
```

## Запуск

```bash
docker run --rm -p 3000:3000 -v safe-notes-data:/app/.data safe-notes:local
```

Приложение будет доступно на <http://localhost:3000>.

## Почему Dockerfile считается минимизированным

- Используется `node:22-alpine` вместо полного Debian-образа.
- `npm ci --omit=dev` оставляет только production-зависимости.
- В runtime-слой копируются только `src`, `public`, `package*.json` и `node_modules`.
- Приложение запускается не от root, а от пользователя `app`.
- Добавлен `HEALTHCHECK` для воспроизводимой проверки контейнера.
