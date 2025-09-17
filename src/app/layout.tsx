import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "./providers"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Football Stats AI - ML-powered betting odds predictions",
  description: "Анализ футбольных матчей с использованием машинного обучения для поиска выгодных ставок",
  keywords: ["футбол", "ставки", "машинное обучение", "коэффициенты", "прогнозы"],
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
      </body>
    </html>
  )
}