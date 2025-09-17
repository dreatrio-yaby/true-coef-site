'use client'

import { FilterType } from '@/lib/types'
import { useMatchesStore } from '@/stores/matches-store'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface FilterPanelProps {
  availableBookmakers: string[]
}

export function FilterPanel({ availableBookmakers }: FilterPanelProps) {
  const { filters, updateFilter } = useMatchesStore()

  const betTypeFilters: { key: FilterType; label: string }[] = [
    { key: '1x2', label: '1X2' },
    { key: 'goals', label: 'Общие тоталы голов' },
    { key: 'corners', label: 'Угловые' },
  ]

  return (
    <Card className="mb-6">
      <div className="p-6 space-y-4">
        {/* Bookmaker Filter */}
        {availableBookmakers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Букмекеры</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.selectedBookmaker === null ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter({ selectedBookmaker: null })}
              >
                Самый выгодный
              </Button>
              {availableBookmakers.map((bookmaker) => (
                <Button
                  key={bookmaker}
                  variant={filters.selectedBookmaker === bookmaker ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter({ selectedBookmaker: bookmaker })}
                >
                  {bookmaker}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Bet Type Filter */}
        <div>
          <h3 className="text-sm font-medium mb-3">Типы ставок</h3>
          <div className="flex flex-wrap gap-2">
            {betTypeFilters.map((filter) => (
              <Button
                key={filter.key}
                variant={filters.betType === filter.key ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter({ betType: filter.key })}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

      </div>
    </Card>
  )
}