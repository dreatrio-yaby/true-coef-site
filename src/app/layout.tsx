import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "./providers"
import { StructuredData } from "@/components/StructuredData"
import { GoogleAnalytics } from "@/components/GoogleAnalytics"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://coefly.ru'),
  title: {
    default: "Coefly — AI прогнозы и анализ футбольных матчей | Поиск выгодных ставок",
    template: "%s | Coefly"
  },
  description: "Сервис анализа футбольных матчей с помощью машинного обучения. Сравнивайте AI-прогнозы с коэффициентами букмекеров и находите выгодные ставки на футбол онлайн.",
  keywords: [
    "футбольные прогнозы",
    "AI ставки на футбол",
    "машинное обучение",
    "анализ коэффициентов",
    "выгодные ставки",
    "прогнозы на футбол",
    "букмекерские коэффициенты",
    "value betting",
    "сравнение букмекеров",
    "coefly"
  ],
  authors: [{ name: "Coefly" }],
  creator: "Coefly",
  publisher: "Coefly",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', type: 'image/svg+xml' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://coefly.ru',
    siteName: 'Coefly',
    title: 'Coefly — AI прогнозы и анализ футбольных матчей',
    description: 'Сервис анализа футбольных матчей с помощью машинного обучения. Сравнивайте AI-прогнозы с коэффициентами букмекеров.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Coefly - AI анализ футбольных матчей',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coefly — AI прогнозы на футбол',
    description: 'Сервис анализа футбольных матчей с помощью машинного обучения',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://coefly.ru',
  },
  verification: {
    // Добавьте коды верификации для Google Search Console и Yandex Webmaster
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <StructuredData />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}