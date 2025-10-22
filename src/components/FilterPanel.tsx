'use client'

import { useMatchesStore } from '@/stores/matches-store'

export function FilterPanel() {
  const { filters, updateFilter } = useMatchesStore()

  const probabilityFromOdds = (odds: number) => Math.round((1 / odds) * 100)

  return (
    <div className="border border-gray-200 rounded mb-4 p-3">
      {/* Слайдер вероятности */}
      <div className="mb-4">
        <h3 className="text-xs font-medium mb-2 text-gray-700">
          <span className="block md:inline">Показывать выгодные ставки, вероятность которых выше </span>
          <span className="text-sm font-bold">{probabilityFromOdds(filters.maxOddsThreshold || 2.5)}%</span>
          <span className="text-gray-500"> (&lt;{(filters.maxOddsThreshold || 2.5).toFixed(1)})</span>
        </h3>
        <div className="w-full">
          <input
            type="range"
            min="1.5"
            max="4.5"
            step="0.5"
            value={filters.maxOddsThreshold ?? 2.5}
            onChange={(e) => updateFilter({ maxOddsThreshold: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      {/* Слайдер минимального профита */}
      <div className="mb-4">
        <h3 className="text-xs font-medium mb-2 text-gray-700">
          <span className="block md:inline">Минимальный размер профита </span>
          <span className="text-sm font-bold">+{filters.minProfitPercent ?? 10}%</span>
        </h3>
        <div className="w-full">
          <input
            type="range"
            min="0"
            max="30"
            step="5"
            value={filters.minProfitPercent ?? 10}
            onChange={(e) => updateFilter({ minProfitPercent: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      {/* Кнопки отображения */}
      <div>
        <div className="flex flex-col sm:flex-row gap-2">
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
    </div>
  )
}