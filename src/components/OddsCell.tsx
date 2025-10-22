'use client'

import React from 'react'
import { BookmakerOdds } from '@/lib/types'
import { formatOdds, getProfitabilityLevel } from '@/lib/utils'
import { useMatchesStore } from '@/stores/matches-store'
import { useUser } from '@clerk/nextjs'
import { useTrackBet, useUntrackBet } from '@/hooks/useBetTracking'
import { useIsBetTracked } from '@/hooks/useIsBetTracked'

interface OddsCellProps {
  mlValue?: number | null
  bookmakerOdds?: BookmakerOdds | null
  className?: string
  showBookmakerName?: boolean
  // Tracking props
  matchId?: string
  betType?: string
  betOutcome?: string
  enableTracking?: boolean
  homeTeam?: string
  awayTeam?: string
  league?: string
  matchDate?: string
}

export function OddsCell({
  mlValue,
  bookmakerOdds,
  className,
  showBookmakerName = false,
  matchId,
  betType,
  betOutcome,
  enableTracking = false,
  homeTeam,
  awayTeam,
  league,
  matchDate,
}: OddsCellProps) {
  const { filters } = useMatchesStore()
  const { user } = useUser()
  const profitability = getProfitabilityLevel(mlValue, bookmakerOdds?.value, filters.maxOddsThreshold)
  const isProfitable = profitability !== 'poor'

  // Tracking state
  const { mutate: trackBet, isPending: isTrackPending } = useTrackBet()
  const { mutate: untrackBet, isPending: isUntrackPending } = useUntrackBet()

  const { isTracked, betId } = useIsBetTracked(
    matchId || '',
    betType || '',
    betOutcome || ''
  )

  const isLoading = isTrackPending || isUntrackPending
  const canTrack = enableTracking && user && matchId && betType && betOutcome && bookmakerOdds

  // Debug logging
  React.useEffect(() => {
    if (canTrack) {
      console.log(`[OddsCell] ${matchId}-${betType}-${betOutcome}:`, {
        isTracked,
        betId,
        isLoading,
        canTrack,
        hasUser: !!user,
        enableTracking,
      })
    }
  }, [isTracked, betId, isLoading, canTrack, matchId, betType, betOutcome, user, enableTracking])

  // Handle click to toggle tracking
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!canTrack || isLoading) return

    if (isTracked && betId) {
      // Untrack
      untrackBet(betId)
    } else {
      // Track
      trackBet({
        matchId: matchId!,
        betType: betType!,
        betOutcome: betOutcome!,
        bookmaker: bookmakerOdds!.bookmaker_name,
        odds: Number(bookmakerOdds!.value),
        mlCoefficient: mlValue || undefined,
        profitabilityLevel: profitability,
        homeTeam,
        awayTeam,
        league,
        matchDate,
      })
    }
  }

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

  return (
    <div
      className={`
        text-xs space-y-0.5 relative
        ${canTrack ? 'cursor-pointer' : ''}
        ${isTracked ? 'bet-tracked' : ''}
        ${isLoading ? 'bet-loading' : ''}
        ${className}
      `}
      onClick={canTrack ? handleClick : undefined}
    >
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