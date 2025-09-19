'use client'

import { FilterType } from '@/lib/types'
import { useMatchesStore } from '@/stores/matches-store'

interface FilterPanelProps {
  availableBookmakers: string[]
}

export function FilterPanel({ availableBookmakers }: FilterPanelProps) {
  const { filters, updateFilter } = useMatchesStore()

  const betTypeFilters: { key: FilterType; label: string }[] = [
    { key: '1x2', label: '1X2' },
    { key: 'goals', label: 'Тоталы голов' },
    { key: 'corners', label: 'Угловые' },
  ]

  const probabilityFromOdds = (odds: number) => Math.round((1 / odds) * 100)

  return (
    <div className="border border-gray-200 rounded mb-4 p-3">
      <div className="space-y-3">
        {/* Bookmaker Filter */}
        {availableBookmakers.length > 0 && (
          <div>
            <h3 className="text-xs font-medium mb-2 text-gray-700">Букмекеры</h3>
            <div className="flex flex-wrap gap-1">
              <button
                className={`px-2 py-1 text-xs border rounded ${
                  filters.selectedBookmaker === null
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => updateFilter({ selectedBookmaker: null })}
              >
                Самый выгодный
              </button>
              {availableBookmakers.map((bookmaker) => (
                <button
                  key={bookmaker}
                  className={`px-2 py-1 text-xs border rounded ${
                    filters.selectedBookmaker === bookmaker
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => updateFilter({ selectedBookmaker: bookmaker })}
                >
                  {bookmaker}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Profitability Threshold Filter */}
        <div>
          <h3 className="text-xs font-medium mb-2 text-gray-700">
            Показывать выгодные ставки, вероятность которых выше <span className="text-sm font-bold">{probabilityFromOdds(filters.maxOddsThreshold || 2.5)}%</span> (&lt;{(filters.maxOddsThreshold || 2.5).toFixed(1)})
          </h3>
          <div className="w-48">
            <input
              type="range"
              min="1.5"
              max="4.5"
              step="0.5"
              value={filters.maxOddsThreshold ?? 2.5}
              onChange={(e) => updateFilter({ maxOddsThreshold: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-custom"
            />
            <style jsx>{`
              .slider-custom::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #374151;
                cursor: pointer;
                border: 2px solid #fff;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              .slider-custom::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #374151;
                cursor: pointer;
                border: 2px solid #fff;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
            `}</style>
          </div>
        </div>

        {/* Bet Type Filter */}
        <div>
          <h3 className="text-xs font-medium mb-2 text-gray-700">Типы ставок</h3>
          <div className="flex flex-wrap gap-1">
            {betTypeFilters.map((filter) => (
              <button
                key={filter.key}
                className={`px-2 py-1 text-xs border rounded ${
                  filters.betType === filter.key
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => updateFilter({ betType: filter.key })}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}