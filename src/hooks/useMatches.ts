'use client'

import { useQuery } from '@tanstack/react-query'
import { loadMatchesFromS3 } from '@/lib/data-fetcher'
import { Match } from '@/lib/types'

export function useMatches() {
  return useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: loadMatchesFromS3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  })
}