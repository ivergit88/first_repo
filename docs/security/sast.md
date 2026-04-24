# Статический анализ безопасности (SAST)

## Инструменты

- Semgrep в GitHub Actions: job `semgrep sast`.
- Локальная совместимая проверка без внешних зависимостей: `npm run security:semgrep:local`.

## Правила

Файл `.semgrep.yml` содержит правила против:

- `innerHTML` assignment, потому что это типовой XSS-риск;
- `eval(...)`, потому что это выполнение произвольного кода;
- hardcoded secrets;
- `child_process` без отдельного security review.

## Найденные issues и исправления

На этапе разработки потенциальный XSS-риск был устранен архитектурно: frontend не использует `innerHTML`; все пользовательские данные выводятся через `textContent`. Backend валидирует длину и тип входных данных, а также отправляет CSP и другие security headers.

Итоговое состояние: локальная проверка `npm run security:semgrep:local` проходит, Semgrep в CI настроен как blocking job (`--error`).
