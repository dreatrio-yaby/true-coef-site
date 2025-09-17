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

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center p-3 rounded text-center min-w-[90px] transition-colors duration-200',
        'border border-border/20',
        isProfitable
          ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50'
          : 'bg-card hover:bg-muted/30',
        className
      )}
    >
      {/* ML Coefficient */}
      <div className="font-semibold text-sm leading-tight">
        {mlValue ? formatOdds(mlValue) : '-'}
      </div>

      {/* Bookmaker Odds */}
      {bookmakerOdds && (
        <div className="mt-1 space-y-0.5">
          <div className="text-xs opacity-75">
            {formatOdds(bookmakerOdds.value)}
          </div>
          <div className="text-[10px] opacity-50 uppercase tracking-wide">
            {bookmakerOdds.bookmaker_name}
          </div>
        </div>
      )}

    </div>
  )
}