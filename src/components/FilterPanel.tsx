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
          <span className="block md:inline">Показывать выгодные ставки, вероятность которых выше </span>
          <span className="text-sm font-bold">{probabilityFromOdds(filters.maxOddsThreshold || 2.5)}%</span>
          <span className="text-gray-500"> (&lt;{(filters.maxOddsThreshold || 2.5).toFixed(1)})</span>
        </h3>
        <div className="w-full max-w-xs md:w-48">
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

      {/* Типы ставок */}
      <div className="mb-4">
        <h3 className="text-xs font-medium mb-2 text-gray-700">Тип ставки</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <button
            className={`px-3 py-2 text-xs border rounded ${
              filters.betType === '1x2'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => updateFilter({ betType: '1x2' })}
          >
            1X2
          </button>
          <button
            className={`px-3 py-2 text-xs border rounded ${
              filters.betType === 'goals'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => updateFilter({ betType: 'goals' })}
          >
            Тотал голов
          </button>
          <button
            className={`px-3 py-2 text-xs border rounded ${
              filters.betType === 'both_teams_to_score'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => updateFilter({ betType: 'both_teams_to_score' })}
          >
            Обе забьют
          </button>
          <button
            className={`px-3 py-2 text-xs border rounded ${
              filters.betType === 'total_corners'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => updateFilter({ betType: 'total_corners' })}
          >
            Тотал угловых
          </button>
          <button
            className={`px-3 py-2 text-xs border rounded ${
              filters.betType === 'home_goals'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => updateFilter({ betType: 'home_goals' })}
          >
            Голы хозяев
          </button>
          <button
            className={`px-3 py-2 text-xs border rounded ${
              filters.betType === 'away_goals'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => updateFilter({ betType: 'away_goals' })}
          >
            Голы гостей
          </button>
          <button
            className={`px-3 py-2 text-xs border rounded ${
              filters.betType === 'home_corners'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => updateFilter({ betType: 'home_corners' })}
          >
            Угловые хозяев
          </button>
          <button
            className={`px-3 py-2 text-xs border rounded ${
              filters.betType === 'away_corners'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => updateFilter({ betType: 'away_corners' })}
          >
            Угловые гостей
          </button>
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