'use client'

import { FilterType } from '@/lib/types'
import { useMatchesStore } from '@/stores/matches-store'

export function BetTypeSelector() {
  const { filters, updateFilter } = useMatchesStore()

  const betTypeFilters: { key: FilterType; label: string }[] = [
    { key: '1x2', label: '1X2' },
    { key: 'goals', label: 'Тоталы голов' },
    { key: 'corners', label: 'Угловые' },
  ]

  return (
    <div className="w-full md:w-36">
      <h3 className="text-xs font-medium mb-2 text-gray-700">Типы ставок</h3>
      <div className="flex flex-row md:flex-col gap-1 md:gap-1">
        {betTypeFilters.map((filter) => (
          <button
            key={filter.key}
            className={`flex-1 md:flex-none px-3 py-2 text-xs border rounded text-center md:text-left ${
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
  )
}