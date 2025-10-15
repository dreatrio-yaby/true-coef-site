export function StructuredData() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Coefly",
    "url": "https://coefly.ru",
    "description": "Сервис анализа футбольных матчей с помощью машинного обучения",
    "inLanguage": "ru-RU",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://coefly.ru/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Coefly",
    "url": "https://coefly.ru",
    "logo": "https://coefly.ru/logo.png",
    "description": "AI-сервис для анализа футбольных ставок",
    "sameAs": [
      "https://t.me/football_ai_odds"
    ]
  }

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Coefly",
    "url": "https://coefly.ru",
    "applicationCategory": "SportsApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "RUB"
    },
    "description": "Анализ футбольных матчей с помощью машинного обучения для поиска выгодных ставок",
    "screenshot": "https://coefly.ru/og-image.png",
    "featureList": [
      "AI прогнозы футбольных матчей",
      "Сравнение с коэффициентами букмекеров",
      "Анализ выгодных ставок",
      "Фильтрация по букмекерам и лигам",
      "Актуальные данные матчей"
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
    </>
  )
}
