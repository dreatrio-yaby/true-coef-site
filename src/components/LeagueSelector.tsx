'use client'

import { useMatchesStore } from '@/stores/matches-store'
import { LeagueInfo } from '@/lib/utils'

interface LeagueSelectorProps {
  availableLeagues: LeagueInfo[]
}

export function LeagueSelector({ availableLeagues }: LeagueSelectorProps) {
  const { filters, updateFilter } = useMatchesStore()

  if (availableLeagues.length === 0) {
    return null
  }

  return (
    <div className="w-full md:w-44">
      <h3 className="text-xs font-medium mb-2 text-gray-700">Лиги</h3>
      <div className="flex flex-wrap md:flex-col gap-1">
        <button
          className={`flex-shrink-0 px-3 py-2 text-xs border rounded text-center md:text-left ${
            filters.selectedLeague === null
              ? 'bg-black text-white border-black'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => updateFilter({ selectedLeague: null })}
        >
          Все лиги
        </button>
        {availableLeagues.map((league) => (
          <button
            key={league.name}
            className={`flex-shrink-0 px-3 py-2 text-xs border rounded text-center md:text-left flex items-center gap-1 ${
              filters.selectedLeague === league.name
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => updateFilter({ selectedLeague: league.name })}
          >
            {league.flag && (
              <img
                src={league.flag}
                alt={league.country}
                className="h-3 w-auto inline-block flex-shrink-0"
              />
            )}
            <span className="truncate">{league.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
