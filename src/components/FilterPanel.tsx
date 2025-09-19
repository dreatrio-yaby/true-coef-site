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

  // Сортируем букмекеров: Самый выгодный, Фонбет, остальные
  const sortedBookmakers = () => {
    const others = availableBookmakers.filter(b => b !== 'Фонбет').sort()
    return availableBookmakers.includes('Фонбет') ? ['Фонбет', ...others] : others
  }

  const probabilityFromOdds = (odds: number) => Math.round((1 / odds) * 100)

  return (
    <div className="border border-gray-200 rounded mb-4 p-3">
      {/* Слайдер */}
      <div className="mb-4">
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

      {/* Кнопки отображения */}
      <div className="mb-4">
        <div className="flex gap-2">
          <button
            className={`px-3 py-2 text-xs border rounded ${
              !filters.showOnlyProfitable
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => updateFilter({ showOnlyProfitable: false })}
          >
            Отображать все
          </button>
          <button
            className={`px-3 py-2 text-xs border rounded ${
              filters.showOnlyProfitable
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => updateFilter({ showOnlyProfitable: true })}
          >
            Отображать только выгодные
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Типы ставок слева */}
        <div className="flex-shrink-0">
          <h3 className="text-xs font-medium mb-2 text-gray-700">Типы ставок</h3>
          <div className="flex flex-col gap-1">
            {betTypeFilters.map((filter) => (
              <button
                key={filter.key}
                className={`px-3 py-2 text-xs border rounded text-left ${
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

        {/* Пространство между колонками */}
        <div className="flex-1" />

        {/* Букмекеры справа */}
        {availableBookmakers.length > 0 && (
          <div className="flex-shrink-0">
            <h3 className="text-xs font-medium mb-2 text-gray-700">Букмекеры</h3>
            <div className="flex flex-col gap-1">
              <button
                className={`px-3 py-2 text-xs border rounded text-left ${
                  filters.selectedBookmaker === null
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => updateFilter({ selectedBookmaker: null })}
              >
                Самый выгодный
              </button>
              {sortedBookmakers().map((bookmaker) => (
                <button
                  key={bookmaker}
                  className={`px-3 py-2 text-xs border rounded text-left ${
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
      </div>
    </div>
  )
}