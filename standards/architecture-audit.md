# Аудит структури та залежностей

Routes імпортує controller, controller — service, service — repository,
repository — database. database не залежить від HTTP. Структура відповідає spec.
Для трьох таблиць достатньо одного clinic; окремі майбутні модулі не створено.

## Топ-3 перевірені кандидати залежностей

| Пакет          | Використання           | Висновок                                      |
| -------------- | ---------------------- | --------------------------------------------- |
| better-sqlite3 | src/config/database.js | Потрібний для файлової БД, runtime dependency |
| @eslint/js     | eslint.config.js       | Потрібні базові правила ESLint, devDependency |
| globals        | eslint.config.js       | Потрібні глобальні імена Node, devDependency  |

Зайвих або неправильно розміщених пакетів серед цих кандидатів не виявлено.
Express обслуговує HTTP. Husky, ESLint і Prettier використовуються для перевірок.
Окремі Jest/Supertest не додані: достатньо вбудованих node:test і fetch.

## Межі простого рішення

build — node --check src/server.js: окремого артефакту немає.
Smoke та API-тести додатково завантажують увесь ланцюжок імпортів.
Hooks перевіряють working tree; потрібно комітити всі підготовлені зміни разом.
Захист від часткового staging, авторизація та перевірка розкладу не реалізовані.
CI налаштовано; його успіх на GitHub можна підтвердити тільки після push.

Версію better-sqlite3 12.11.1 зафіксовано у package.json і package-lock.json.
Відтворюване встановлення залежностей перевіряється командою npm ci.
