'use client'

import { FilterType } from '@/lib/types'
import { useMatchesStore } from '@/stores/matches-store'
import { Button } from './ui/button'

export function BetTypeSidebar() {
  const { filters, updateFilter } = useMatchesStore()

  const betTypes: { key: FilterType; label: string; icon: string }[] = [
    { key: '1x2', label: '1X2', icon: '⚽' },
    { key: 'goals', label: 'Тотал голов', icon: '🥅' },
  ]

  return (
    <div className="w-64 bg-card border-r border-border p-4 space-y-2">
      <h3 className="text-lg font-semibold mb-4 text-center">Типы ставок</h3>
      <div className="space-y-2">
        {betTypes.map((betType) => (
          <Button
            key={betType.key}
            variant={filters.betType === betType.key ? "default" : "outline"}
            className="w-full justify-start h-12 text-left"
            onClick={() => updateFilter({ betType: betType.key })}
          >
            <span className="mr-3 text-lg">{betType.icon}</span>
            <span className="font-medium">{betType.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}