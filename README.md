# Bulls & Cows — TypeScript

Небольшая браузерная игра Bulls and Cows на TypeScript

## Запуск

Требуется Node.js 20+.

Откройте `index.html` через локальный сервер из корня проекта, например:

## Проверки

```bash
npm test
npm run lint
npm run format
```

## Git hooks

После `npm install` включите Husky:

```bash
npx husky
```

- `pre-commit` запускает только `lint-staged` (ESLint + Prettier для изменённых файлов).
- `pre-push` запускает `npm test`.

При первом коммите, когда тестов ещё нет, Vitest завершится успешно: в конфигурации по умолчанию отсутствие тестов не считается ошибкой.

## Структура

- `src/game.ts` — чистые функции игрового ядра, валидатор, генератор и мемоизированный подсчёт вариантов.
- `src/state.ts` — неизменяемые переходы состояния.
- `src/main.ts` — DOM/UI и обработчики событий.
- `tests/game.test.ts` — unit-тесты Vitest.
