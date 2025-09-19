'use client'

import { useMatchesStore } from '@/stores/matches-store'

export function FilterPanel() {
  const { filters, updateFilter } = useMatchesStore()

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
      <div>
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
    </div>
  )
}