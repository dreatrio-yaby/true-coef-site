'use client'

import { useMatches } from '@/hooks/useMatches'
import { FilterPanel } from '@/components/FilterPanel'
import { BetTypeSelector } from '@/components/BetTypeSelector'
import { BookmakerSelector } from '@/components/BookmakerSelector'
import { LeagueSelector } from '@/components/LeagueSelector'
import { MatchesTable } from '@/components/MatchesTable'
import { getAvailableBookmakers, getAvailableLeagues } from '@/lib/utils'
import { useMemo, useState } from 'react'

function HowItWorksModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="hidden sm:inline">Как это работает</span>
        <span className="sm:hidden">Справка</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Как это работает</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              <div className="text-sm text-gray-600 space-y-3">
                <p>С помощью машинного обучения получены вероятности исходов футбольных событий, они обозначены в таблице как AI, ниже указан коэффициент либо выбранного букмекера, либо того у кого самый выгодный коэффициент, выбрать это можно справа от основной таблицы. Выгодные ставки подсвечены зеленым, то есть те ставки у которых математическая вероятность выше, чем оценка у букмекера</p>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="font-medium mb-3">Примеры ставок:</h3>

                  <div className="space-y-4">
                    <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-medium text-lg">✅</span>
                        <div>
                          <div className="font-medium text-green-800 mb-2">Выгодная:</div>
                          <div className="text-sm space-y-1">
                            <div>- AI: 1.85 (54% вероятность)</div>
                            <div>- БК: 2.10 +13%</div>
                            <div className="text-green-700 italic">- Логика: ML-модель считает событие более вероятным чем букмекер</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 font-medium text-lg">❌</span>
                        <div>
                          <div className="font-medium text-red-800 mb-2">Невыгодная:</div>
                          <div className="text-sm space-y-1">
                            <div>- AI: 2.20 (45% вероятность)</div>
                            <div>- БК: 1.95</div>
                            <div className="text-red-700 italic">- Логика: Букмекер предлагает хуже коэффициент чем ML-прогноз</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function HomePage() {
  const { data: matches = [], isLoading, error } = useMatches()

  // Get available bookmakers and leagues from matches data
  const availableBookmakers = useMemo(() => {
    return Array.isArray(matches) ? getAvailableBookmakers(matches) : []
  }, [matches])

  const availableLeagues = useMemo(() => {
    return Array.isArray(matches) ? getAvailableLeagues(matches) : []
  }, [matches])

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-8">
          <div className="text-sm text-gray-500">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-8">
          <div className="text-sm text-red-500 mb-2">Ошибка загрузки</div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            Обновить
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 p-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-mono text-black">
            <span className="font-bold">Coefly</span><sup className="text-xs text-gray-500 ml-1">beta</sup>
          </h1>

          <div className="flex items-center gap-4">
            {/* How it works button */}
            <HowItWorksModal />

            {/* Telegram Channel Link */}
            <a
              href="https://t.me/football_ai_odds"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-950 rounded transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L9.876 13.63l-2.915-.918c-.633-.196-.646-.633.132-.936l11.36-4.378c.538-.196 1.006.128.834.823z"/>
              </svg>
              <span className="hidden sm:inline">Telegram канал</span>
              <span className="sm:hidden">TG</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-2 md:p-4">
        <FilterPanel />

        {/* Mobile Layout - Stacked */}
        <div className="md:hidden space-y-4">
          {/* Mobile Bet Types */}
          <div className="border border-gray-200 rounded-lg bg-white p-3">
            <BetTypeSelector />
          </div>

          {/* Mobile Bookmakers */}
          <div className="border border-gray-200 rounded-lg bg-white p-3">
            <BookmakerSelector availableBookmakers={availableBookmakers} />
          </div>

          {/* Mobile Leagues */}
          <div className="border border-gray-200 rounded-lg bg-white p-3">
            <LeagueSelector availableLeagues={availableLeagues} />
          </div>

          {/* Mobile Table */}
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <MatchesTable matches={Array.isArray(matches) ? matches : []} />
          </div>
        </div>

        {/* Desktop Layout - Side by side */}
        <div className="hidden md:block border border-gray-200 rounded-lg bg-white overflow-hidden">
          <div className="flex">
            {/* Left sidebar - Bet Types */}
            <div className="flex-shrink-0 border-r border-gray-200 bg-gray-50/50">
              <div className="p-3">
                <BetTypeSelector />
              </div>
            </div>

            {/* Center - Table */}
            <div className="flex-1 min-w-0">
              <MatchesTable matches={Array.isArray(matches) ? matches : []} />
            </div>

            {/* Right sidebar - Bookmakers and Leagues */}
            <div className="flex-shrink-0 border-l border-gray-200 bg-gray-50/50">
              <div className="p-3 space-y-4">
                <BookmakerSelector availableBookmakers={availableBookmakers} />
                <LeagueSelector availableLeagues={availableLeagues} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}