'use client'

import { useMatches } from '@/hooks/useMatches'
import { FilterPanel } from '@/components/FilterPanel'
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
      <div className="max-w-6xl mx-auto p-4">
        <FilterPanel availableBookmakers={availableBookmakers} />
        <MatchesTable matches={Array.isArray(matches) ? matches : []} />
      </div>
    </div>
  )
}