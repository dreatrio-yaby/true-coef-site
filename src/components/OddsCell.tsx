'use client'

import { BookmakerOdds } from '@/lib/types'
import { formatOdds, getProfitabilityLevel } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface OddsCellProps {
  mlValue?: number
  bookmakerOdds?: BookmakerOdds | null
  className?: string
}

export function OddsCell({ mlValue, bookmakerOdds, className }: OddsCellProps) {
  const profitability = getProfitabilityLevel(mlValue, bookmakerOdds?.value)
  const isProfitable = profitability !== 'poor'

  // Calculate profit percentage
  const profitPercent = mlValue && bookmakerOdds?.value != null
    ? Math.round(((Number(bookmakerOdds.value) / mlValue - 1) * 100))
    : 0

  const getProfitabilityStyles = () => {
    switch (profitability) {
      case 'excellent':
        return 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/50 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100'
      case 'good':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/50 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100'
      case 'fair':
        return 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/50 border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100'
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center p-3 rounded-lg text-center min-w-[110px] transition-all duration-300 shadow-sm hover:shadow-md',
        'border-2',
        getProfitabilityStyles(),
        className
      )}
    >
      {/* Profit percentage indicator */}
      {isProfitable && profitPercent > 0 && (
        <div className="mb-2 px-2 py-1 rounded-full bg-current/10 border border-current/20">
          <span className="text-xs font-extrabold tracking-tight">
            +{profitPercent}%
          </span>
        </div>
      )}

      {/* AI coefficient */}
      <div className="space-y-1 w-full">
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">
          ML MODEL
        </div>
        <div className="font-black text-lg leading-none">
          {mlValue ? formatOdds(mlValue) : '-'}
        </div>
      </div>

      {/* Bookmaker coefficient */}
      {bookmakerOdds && (
        <div className="mt-2 pt-2 space-y-1 w-full border-t border-current/30">
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">
            БУКМЕКЕР
          </div>
          <div className="font-black text-lg leading-none">
            {bookmakerOdds.value != null ? formatOdds(Number(bookmakerOdds.value)) : '-'}
          </div>
        </div>
      )}
    </div>
  )
}