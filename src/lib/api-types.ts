import { z } from 'zod'

/**
 * Zod Schemas for API validation
 */

// Track bet request schema
export const trackBetRequestSchema = z.object({
  matchId: z.string().min(1, 'Match ID is required'),
  betType: z.string().min(1, 'Bet type is required'),
  betOutcome: z.string().min(1, 'Bet outcome is required'),
  bookmaker: z.string().min(1, 'Bookmaker is required'),
  odds: z.number().positive('Odds must be positive'),
  mlCoefficient: z.number().positive().optional(),
  profitabilityLevel: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  homeTeam: z.string().optional(),
  awayTeam: z.string().optional(),
  league: z.string().optional(),
  matchDate: z.string().optional(),
})

// Untrack bet request schema
export const untrackBetRequestSchema = z.object({
  betId: z.string().min(1, 'Bet ID is required'),
})

// Get bets query params schema
export const getBetsQuerySchema = z.object({
  status: z.enum(['active', 'won', 'lost', 'all']).default('all'),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
})

/**
 * TypeScript types derived from schemas
 */

export type TrackBetRequest = z.infer<typeof trackBetRequestSchema>
export type UntrackBetRequest = z.infer<typeof untrackBetRequestSchema>
export type GetBetsQuery = z.infer<typeof getBetsQuerySchema>

/**
 * Tracked bet response type
 */
export interface TrackedBet {
  id: string
  userId: string
  matchId: string
  betType: string
  betOutcome: string
  bookmaker: string
  odds: number
  mlCoefficient?: number
  profitabilityLevel?: string
  status: string
  trackedAt: Date
  resultUpdatedAt?: Date
  uniqueKey: string
  homeTeam?: string
  awayTeam?: string
  league?: string
  matchDate?: string
}

/**
 * API response types
 */

export interface TrackBetResponse {
  success: true
  alreadyExists?: boolean
  bet: TrackedBet
}

export interface UntrackBetResponse {
  success: true
}

export interface GetBetsResponse {
  bets: TrackedBet[]
  total: number
  hasMore: boolean
}

export interface ErrorResponse {
  success: false
  error: string
  details?: any
}
