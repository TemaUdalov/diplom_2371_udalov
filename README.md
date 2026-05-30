# HR-ассистент — AI-ассистент по подготовке откликов на вакансии

Веб-приложение, которое помогает соискателю адаптировать резюме под конкретную вакансию, пройти AI-интервью, получить оценку соответствия, сопроводительное письмо и рекомендации по улучшению отклика. Работает локально через Ollama или с любым OpenAI-совместимым облачным провайдером.

## Стек технологий

| Категория | Технологии |
|-----------|-----------|
| **Frontend / Backend** | Next.js 14 (App Router), TypeScript |
| **Стили** | Tailwind CSS (dark mode, class strategy) |
| **AI** | Ollama + qwen2.5:7b (локально) / DeepSeek / Groq / OpenAI |
| **RAG** | nomic-embed-text (Ollama), косинусное сходство эмбеддингов |
| **База данных** | PostgreSQL + Prisma ORM |
| **Авторизация** | NextAuth.js v4 (credentials, JWT) |
| **Безопасность** | bcryptjs (хеширование паролей, 12 раундов) |
| **Валидация** | Zod |
| **PDF-экспорт** | jsPDF |
| **UI-библиотеки** | Lucide React, clsx, tailwind-merge |

## Требования

- **Node.js** >= 18.17
- **npm** >= 9
- **PostgreSQL** >= 14
- **Ollama** — для локального запуска AI (рекомендуется)

## Установка и запуск

### 1. Клонировать репозиторий

```bash
git clone https://github.com/TemaUdalov/diplom_2371_udalov.git
cd diplom_2371_udalov
```

### 2. Установить зависимости

```bash
npm install
```

### 3. Установить PostgreSQL

Скачать с https://www.postgresql.org/download/ и установить.

Создать базу данных:

```bash
psql -U postgres -c "CREATE DATABASE hr_assistant;"
```

### 4. Настроить AI-провайдер

Приложение поддерживает несколько AI-провайдеров через единый OpenAI-совместимый интерфейс. По умолчанию используется Ollama.

#### Вариант 1: Ollama (рекомендуется — бесплатно, локально)

Установить Ollama: https://ollama.com/download

```bash
# Скачать основную модель
ollama pull qwen2.5:7b

# Создать кастомную модель hr-assistant на основе Modelfile из проекта
ollama create hr-assistant -f Modelfile

# Скачать модель для эмбеддингов (нужна для RAG)
ollama pull nomic-embed-text
```

#### Вариант 2: DeepSeek (бесплатные кредиты при регистрации)

Получить ключ на https://platform.deepseek.com

#### Вариант 3: Groq (бесплатный, быстрый)

Получить ключ на https://console.groq.com

#### Вариант 4: OpenAI (платный)

Получить ключ на https://platform.openai.com

### 5. Настроить переменные окружения

```bash
cp .env.local.example .env
```

Отредактировать `.env` — раскомментировать нужный провайдер:

```env
# База данных
DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/hr_assistant

# NextAuth (любая случайная строка от 32 символов)
NEXTAUTH_SECRET=любая_случайная_строка_от_32_символов
NEXTAUTH_URL=http://localhost:3000

# --- Вариант 1: Ollama (по умолчанию, ключ не нужен) ---
# OPENAI_API_KEY=ollama
# OPENAI_BASE_URL=http://localhost:11434/v1
# OPENAI_MODEL=hr-assistant
# Ollama должен быть запущен на http://localhost:11434

# --- Вариант 2: DeepSeek ---
# OPENAI_API_KEY=sk-ваш-ключ-deepseek
# OPENAI_BASE_URL=https://api.deepseek.com
# OPENAI_MODEL=deepseek-chat

# --- Вариант 4: OpenAI ---
# OPENAI_API_KEY=sk-ваш-ключ-openai
# OPENAI_MODEL=gpt-4o-mini
```

> **Важно:** если `OPENAI_API_KEY` не задан, приложение автоматически использует значение `"ollama"` и подключается к локальному Ollama на `http://localhost:11434`.

### 6. Применить миграции базы данных

```bash
npx prisma migrate dev --name init
```

### 7. (Опционально) Собрать базу знаний для RAG

RAG обогащает AI-интервью профессиональным контекстом из учебников по управлению карьерой. Требует запущенного Ollama с моделью `nomic-embed-text`.

Поместить PDF-файлы в корень проекта, затем:

```bash
npx tsx scripts/build-knowledge-base.ts
```

Скрипт создаст файл `data/knowledge-base.json`. Если файл отсутствует — приложение работает в штатном режиме без RAG-контекста (graceful degradation).

### 8. Запустить

```bash
npm run dev
```

Приложение доступно по адресу: **http://localhost:3000**

### 9. Сборка для продакшена

```bash
npm run build
npm start
```

## Структура проекта

```
Modelfile                          # Конфигурация кастомной модели hr-assistant для Ollama
prisma/
└── schema.prisma                  # Модели БД: User, GenerationSession, ChatMessage
scripts/
└── build-knowledge-base.ts        # Скрипт построения базы знаний (RAG)
src/
├── app/
│   ├── page.tsx                   # Главная страница (hero, features, статистика)
│   ├── layout.tsx                 # Root layout (ThemeProvider, SessionProvider)
│   ├── globals.css                # Глобальные стили
│   ├── login/page.tsx             # Страница входа
│   ├── register/page.tsx          # Страница регистрации
│   ├── dashboard/
│   │   ├── page.tsx               # Личный кабинет (список сессий)
│   │   └── [id]/page.tsx          # Просмотр сохранённой сессии
│   ├── workspace/
│   │   ├── page.tsx               # Рабочий экран (вакансия → режим → интервью → результат)
│   │   └── results-panel.tsx      # Панель результатов с вкладками
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts  # NextAuth handler
│       │   └── register/route.ts       # POST /api/auth/register
│       ├── analyze/route.ts       # POST /api/analyze — уточняющие вопросы (режим формы)
│       ├── chat/route.ts          # POST /api/chat — AI-интервью
│       ├── assess/route.ts        # POST /api/assess — оценка соответствия
│       ├── generate/route.ts      # POST /api/generate — резюме, письмо, советы
│       ├── resume/route.ts        # POST /api/resume — генерация текстового резюме
│       ├── stats/route.ts         # GET /api/stats — статистика (сессии, пользователи)
│       └── sessions/
│           ├── route.ts           # GET/POST /api/sessions
│           └── [id]/route.ts      # GET/DELETE /api/sessions/:id
├── components/
│   ├── ui/                        # Button, Card, Input, Textarea, Steps, CopyButton
│   ├── auth/                      # SessionProvider, UserMenu
│   ├── chat/                      # ChatBubble, ChatInput, TypingIndicator, QuickActions,
│   │                              # ProfileSummary, MatchScorePanel, InterviewProgress,
│   │                              # InterviewHint, ResumeModal
│   ├── theme-provider.tsx         # Dark/Light mode context (React Context, без сторонних библиотек)
│   └── theme-toggle.tsx           # Кнопка переключения темы
├── services/
│   ├── ai.ts                      # Генерация резюме, письма, рекомендаций; уточняющие вопросы
│   ├── chat.ts                    # AI-интервью, извлечение профиля кандидата, match score
│   ├── resume.ts                  # Генерация текстового резюме на клиенте (без AI)
│   └── chat-utils.ts              # Утилиты: прогресс профиля, подсказки, приветствие
├── lib/
│   ├── openai.ts                  # OpenAI-совместимый клиент (Ollama / DeepSeek / Groq / OpenAI)
│   ├── rag.ts                     # RAG-модуль: поиск по базе знаний через эмбеддинги
│   ├── prisma.ts                  # Клиент Prisma
│   ├── auth.ts                    # Конфигурация NextAuth
│   ├── get-user.ts                # Получение текущего пользователя на сервере
│   └── utils.ts                   # Утилита cn()
└── types/
    ├── index.ts                   # Все TypeScript-типы
    └── next-auth.d.ts             # Расширение типов NextAuth
```

## Функциональность

### AI-интервью
- Модель ведёт диалог с кандидатом, задавая вопросы по одному
- Вопросы адаптируются под вакансию и предыдущие ответы
- Параллельно с ответом выполняется извлечение структурированного профиля (11 полей) в JSON Mode
- Профиль обновляется в реальном времени в боковой панели
- Прогресс-бар заполненности профиля, контекстуальные подсказки
- При наличии базы знаний — RAG-обогащение промпта интервью профессиональным контекстом

### Два режима работы
- **AI-интервью** — модель ведёт диалог и собирает профиль кандидата (рекомендуется)
- **Классическая форма** — ручное заполнение полей с AI-уточняющими вопросами

### Генерация документов
- Адаптированное резюме с ключевыми словами из вакансии
- Персонализированное сопроводительное письмо от лица кандидата
- 5 конкретных рекомендаций по улучшению отклика
- Копирование в буфер обмена, экспорт в PDF

### Оценка соответствия
- Match score (0–100%)
- Сильные стороны кандидата
- Зоны роста
- Советы по улучшению резюме и сопроводительного письма

### Авторизация и личный кабинет
- Регистрация (имя, email, пароль — bcrypt, 12 раундов)
- Вход через NextAuth credentials provider, JWT-сессии
- Список сохранённых сессий с match score и датой создания (цветовое кодирование: зелёный 80%+, жёлтый 60–79%, красный < 60%)
- Просмотр и удаление сессий
- Защищённые API-маршруты с проверкой владельца ресурса

### Тёмная тема
- Переключатель в шапке, сохранение в localStorage
- По умолчанию — системная тема браузера

## База данных (Prisma)

### Модели

**User** — пользователи
- `id`, `name`, `email` (уникальный), `passwordHash`, `createdAt`, `updatedAt`

**GenerationSession** — сохранённые сессии генерации
- `id`, `userId` (FK → User, cascade delete), `title`, `jobDescription`, `candidateName`
- `adaptedResume`, `coverLetter`, `recommendations[]`
- `matchScore`, `matchStrengths[]`, `matchGaps[]`, `resumeTips[]`, `coverLetterTips[]`
- `profileData` (JSON), `createdAt`, `updatedAt`
- Индекс: `@@index([userId])`

**ChatMessage** — сообщения чата
- `id`, `sessionId` (FK → GenerationSession, cascade delete), `role`, `content`, `timestamp`
- Индекс: `@@index([sessionId])`

### Команды Prisma

```bash
npx prisma migrate dev --name описание   # Создать и применить миграцию
npx prisma generate                       # Сгенерировать клиент
npx prisma studio                         # Веб-интерфейс для просмотра данных
```

## AI-провайдеры

Приложение использует единый OpenAI-совместимый клиент. Провайдер выбирается через переменные окружения — код не меняется.

| Провайдер | OPENAI_BASE_URL | OPENAI_MODEL | Стоимость |
|-----------|-----------------|--------------|-----------|
| **Ollama (по умолчанию)** | не задаётся | `hr-assistant` | Бесплатно |
| DeepSeek | `https://api.deepseek.com` | `deepseek-chat` | Бесплатные кредиты |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | Бесплатно |
| OpenAI | не задаётся | `gpt-4o-mini` | Платно |

При использовании Ollama приложение обращается к `http://localhost:11434/v1`. Ollama должен быть запущен до старта приложения.

### Параметры запросов к модели

| Функция | Температура | Max tokens | Режим |
|---------|-------------|------------|-------|
| Ответ AI-ассистента в интервью | 0.5 | 500 | — |
| Извлечение профиля кандидата | 0 | 900 | JSON Mode |
| Редактирование резюме (polishText) | 0.3 | 600 | — |
| Редактирование письма (polishText) | 0.3 | 600 | — |
| Генерация рекомендаций | 0.5 | 300 | — |
| Оценка соответствия (match score) | 0.3 | — | JSON Mode |
| Уточняющие вопросы (режим формы) | 0.7 | 800 | JSON Mode |

> Генерация документов выполняется не одним, а тремя последовательными запросами к LLM: два вызова `polishText` (редактирование резюме и письма) и отдельный запрос на рекомендации. Контекстное окно модели — 4096 токенов (задаётся в Modelfile).

## RAG (база знаний)

Модуль `src/lib/rag.ts` обогащает AI-интервью контекстом из профессиональных учебников. Генерация финальных документов RAG-запросов не выполняет — на этом этапе используются заранее подготовленные шаблоны (`RESUME_TEMPLATE`, `COVER_LETTER_TEMPLATE`).

**Принцип работы:**
1. Скрипт `scripts/build-knowledge-base.ts` извлекает текст из PDF, разбивает на фрагменты по 800 символов (перекрытие 150 символов) и генерирует эмбеддинги через Ollama (`nomic-embed-text`, размерность 768)
2. В ходе AI-интервью запрос векторизуется и сравнивается с базой через косинусное сходство — возвращаются top-K релевантных фрагментов
3. Если база знаний недоступна — генерация продолжается без RAG-контекста (graceful degradation)

```bash
# Однократная сборка базы знаний (Ollama должен быть запущен)
ollama pull nomic-embed-text
npx tsx scripts/build-knowledge-base.ts
```

## Безопасность

- Пароли хешируются через bcrypt (12 раундов)
- JWT-сессии (NextAuth)
- Все защищённые API-маршруты проверяют `session.user.id === resource.userId` — данные одного пользователя недоступны другому
- API-ключи хранятся только в `.env` (не в коде)
- Валидация входных данных через Zod

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера (http://localhost:3000) |
| `npm run build` | Сборка для продакшена |
| `npm start` | Запуск продакшен-сервера |
| `npm run lint` | Проверка кода линтером |
| `npx prisma studio` | Веб-интерфейс БД |
| `npx prisma migrate dev` | Применить миграции |
| `npx tsx scripts/build-knowledge-base.ts` | Собрать базу знаний для RAG |
