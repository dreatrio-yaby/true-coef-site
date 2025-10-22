import { sql } from '@vercel/postgres'

/**
 * Vercel Postgres database client
 * Replaces YDB with Vercel Postgres for better serverless compatibility
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
  profitabilityLevel?: 'excellent' | 'good' | 'fair' | 'poor'
  status: 'active' | 'won' | 'lost'
  trackedAt: Date
  resultUpdatedAt?: Date
  uniqueKey: string
  homeTeam?: string
  awayTeam?: string
  league?: string
  matchDate?: string
}

/**
 * Initialize database schema (run once on first deployment)
 */
export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS tracked_bets (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        match_id VARCHAR(255) NOT NULL,
        bet_type VARCHAR(50) NOT NULL,
        bet_outcome VARCHAR(50) NOT NULL,
        bookmaker VARCHAR(100) NOT NULL,
        odds DECIMAL(10, 2) NOT NULL,
        ml_coefficient DECIMAL(10, 2),
        profitability_level VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active',
        tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        result_updated_at TIMESTAMP,
        home_team VARCHAR(255),
        away_team VARCHAR(255),
        league VARCHAR(255),
        match_date VARCHAR(255),
        unique_key VARCHAR(500) NOT NULL UNIQUE,
        CONSTRAINT tracked_bets_user_match_bet UNIQUE (user_id, match_id, bet_type, bet_outcome)
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_tracked_bets_user_id ON tracked_bets(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_tracked_bets_status ON tracked_bets(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_tracked_bets_tracked_at ON tracked_bets(tracked_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_tracked_bets_user_status ON tracked_bets(user_id, status, tracked_at DESC)`

    console.log('✅ Database schema initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

/**
 * Track a new bet
 */
export async function trackBet(bet: Omit<TrackedBet, 'trackedAt' | 'resultUpdatedAt'>): Promise<TrackedBet> {
  const result = await sql`
    INSERT INTO tracked_bets (
      id, user_id, match_id, bet_type, bet_outcome, bookmaker, odds,
      ml_coefficient, profitability_level, status, unique_key,
      home_team, away_team, league, match_date, tracked_at
    ) VALUES (
      ${bet.id}, ${bet.userId}, ${bet.matchId}, ${bet.betType}, ${bet.betOutcome},
      ${bet.bookmaker}, ${bet.odds}, ${bet.mlCoefficient || null},
      ${bet.profitabilityLevel || null}, ${bet.status}, ${bet.uniqueKey},
      ${bet.homeTeam || null}, ${bet.awayTeam || null}, ${bet.league || null},
      ${bet.matchDate || null}, NOW()
    )
    ON CONFLICT (unique_key) DO NOTHING
    RETURNING *
  `

  if (result.rows.length === 0) {
    // Bet already exists, fetch it
    const existing = await sql`
      SELECT * FROM tracked_bets WHERE unique_key = ${bet.uniqueKey} LIMIT 1
    `
    return mapRowToBet(existing.rows[0])
  }

  return mapRowToBet(result.rows[0])
}

/**
 * Untrack a bet by ID
 */
export async function untrackBet(betId: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM tracked_bets
    WHERE id = ${betId} AND user_id = ${userId}
  `

  return (result.rowCount ?? 0) > 0
}

/**
 * Get a bet by ID
 */
export async function getBetById(betId: string): Promise<TrackedBet | null> {
  const result = await sql`
    SELECT * FROM tracked_bets WHERE id = ${betId} LIMIT 1
  `

  if (result.rows.length === 0) {
    return null
  }

  return mapRowToBet(result.rows[0])
}

/**
 * Check if a bet exists by unique key
 */
export async function getBetByUniqueKey(uniqueKey: string): Promise<TrackedBet | null> {
  const result = await sql`
    SELECT * FROM tracked_bets WHERE unique_key = ${uniqueKey} LIMIT 1
  `

  if (result.rows.length === 0) {
    return null
  }

  return mapRowToBet(result.rows[0])
}

/**
 * Get user's tracked bets with pagination
 */
export async function getUserBets(
  userId: string,
  options: {
    status?: 'all' | 'active' | 'won' | 'lost'
    limit?: number
    offset?: number
  } = {}
): Promise<{ bets: TrackedBet[]; total: number; hasMore: boolean }> {
  const { status = 'all', limit = 50, offset = 0 } = options

  // Get total count
  let total: number
  if (status === 'all') {
    const countResult = await sql`
      SELECT COUNT(*) as count FROM tracked_bets WHERE user_id = ${userId}
    `
    total = parseInt(countResult.rows[0]?.count || '0', 10)
  } else {
    const countResult = await sql`
      SELECT COUNT(*) as count FROM tracked_bets WHERE user_id = ${userId} AND status = ${status}
    `
    total = parseInt(countResult.rows[0]?.count || '0', 10)
  }

  // Get paginated results (fetch one extra to check if there are more)
  let result
  if (status === 'all') {
    result = await sql`
      SELECT * FROM tracked_bets
      WHERE user_id = ${userId}
      ORDER BY tracked_at DESC
      LIMIT ${limit + 1}
      OFFSET ${offset}
    `
  } else {
    result = await sql`
      SELECT * FROM tracked_bets
      WHERE user_id = ${userId} AND status = ${status}
      ORDER BY tracked_at DESC
      LIMIT ${limit + 1}
      OFFSET ${offset}
    `
  }

  const hasMore = result.rows.length > limit
  const bets = result.rows.slice(0, limit).map(mapRowToBet)

  return { bets, total, hasMore }
}

/**
 * Update bet status (for future use when implementing result tracking)
 */
export async function updateBetStatus(
  betId: string,
  userId: string,
  status: 'active' | 'won' | 'lost'
): Promise<boolean> {
  const result = await sql`
    UPDATE tracked_bets
    SET status = ${status}, result_updated_at = NOW()
    WHERE id = ${betId} AND user_id = ${userId}
  `

  return (result.rowCount ?? 0) > 0
}

/**
 * Map database row to TrackedBet object
 */
function mapRowToBet(row: any): TrackedBet {
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    betType: row.bet_type,
    betOutcome: row.bet_outcome,
    bookmaker: row.bookmaker,
    odds: parseFloat(row.odds),
    mlCoefficient: row.ml_coefficient ? parseFloat(row.ml_coefficient) : undefined,
    profitabilityLevel: row.profitability_level || undefined,
    status: row.status || 'active',
    trackedAt: new Date(row.tracked_at),
    resultUpdatedAt: row.result_updated_at ? new Date(row.result_updated_at) : undefined,
    uniqueKey: row.unique_key,
    homeTeam: row.home_team || undefined,
    awayTeam: row.away_team || undefined,
    league: row.league || undefined,
    matchDate: row.match_date || undefined,
  }
}

/**
 * Retry wrapper for operations with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt)
        console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`, error)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Operation failed after max retries')
}
