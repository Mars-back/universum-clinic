# Universum Clinic

Мінімальний API обліку пацієнтів: додати пацієнта, лікаря та прийом,
переглянути їхні списки. SQLite зберігає дані у data/clinic.db.
База створюється з JavaScript автоматично; пароль і окремий сервер БД не потрібні.

Шлях запиту:
routes → controllers → services → repositories → database.
Для трьох пов'язаних таблиць використано один модуль clinic.

## Запуск

Потрібен Node.js 22 (від 22.13.0) або 24. Команди виконуються з кореня проєкту:

```powershell
npm.cmd ci
npm.cmd start
```

Сервер: http://127.0.0.1:3000. Режим розробки: npm.cmd run dev.

## Три таблиці

| Таблиця      | Поля                            | Призначення |
| ------------ | ------------------------------- | ----------- |
| patients     | id, name, phone                 | Пацієнти    |
| doctors      | id, name, specialization        | Лікарі      |
| appointments | id, patient_id, doctor_id, date | Прийоми     |

Один пацієнт і один лікар можуть мати багато прийомів.
У прийому є тільки дата YYYY-MM-DD. Функції — створення та список.

## API

| Метод | Адреса            | Дані запиту                                        |
| ----- | ----------------- | -------------------------------------------------- |
| GET   | /api/patients     | Список пацієнтів                                   |
| POST  | /api/patients     | {"name":"Олена Петренко","phone":"0501234567"}     |
| GET   | /api/doctors      | Список лікарів                                     |
| POST  | /api/doctors      | {"name":"Іван Коваль","specialization":"Терапевт"} |
| GET   | /api/appointments | Список прийомів                                    |
| POST  | /api/appointments | {"patientId":1,"doctorId":1,"date":"2026-11-01"}   |
| GET   | /health           | Перевірка роботи сервера                           |
| GET   | /version          | SHA коміту на момент запуску                       |

Успішне створення — HTTP 201, список — 200, неправильне введення — 400.
Після зміни коміту перезапусти сервер, щоб /version показував новий SHA.

Приклад додавання пацієнта у PowerShell:

```powershell
$body = '{"name":"Olena Petrenko","phone":"0501234567"}'
Invoke-RestMethod http://127.0.0.1:3000/api/patients -Method Post -ContentType 'application/json' -Body $body
Invoke-RestMethod http://127.0.0.1:3000/api/patients
```

## Де виконано вимоги завдання 1

| Вимога                   | Де                                              | Що це дає                                        |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------ |
| Ідея, запуск, пакети     | README.md, package.json, package-lock.json      | Зрозумілий і відтворюваний проєкт                |
| Стиль, форматтер, лінтер | .prettierrc.json, eslint.config.js              | Однакове оформлення та пошук помилок             |
| Hooks commit/push        | .husky/pre-commit, .husky/pre-push              | Автоматичний npm run check                       |
| Smoke і тести            | scripts/smoke-test.js, tests/clinic.test.js     | Реальний HTTP та перевірка SQLite                |
| Перевірка синтаксису     | package.json: build                             | Перевірка синтаксису server.js                   |
| Власні стандарти         | standards/quality-checks.md                     | Формат spec/ADR, стиль і перелік перевірок       |
| Специфікація             | standards/spec.md                               | Модулі, таблиці, зв'язки та сценарії             |
| ADR і DoD                | standards/adr/, standards/definition-of-done.md | Обґрунтування рішення й ознаки готовності        |
| Аудит                    | standards/architecture-audit.md                 | Відповідність структури та перевірка залежностей |
| Захист і здача           | Окремий документ DEFENSE                        | Результати перевірок, SHA та посилання на PR     |

npm.cmd run check: формат → ESLint → build → smoke → тести.
За наявності GNU Make команда make check запускає той самий конвеєр. CI у .github/workflows/ci.yml
виконує його на GitHub після push/PR.
