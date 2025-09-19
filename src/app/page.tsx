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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-lg font-mono font-bold text-black">
            Football Stats AI
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <FilterPanel />

        {/* Layout with unified container */}
        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
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