import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { trackBetRequestSchema, type TrackBetResponse, type ErrorResponse } from '@/lib/api-types'
import { trackBet, getBetByUniqueKey } from '@/lib/db-client'
import { generateBetId, generateUniqueKey, validateBetData } from '@/lib/bet-utils'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = trackBetRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Additional business logic validation
    const { valid, error } = validateBetData({
      odds: data.odds,
      mlCoefficient: data.mlCoefficient,
    })

    if (!valid) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: error! },
        { status: 400 }
      )
    }

    // Generate bet ID and unique key
    const betId = generateBetId()
    const uniqueKey = generateUniqueKey(userId, data.matchId, data.betType, data.betOutcome)

    // Check if bet already exists
    const existingBet = await getBetByUniqueKey(uniqueKey)

    if (existingBet) {
      return NextResponse.json<TrackBetResponse>({
        success: true,
        alreadyExists: true,
        bet: existingBet,
      })
    }

    // Insert new bet
    const bet = await trackBet({
      id: betId,
      userId,
      matchId: data.matchId,
      betType: data.betType,
      betOutcome: data.betOutcome,
      bookmaker: data.bookmaker,
      odds: data.odds,
      mlCoefficient: data.mlCoefficient,
      profitabilityLevel: data.profitabilityLevel,
      status: 'active',
      uniqueKey,
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      league: data.league,
      matchDate: data.matchDate,
    })

    // Return created bet
    return NextResponse.json<TrackBetResponse>({
      success: true,
      bet,
    }, { status: 201 })

  } catch (error) {
    console.error('Error tracking bet:', error)
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
