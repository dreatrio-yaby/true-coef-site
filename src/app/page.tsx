'use client'

import { useMatches } from '@/hooks/useMatches'
import { FilterPanel } from '@/components/FilterPanel'
import { BetTypeSelector } from '@/components/BetTypeSelector'
import { BookmakerSelector } from '@/components/BookmakerSelector'
import { MatchesTable } from '@/components/MatchesTable'
import { getAvailableBookmakers } from '@/lib/utils'
import { useMemo } from 'react'

export default function HomePage() {
  const { data: matches = [], isLoading, error } = useMatches()

  // Get available bookmakers from matches data
  const availableBookmakers = useMemo(() => {
    return Array.isArray(matches) ? getAvailableBookmakers(matches) : []
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
          <h1 className="text-lg font-mono font-bold text-black">
            Football Stats AI
          </h1>

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

            {/* Right sidebar - Bookmakers */}
            <div className="flex-shrink-0 border-l border-gray-200 bg-gray-50/50">
              <div className="p-3">
                <BookmakerSelector availableBookmakers={availableBookmakers} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}