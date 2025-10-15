'use client'

import { FilterType } from '@/lib/types'
import { useMatchesStore } from '@/stores/matches-store'

export function BetTypeSelector() {
  const { filters, updateFilter } = useMatchesStore()

  const betTypeFilters: { key: FilterType; label: string }[] = [
    { key: '1x2', label: '1X2' },
    { key: 'both_teams_to_score', label: 'Обе забьют' },
    { key: 'goals', label: 'Тотал голов' },
    { key: 'total_corners', label: 'Тотал угловых' },
    { key: 'home_goals', label: 'Голы хозяев' },
    { key: 'away_goals', label: 'Голы гостей' },
    { key: 'home_corners', label: 'Угловые хозяев' },
    { key: 'away_corners', label: 'Угловые гостей' },
  ]

  return (
    <div className="w-full md:w-36">
      <h3 className="text-xs font-medium mb-2 text-gray-700">Типы ставок</h3>
      <div className="flex flex-wrap md:flex-col gap-1">
        {betTypeFilters.map((filter) => (
          <button
            key={filter.key}
            className={`flex-shrink-0 px-3 py-2 text-xs border rounded text-center md:text-left ${
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