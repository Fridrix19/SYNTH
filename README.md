# SYNTH

Статический фронт (HTML/CSS/JS) + данные из **PostgreSQL** через serverless API на [Vercel](https://vercel.com).

## Что ходит в БД

| API | Таблица | Фронт |
|-----|---------|--------|
| `GET /api/components` | `components` | каталог, конфигуратор |
| `GET /api/builds` | `ready_builds` | главная (блок сборок), вкладка «Готовые ПК» |

При недоступности API фронт падает на **`data/components.json`** и **`data/builds.json`** (офлайн / статика без сервера).

---

## Деплой на Vercel + работа только с БД

### 1. PostgreSQL

Создай облачную БД и возьми строку подключения:

- [Neon](https://neon.tech) (удобно, есть бесплатный тариф), или  
- **Vercel → Storage → Postgres / Neon** (интеграция в дашборде).

Строка вида:

```text
postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```

Для Neon обычно уже есть `sslmode=require` — оставь как есть.

### 2. Репозиторий и проект Vercel

1. Залей код в GitHub/GitLab/Bitbucket.
2. [Vercel](https://vercel.com) → **Add New Project** → импорт репозитория.
3. **Framework Preset:** Other (или оставь авто — для статики с `api/` подойдёт).
4. **Root Directory:** корень репо (где лежат `package.json`, `api/`, `index.html`).

### 3. Переменные окружения (обязательно)

В проекте Vercel → **Settings → Environment Variables** для **Production** (и при желании Preview):

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | полная строка подключения к PostgreSQL (с SSL) |

Без **`DATABASE_URL`** функции `/api/components` и `/api/builds` вернут ошибку; сайт откроется, но данные подтянутся только из JSON-файлов в репозитории.

Опционально (если снова включишь серверную почту): `WEB3FORMS_ACCESS_KEY` или SMTP — см. раздел ниже.

После добавления переменных сделай **Redeploy** последнего деплоя.

### 4. Таблицы и данные (один раз, с твоего ПК)

Миграции и сид **не выполняются на Vercel автоматически** — их запускают локально с **тем же** `DATABASE_URL`, что и в проде.

```bash
cd путь/к/проекту
npm install
```

Создай `.env` в корне:

```env
DATABASE_URL="postgresql://...?sslmode=require"
```

Применить схему и создать таблицы:

```bash
npx prisma migrate deploy
```

Залить данные из `data/components.json` и `data/builds.json`:

```bash
npm run db:seed
```

Проверь в Neon SQL Editor, что есть таблицы `components` и `ready_builds` и в них строки.

После смены схемы в репозитории снова: `migrate deploy` → при необходимости `db:seed` (сид сейчас делает `deleteMany` и заново наполняет — учти для продакшена).

### 5. Сборка на Vercel

В проекте уже есть:

- **`postinstall` / `vercel-build`:** `prisma generate` — на билде генерируется клиент под Linux (в `schema.prisma` указан **`rhel-openssl-3.0.x`** для serverless Vercel).
- Папка **`api/`** → serverless-функции `components`, `builds`, `contact`.

Отдельный «билд статики» не нужен: HTML/CSS/JS и папка `atribut/` уезжают как есть. Убедись, что картинки **закоммичены** в репо (или потом обнови URL в БД на CDN).

### 6. Проверка после деплоя

Открой:

- `https://ТВОЙ-ПРОЕКТ.vercel.app/api/components` — JSON с `cpu`, `gpu`, …  
- `https://ТВОЙ-ПРОЕКТ.vercel.app/api/builds` — массив сборок  

Если 500 — смотри **Vercel → Project → Logs** и проверь `DATABASE_URL` / миграции / сид.

---

## Локальная разработка

```bash
npm install
```

Скопируй `.env.example` в `.env` и укажи `DATABASE_URL` (или только для фронта без API — тогда используются JSON из `data/`).

API как на проде:

```bash
npx vercel dev
```

Откроется локальный сервер с маршрутами `/api/*` и теми же переменными из `.env`.

Без `vercel dev` запросы к `/api/...` с `file://` или простого Live Server не сработают — каталог подхватит `data/*.json`.

---

## Структура (кратко)

| Путь | Назначение |
|------|------------|
| `api/components.js` | GET: комплектующие из БД |
| `api/builds.js` | GET: готовые сборки из БД |
| `api/contact.js` | POST: почта (опционально) |
| `lib/prisma.js` | singleton Prisma Client |
| `prisma/schema.prisma` | модели `Component`, `ReadyBuild` |
| `prisma/seed.js` | импорт из `data/components.json` + `data/builds.json` |
| `js/components-api.js` | `fetchComponentsDb()`, `fetchBuildsDb()` |

---

## Обратная связь

Сейчас форма на главной может идти напрямую в **Web3Forms** (см. `index.html`). Серверный **`/api/contact`** остаётся для SMTP/Web3Forms с бэкенда — если нужен, задай переменные в Vercel (см. историю проекта или закомментированные подсказки в коде).

---

## Картинки

Пути в БД вроде `atribut/done_pc/...` — файлы должны быть в деплое или заменены на абсолютные URL. См. `data/IMAGES.md`.
