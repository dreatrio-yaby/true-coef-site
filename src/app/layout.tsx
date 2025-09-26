import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "./providers"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Coefly — сервис поиска выгодных футбольных ставок",
  description: "Анализ футбольных матчей с помощью машинного обучения для поиска выгодных ставок",
  keywords: ["футбол", "ставки", "машинное обучение", "коэффициенты", "прогнозы", "coefly"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}