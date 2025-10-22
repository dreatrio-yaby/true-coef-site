import { randomUUID } from 'crypto'
import type { TrackedBet } from './api-types'

/**
 * Generate unique bet ID (UUID v4)
 */
export function generateBetId(): string {
  return randomUUID()
}

/**
 * Generate unique key for deduplication
 * Format: {userId}_{matchId}_{betType}_{betOutcome}
 */
export function generateUniqueKey(
  userId: string,
  matchId: string,
  betType: string,
  betOutcome: string
): string {
  return `${userId}_${matchId}_${betType}_${betOutcome}`
}

/**
 * Validate bet data (additional business logic)
 */
export function validateBetData(data: {
  odds: number
  mlCoefficient?: number
}): { valid: boolean; error?: string } {
  // Odds should be >= 1.01
  if (data.odds < 1.01) {
    return { valid: false, error: 'Odds must be at least 1.01' }
  }

  // ML coefficient should be >= 1.01 if provided
  if (data.mlCoefficient && data.mlCoefficient < 1.01) {
    return { valid: false, error: 'ML coefficient must be at least 1.01' }
  }

  return { valid: true }
}

/**
 * Map database bet to API response format
 */
export function mapBetToResponse(dbBet: any): TrackedBet {
  return {
    id: dbBet.id,
    userId: dbBet.userId,
    matchId: dbBet.matchId,
    betType: dbBet.betType,
    betOutcome: dbBet.betOutcome,
    bookmaker: dbBet.bookmaker,
    odds: dbBet.odds,
    mlCoefficient: dbBet.mlCoefficient || undefined,
    profitabilityLevel: dbBet.profitabilityLevel || undefined,
    status: dbBet.status,
    trackedAt: new Date(dbBet.trackedAt),
    resultUpdatedAt: dbBet.resultUpdatedAt ? new Date(dbBet.resultUpdatedAt) : undefined,
    uniqueKey: dbBet.uniqueKey,
  }
}

/**
 * Format timestamp for YDB (microseconds since epoch)
 */
export function formatTimestampForYDB(date: Date): number {
  return date.getTime() * 1000 // Convert milliseconds to microseconds
}

/**
 * Parse timestamp from YDB (microseconds since epoch)
 */
export function parseTimestampFromYDB(microseconds: number): Date {
  return new Date(microseconds / 1000) // Convert microseconds to milliseconds
}
