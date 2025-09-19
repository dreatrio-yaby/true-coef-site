'use client'

import { useMatchesStore } from '@/stores/matches-store'

interface BookmakerSelectorProps {
  availableBookmakers: string[]
}

export function BookmakerSelector({ availableBookmakers }: BookmakerSelectorProps) {
  const { filters, updateFilter } = useMatchesStore()

  // Сортируем букмекеров: Самый выгодный, Фонбет, остальные
  const sortedBookmakers = () => {
    const others = availableBookmakers.filter(b => b !== 'Фонбет').sort()
    return availableBookmakers.includes('Фонбет') ? ['Фонбет', ...others] : others
  }

  if (availableBookmakers.length === 0) {
    return null
  }

  return (
    <div className="w-44">
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
  )
}