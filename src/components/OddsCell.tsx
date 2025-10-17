'use client'

import { BookmakerOdds } from '@/lib/types'
import { formatOdds, getProfitabilityLevel } from '@/lib/utils'
import { useMatchesStore } from '@/stores/matches-store'

interface OddsCellProps {
  mlValue?: number | null
  bookmakerOdds?: BookmakerOdds | null
  className?: string
  showBookmakerName?: boolean
}

export function OddsCell({ mlValue, bookmakerOdds, className, showBookmakerName = false }: OddsCellProps) {
  const { filters } = useMatchesStore()
  const profitability = getProfitabilityLevel(mlValue, bookmakerOdds?.value, filters.maxOddsThreshold)
  const isProfitable = profitability !== 'poor'
  const isHighlyProfitable = profitability === 'good' || profitability === 'excellent'

  // Calculate profit percentage
  const profitPercent = mlValue && bookmakerOdds?.value != null
    ? Math.round(((Number(bookmakerOdds.value) / mlValue - 1) * 100))
    : 0

  const getProfitabilityColor = () => {
    switch (profitability) {
      case 'excellent':
        return 'text-green-700 dark:text-green-400 font-bold'
      case 'good':
        return 'text-green-700 dark:text-green-400'
      case 'fair':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  // If "show only profitable" is enabled and this bet is not profitable enough (< 10%), show empty cell
  if (filters.showOnlyProfitable && !isHighlyProfitable) {
    return (
      <div className={`text-xs space-y-0.5 ${className}`}>
        <div className="flex items-center justify-center text-gray-400">
          -
        </div>
      </div>
    )
  }

  return (
    <div className={`text-xs space-y-0.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500">AI</span>
        <span className="font-mono">
          {mlValue ? formatOdds(mlValue) : '-'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500">
          {showBookmakerName && bookmakerOdds ? bookmakerOdds.bookmaker_name : 'БК'}
        </span>
        <span className={`font-mono ${getProfitabilityColor()}`}>
          {bookmakerOdds?.value != null ? formatOdds(Number(bookmakerOdds.value)) : '-'}
          {isProfitable && profitPercent > 0 && bookmakerOdds && (
            <span className="ml-1 text-[9px]">+{profitPercent}%</span>
          )}
        </span>
      </div>
    </div>
  )
}