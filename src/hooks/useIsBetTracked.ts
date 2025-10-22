'use client'

import { useMemo } from 'react'
import { useMyBets } from './useBetTracking'
import { generateUniqueKey } from '@/lib/bet-utils'
import { useUser } from '@clerk/nextjs'

/**
 * Hook to check if a specific bet is tracked
 * Uses cached data from useMyBets to avoid extra API calls
 */
export function useIsBetTracked(
  matchId: string,
  betType: string,
  betOutcome: string
) {
  const { user } = useUser()
  const { data, isLoading } = useMyBets({ status: 'all' })

  const result = useMemo(() => {
    if (!user || !data?.bets) {
      return {
        isTracked: false,
        betId: undefined,
        isLoading,
      }
    }

    const uniqueKey = generateUniqueKey(user.id, matchId, betType, betOutcome)

    const trackedBet = data.bets.find((bet) => bet.uniqueKey === uniqueKey)

    // Debug log
    if (trackedBet) {
      console.log('🎯 Bet is tracked:', { matchId, betType, betOutcome, betId: trackedBet.id })
    }

    return {
      isTracked: !!trackedBet,
      betId: trackedBet?.id,
      isLoading,
    }
  }, [user, data, matchId, betType, betOutcome, isLoading])

  return result
}
