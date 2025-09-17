'use client'

import { useMatches } from '@/hooks/useMatches'
import { FilterPanel } from '@/components/FilterPanel'
import { MatchesTable } from '@/components/MatchesTable'
import { getAvailableBookmakers } from '@/lib/utils'
import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const { data: matches = [], isLoading, error } = useMatches()

  // Get available bookmakers from matches data
  const availableBookmakers = useMemo(() => {
    return Array.isArray(matches) ? getAvailableBookmakers(matches) : []
  }, [matches])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Загрузка матчей...</h2>
          <p className="text-muted-foreground">
            Получаем последние данные из S3 хранилища
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <div className="text-destructive mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Ошибка загрузки</h2>
          <p className="text-muted-foreground mb-4">{error?.message || 'Неизвестная ошибка'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-3">
          Football Stats AI
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          ML-powered betting odds predictions
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Поиск выгодных ставок с помощью машинного обучения
        </p>
      </header>

      {/* Filter Panel */}
      <FilterPanel availableBookmakers={availableBookmakers} />

      {/* Matches Table */}
      <MatchesTable matches={Array.isArray(matches) ? matches : []} />

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-muted-foreground">
        <p>
          Данные обновляются автоматически. Коэффициенты представлены в виде ML-прогнозов
          и лучших предложений букмекеров.
        </p>
        <p className="mt-2">
          🎯 = отличная выгодность (15%+) • ✓ = хорошая выгодность (8-14%) •
          ⚖️ = справедливая (2-7%) • ❌ = невыгодная
        </p>
      </footer>
    </div>
  )
}