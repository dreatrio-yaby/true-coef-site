'use client'

import { useMatchesStore } from '@/stores/matches-store'

export function FilterPanel() {
  const { filters, updateFilter } = useMatchesStore()

  const probabilityFromOdds = (odds: number) => Math.round((1 / odds) * 100)

  const bookmakers = [
    'Все букмекеры',
    'Фонбет',
    'Марафон',
    'Винлайн',
    'Лига Ставок',
    'Мелбет',
    'ПариМатч',
    'PIN-UP',
    'Зенит',
    'Бетсити',
    'Бетеринг'
  ]

  const betTypes = [
    { value: '1x2', label: 'Исходы матча' },
    { value: 'goals', label: 'Голы' }
  ]

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

      {/* Фильтры типов ставок - выпадающий список на мобильных, кнопки на десктопе */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Тип ставок:</h4>

        {/* Мобильная версия - выпадающий список */}
        <div className="block md:hidden">
          <select
            value={filters.betType}
            onChange={(e) => updateFilter({ betType: e.target.value as 'goals' | '1x2' })}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded bg-white text-gray-700"
          >
            {betTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Десктопная версия - кнопки */}
        <div className="hidden md:flex gap-2">
          {betTypes.map((type) => (
            <button
              key={type.value}
              className={`px-3 py-1 text-xs border rounded ${
                filters.betType === type.value
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => updateFilter({ betType: type.value as 'goals' | '1x2' })}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Фильтры букмекеров - выпадающий список на мобильных, кнопки на десктопе */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Букмекеры:</h4>

        {/* Мобильная версия - выпадающий список */}
        <div className="block md:hidden">
          <select
            value={filters.selectedBookmaker || 'Все букмекеры'}
            onChange={(e) => updateFilter({
              selectedBookmaker: e.target.value === 'Все букмекеры' ? null : e.target.value
            })}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded bg-white text-gray-700"
          >
            {bookmakers.map((bookmaker) => (
              <option key={bookmaker} value={bookmaker}>
                {bookmaker}
              </option>
            ))}
          </select>
        </div>

        {/* Десктопная версия - кнопки */}
        <div className="hidden md:flex flex-wrap gap-2">
          {bookmakers.map((bookmaker) => (
            <button
              key={bookmaker}
              className={`px-2 py-1 text-xs border rounded ${
                (filters.selectedBookmaker === null && bookmaker === 'Все букмекеры') ||
                filters.selectedBookmaker === bookmaker
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => updateFilter({
                selectedBookmaker: bookmaker === 'Все букмекеры' ? null : bookmaker
              })}
            >
              {bookmaker}
            </button>
          ))}
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