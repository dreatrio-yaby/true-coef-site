# Деплой на Cloudflare Pages

Это руководство по переносу проекта с Vercel на Cloudflare Pages.

## Почему Cloudflare Pages?

- ✅ Отличный доступ из России
- ✅ Бесплатный тариф с щедрыми лимитами
- ✅ Автоматический деплой из Git
- ✅ Встроенный CDN
- ✅ Edge Functions для API routes
- ✅ Web Analytics (альтернатива Vercel Analytics)

## Подготовка проекта

### 1. Установка зависимостей

```bash
npm install --save-dev @cloudflare/next-on-pages wrangler
```

### 2. Файлы конфигурации

Уже созданы следующие файлы:

- `wrangler.toml` - основная конфигурация Cloudflare
- `_headers` - настройки HTTP заголовков
- `_redirects` - правила перенаправлений

### 3. Обновленные скрипты в package.json

- `npm run pages:build` - сборка для Cloudflare Pages
- `npm run pages:deploy` - деплой через CLI (опционально)
- `npm run pages:dev` - локальная разработка с Cloudflare окружением

## Деплой через Cloudflare Dashboard (рекомендуется)

### Шаг 1: Создание аккаунта

1. Перейдите на https://pages.cloudflare.com
2. Зарегистрируйтесь или войдите через GitHub

### Шаг 2: Подключение репозитория

1. Нажмите **"Create a project"**
2. Нажмите **"Connect to Git"**
3. Выберите ваш GitHub репозиторий: `true-coef-site`
4. Нажмите **"Begin setup"**

### Шаг 3: Настройка сборки

В настройках проекта укажите:

**Production branch**: `main`

**Build settings**:
- **Framework preset**: `Next.js`
- **Build command**: `npx @cloudflare/next-on-pages`
- **Build output directory**: `.vercel/output/static`

**Environment variables** (если есть):
- Добавьте все переменные окружения из Vercel
- Например: `NEXT_PUBLIC_API_URL`, секреты и т.д.

### Шаг 4: Деплой

1. Нажмите **"Save and Deploy"**
2. Cloudflare начнет сборку и деплой
3. Процесс займет 2-5 минут

### Шаг 5: Проверка

После успешного деплоя:
1. Вы получите URL вида: `https://true-coef-site.pages.dev`
2. Проверьте работу сайта
3. Проверьте API endpoints: `/api/matches`, `/api/sample-data`

## Настройка пользовательского домена

### Шаг 1: В Cloudflare Pages

1. Откройте ваш проект в Cloudflare Pages
2. Перейдите в **"Custom domains"**
3. Нажмите **"Set up a custom domain"**
4. Введите ваш домен: `coefly.ru`

### Шаг 2: Настройка DNS

Cloudflare предложит два варианта:

**Вариант A: Если DNS у вас уже на Cloudflare**
- Просто подтвердите - всё настроится автоматически

**Вариант B: Если DNS у другого провайдера**
1. Создайте CNAME запись:
   - Name: `@` (или `www`)
   - Content: `true-coef-site.pages.dev`
2. Или перенесите DNS на Cloudflare (рекомендуется)

### Шаг 3: SSL сертификат

- Cloudflare автоматически выпустит SSL сертификат
- Обычно это занимает 5-15 минут
- Ваш сайт будет доступен по HTTPS

## Настройка Web Analytics (опционально)

Cloudflare предоставляет бесплатную аналитику:

### Шаг 1: Включение аналитики

1. В панели Cloudflare Pages откройте ваш проект
2. Перейдите в **"Analytics"** → **"Web Analytics"**
3. Нажмите **"Enable Web Analytics"**
4. Скопируйте предоставленный скрипт

### Шаг 2: Добавление в проект

Добавьте скрипт аналитики в `src/app/layout.tsx`:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <StructuredData />
        {/* Cloudflare Web Analytics */}
        <script
          defer
          src='https://static.cloudflareinsights.com/beacon.min.js'
          data-cf-beacon='{"token": "ВАШ_ТОКЕН"}'
        />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
```

## Переменные окружения

Если у вас есть переменные окружения в Vercel:

### Шаг 1: Экспорт из Vercel

1. Откройте проект в Vercel
2. Settings → Environment Variables
3. Скопируйте все переменные

### Шаг 2: Импорт в Cloudflare

1. Откройте проект в Cloudflare Pages
2. Settings → Environment Variables
3. Добавьте переменные для Production и Preview окружений

**Важно**:
- Переменные с префиксом `NEXT_PUBLIC_` будут доступны в браузере
- Секретные ключи добавляйте только для серверных API routes

## CI/CD и автоматический деплой

После настройки каждый пуш в `main` ветку будет автоматически:
1. Собирать новую версию
2. Деплоить на production
3. Обновлять ваш сайт на `coefly.ru`

Pull requests автоматически получают preview URLs для тестирования.

## Откат к предыдущей версии

В Cloudflare Pages:
1. Откройте **"Deployments"**
2. Найдите нужную версию
3. Нажмите **"Rollback to this deployment"**

Откат происходит мгновенно!

## Отличия от Vercel

### Что работает одинаково:
- ✅ Next.js App Router
- ✅ API Routes
- ✅ Server Components
- ✅ Static Generation
- ✅ Автоматический деплой из Git
- ✅ Preview deployments

### Особенности Cloudflare:
- 🔧 Используется адаптер `@cloudflare/next-on-pages`
- 🔧 Edge Runtime вместо Node.js Runtime
- 🔧 Некоторые Node.js модули могут требовать полифиллов

### Что изменено в проекте:
- ❌ Удален `@vercel/analytics` (используйте Cloudflare Web Analytics)
- ✅ Добавлены файлы `_headers` и `_redirects`
- ✅ Добавлен `wrangler.toml`
- ✅ Обновлены скрипты в `package.json`

## Проверка совместимости

Ваш проект использует:
- ✅ Next.js 14 - полностью поддерживается
- ✅ React Query - работает без изменений
- ✅ TanStack Table - работает без изменений
- ✅ Tailwind CSS - работает без изменений
- ✅ Zustand - работает без изменений

**Все ваши текущие функции будут работать на Cloudflare Pages без изменений кода!**

## Локальная разработка с Cloudflare

Для тестирования в окружении близком к production:

```bash
# Обычная разработка (как раньше)
npm run dev

# Разработка с Cloudflare окружением
npm run pages:dev
```

## Деплой через CLI (альтернативный способ)

Если хотите деплоить вручную:

### Шаг 1: Авторизация

```bash
npx wrangler login
```

### Шаг 2: Сборка и деплой

```bash
npm run pages:deploy
```

## Мониторинг и логи

В Cloudflare Pages Dashboard:

- **Analytics**: Просмотр трафика и производительности
- **Deployments**: История всех деплоев
- **Functions**: Логи API routes (Edge Functions)
- **Real-time Logs**: Логи в реальном времени

## Troubleshooting

### Проблема: Сборка падает

**Решение**: Проверьте логи в Cloudflare Dashboard → Deployments → View build log

### Проблема: API routes не работают

**Решение**:
1. Убедитесь, что используется Edge Runtime
2. Проверьте, что нет Node.js специфичных модулей
3. Проверьте файл `_headers` для CORS настроек

### Проблема: Медленная загрузка данных из S3

**Решение**:
- Cloudflare автоматически кеширует статические файлы
- Настройки кеширования в `_headers` уже добавлены

## Поддержка

- **Документация**: https://developers.cloudflare.com/pages/
- **Next.js на Cloudflare**: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- **Community Discord**: https://discord.cloudflare.com

## Следующие шаги после деплоя

1. ✅ Проверить работу всех страниц
2. ✅ Проверить API endpoints
3. ✅ Настроить Web Analytics
4. ✅ Обновить DNS на домен
5. ✅ Обновить ссылки в документации/README
6. ✅ Удалить проект из Vercel (если больше не нужен)

Готово! Ваш сайт теперь работает на Cloudflare Pages с отличной доступностью из России! 🚀
