'use client'

import { BookmakerOdds } from '@/lib/types'
import { formatOdds, getProfitabilityLevel } from '@/lib/utils'

interface OddsCellProps {
  mlValue?: number
  bookmakerOdds?: BookmakerOdds | null
  className?: string
  showBookmakerName?: boolean
}

export function OddsCell({ mlValue, bookmakerOdds, className, showBookmakerName = false }: OddsCellProps) {
  const profitability = getProfitabilityLevel(mlValue, bookmakerOdds?.value)
  const isProfitable = profitability !== 'poor'

  // Calculate profit percentage
  const profitPercent = mlValue && bookmakerOdds?.value != null
    ? Math.round(((Number(bookmakerOdds.value) / mlValue - 1) * 100))
    : 0

  const getProfitabilityColor = () => {
    switch (profitability) {
      case 'excellent':
        return 'text-green-700 dark:text-green-400 font-bold'
      case 'good':
        return 'text-green-700 dark:text-green-400 font-bold'
      case 'fair':
        return 'text-green-700 dark:text-green-400 font-medium'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className={`text-xs space-y-0.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500">ML</span>
        <span className="font-mono">
          {mlValue ? formatOdds(mlValue) : '-'}
        </span>
      </div>

      {bookmakerOdds && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500">
            {showBookmakerName ? bookmakerOdds.bookmaker_name : 'БК'}
          </span>
          <span className={`font-mono ${getProfitabilityColor()}`}>
            {bookmakerOdds.value != null ? formatOdds(Number(bookmakerOdds.value)) : '-'}
            {isProfitable && profitPercent > 0 && (
              <span className="ml-1 text-[9px]">+{profitPercent}%</span>
            )}
          </span>
        </div>
      )}
    </div>
  )
}