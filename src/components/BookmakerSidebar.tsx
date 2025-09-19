'use client'

import { useMatchesStore } from '@/stores/matches-store'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface BookmakerSidebarProps {
  availableBookmakers: string[]
}

export function BookmakerSidebar({ availableBookmakers }: BookmakerSidebarProps) {
  const { filters, updateFilter } = useMatchesStore()

  return (
    <div className="w-64 bg-card border-l border-border p-4 space-y-2">
      <h3 className="text-lg font-semibold mb-4 text-center">Букмекеры</h3>
      <div className="space-y-2">
        <Button
          variant={filters.selectedBookmaker === null ? "default" : "outline"}
          className="w-full justify-between h-12"
          onClick={() => updateFilter({ selectedBookmaker: null })}
        >
          <span className="font-medium">Самый выгодный</span>
          <Badge variant="secondary" className="ml-2">AI</Badge>
        </Button>

        {availableBookmakers.map((bookmaker) => (
          <Button
            key={bookmaker}
            variant={filters.selectedBookmaker === bookmaker ? "default" : "outline"}
            className="w-full justify-start h-12 text-left"
            onClick={() => updateFilter({ selectedBookmaker: bookmaker })}
          >
            <span className="font-medium truncate">{bookmaker}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}