# SEO Настройка для Coefly

## ✅ Выполнено

### 1. Метаданные (Metadata)
- ✅ Добавлены расширенные meta теги в `src/app/layout.tsx`
- ✅ Open Graph метаданные для соцсетей
- ✅ Twitter Card метаданные
- ✅ Canonical URLs для предотвращения дублирования
- ✅ Robots meta теги для правильной индексации
- ✅ Ключевые слова для SEO

### 2. Robots.txt
- ✅ Создан файл `public/robots.txt`
- ✅ Разрешена индексация всех страниц кроме API
- ✅ Указан sitemap
- ✅ Настроены правила для Yandex и Google

### 3. Sitemap.xml
- ✅ Создан динамический sitemap в `src/app/sitemap.ts`
- ✅ Автоматически генерируется Next.js
- ✅ Доступен по адресу: `https://coefly.ru/sitemap.xml`

### 4. Структурированные данные (Schema.org)
- ✅ Создан компонент `src/components/StructuredData.tsx`
- ✅ JSON-LD разметка для:
  - WebSite
  - Organization
  - WebApplication
- ✅ Интегрирован в root layout

## 📋 Дополнительные действия

### 1. Верификация в поисковых системах

#### Google Search Console
1. Перейдите на https://search.google.com/search-console
2. Добавьте сайт coefly.ru
3. Получите код верификации
4. Добавьте в `src/app/layout.tsx`:
```typescript
verification: {
  google: 'ваш-код-верификации',
}
```

#### Yandex Webmaster
1. Перейдите на https://webmaster.yandex.ru
2. Добавьте сайт coefly.ru
3. Получите код верификации
4. Добавьте в `src/app/layout.tsx`:
```typescript
verification: {
  yandex: 'ваш-код-верификации',
}
```

### 2. Open Graph изображение
- ⚠️ Необходимо создать изображение `public/og-image.png`
- Размер: 1200x630 пикселей
- Содержание: Логотип Coefly + краткое описание сервиса
- Можно использовать https://www.figma.com или https://www.canva.com

### 3. Favicon и иконки
Добавьте в папку `public/`:
- `favicon.ico` (основная иконка)
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

### 4. Google Analytics / Yandex Metrika

#### Google Analytics
1. Создайте аккаунт на https://analytics.google.com
2. Получите Measurement ID (GA4)
3. Установите пакет:
```bash
npm install @next/third-parties
```
4. Добавьте в `src/app/layout.tsx`:
```typescript
import { GoogleAnalytics } from '@next/third-parties/google'

// В body:
<GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

#### Yandex Metrika
1. Создайте счетчик на https://metrika.yandex.ru
2. Получите ID счетчика
3. Добавьте скрипт в `src/app/layout.tsx`:
```typescript
<Script id="yandex-metrika" strategy="afterInteractive">
  {`
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],
    k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    ym(XXXXXXXX, "init", {
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true
    });
  `}
</Script>
```

### 5. Проверка после деплоя

После деплоя проверьте:

1. **Robots.txt**: https://coefly.ru/robots.txt
2. **Sitemap**: https://coefly.ru/sitemap.xml
3. **Open Graph теги**:
   - https://www.opengraph.xyz
   - https://cards-dev.twitter.com/validator
4. **Структурированные данные**:
   - https://search.google.com/test/rich-results
   - https://validator.schema.org
5. **Производительность**:
   - https://pagespeed.web.dev
   - https://www.webpagetest.org

### 6. Регистрация в поисковых системах

После верификации отправьте sitemap:
- Google Search Console: Property → Sitemaps → Add sitemap
- Yandex Webmaster: Индексирование → Файлы Sitemap → Добавить

### 7. Улучшение контента (опционально)

Для лучшего SEO рассмотрите добавление:
- Страницу "О проекте" с описанием методологии
- FAQ секцию с ответами на популярные вопросы
- Блог с аналитикой и прогнозами
- Страницу "Как пользоваться"

### 8. Мониторинг позиций

Инструменты для отслеживания позиций:
- Google Search Console (бесплатно)
- Yandex Webmaster (бесплатно)
- Ahrefs, SEMrush (платно)
- Serpstat (платно, есть русская версия)

## 🎯 Ключевые метрики для отслеживания

1. **Органический трафик** (из Search Console/Metrika)
2. **Позиции по запросам**:
   - "прогнозы на футбол"
   - "AI ставки на футбол"
   - "выгодные ставки футбол"
   - "сравнение букмекеров"
3. **CTR** в поисковой выдаче
4. **Время на сайте** и **показатель отказов**
5. **Core Web Vitals** (скорость загрузки)

## 📱 Дополнительные рекомендации

1. **Мобильная версия**: Убедитесь что сайт корректно отображается на мобильных
2. **Скорость загрузки**: Оптимизируйте изображения и скрипты
3. **HTTPS**: Убедитесь что сайт работает по HTTPS
4. **Внутренняя перелинковка**: Добавьте ссылки между страницами
5. **Социальные сигналы**: Регулярно публикуйте контент в Telegram канале

## ✍️ Текущая SEO конфигурация

### Основные метаданные
- **Title**: "Coefly — AI прогнозы и анализ футбольных матчей | Поиск выгодных ставок"
- **Description**: "Сервис анализа футбольных матчей с помощью машинного обучения. Сравнивайте AI-прогнозы с коэффициентами букмекеров и находите выгодные ставки на футбол онлайн."
- **URL**: https://coefly.ru
- **Language**: ru-RU

### Ключевые слова
- футбольные прогнозы
- AI ставки на футбол
- машинное обучение
- анализ коэффициентов
- выгодные ставки
- прогнозы на футбол
- букмекерские коэффициенты
- value betting
- сравнение букмекеров
- coefly

---

**Дата создания**: 2025-10-11
**Версия Next.js**: 14.2.8
