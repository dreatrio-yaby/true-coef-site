'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { trackBet, untrackBet, getMyBets } from '@/lib/api-client'
import type { TrackBetRequest, TrackedBet } from '@/lib/api-types'

/**
 * Query key factory for bet-related queries
 */
export const betKeys = {
  all: ['bets'] as const,
  lists: () => [...betKeys.all, 'list'] as const,
  list: (filters: { status?: string; limit?: number; offset?: number }) =>
    [...betKeys.lists(), filters] as const,
}

/**
 * Hook to track a new bet
 */
export function useTrackBet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TrackBetRequest) => trackBet(data),

    onSuccess: (response) => {
      // Immediately update cache with the new/existing bet
      queryClient.setQueryData(betKeys.list({ status: 'all' }), (old: any) => {
        if (!old) return { bets: [response.bet], total: 1, hasMore: false }

        // Check if bet already exists in cache
        const existingIndex = old.bets?.findIndex((bet: any) => bet.id === response.bet.id)

        if (existingIndex >= 0) {
          // Already exists - don't show toast, user is about to delete it
          return old
        } else {
          // New bet - add to cache
          return {
            ...old,
            bets: [response.bet, ...(old.bets || [])],
            total: (old.total || 0) + 1,
          }
        }
      })
    },

    onError: (err) => {
      // Silent error - user will see the bet wasn't tracked
      console.error('Error tracking bet:', err)
    },

    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: betKeys.lists() })
    },
  })
}

/**
 * Hook to untrack a bet
 */
export function useUntrackBet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (betId: string) => untrackBet(betId),

    onMutate: async (betId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: betKeys.lists() })

      // Snapshot the previous value
      const previousBets = queryClient.getQueryData(betKeys.list({ status: 'all' }))

      // Optimistically remove from cache
      queryClient.setQueryData(betKeys.list({ status: 'all' }), (old: any) => {
        if (!old) return old

        return {
          ...old,
          bets: old.bets?.filter((bet: TrackedBet) => bet.id !== betId) || [],
          total: Math.max(0, (old.total || 0) - 1),
        }
      })

      return { previousBets, betId }
    },

    onError: (err, betId, context) => {
      // Rollback on error
      if (context?.previousBets) {
        queryClient.setQueryData(betKeys.list({ status: 'all' }), context.previousBets)
      }

      // Silent error - user will see the bet wasn't removed
      console.error('Error untracking bet:', err)
    },

    onSuccess: () => {
      // Silent success - visual feedback from border change is enough
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: betKeys.lists() })
    },
  })
}

/**
 * Hook to fetch user's tracked bets
 */
export function useMyBets(params?: {
  status?: 'all' | 'active' | 'won' | 'lost'
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: betKeys.list(params || {}),
    queryFn: () => getMyBets(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })
}
