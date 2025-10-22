import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { trackBetRequestSchema, type TrackBetResponse, type ErrorResponse } from '@/lib/api-types'
import { getYDBDriver } from '@/lib/ydb-client'
import { generateBetId, generateUniqueKey, validateBetData, formatTimestampForYDB } from '@/lib/bet-utils'
import { TypedValues } from 'ydb-sdk'

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
    const driver = await getYDBDriver()

    const existingBet = await driver.tableClient.withSession(async (session) => {
      const query = `
        DECLARE $uniqueKey AS Utf8;

        SELECT * FROM tracked_bets
        WHERE uniqueKey = $uniqueKey
        LIMIT 1;
      `

      const preparedQuery = await session.prepareQuery(query)
      const { resultSets } = await session.executeQuery(preparedQuery, {
        '$uniqueKey': TypedValues.utf8(uniqueKey),
      })

      return resultSets?.[0]?.rows?.[0] ?? null
    })

    // If bet already exists, return it
    if (existingBet) {
      // Parse YDB row format (items array in alphabetical column order)
      // Alphabetical order: awayTeam, betOutcome, betType, bookmaker, homeTeam, id, league,
      // matchDate, matchId, mlCoefficient, odds, profitabilityLevel, resultUpdatedAt,
      // status, trackedAt, uniqueKey, userId
      const items = existingBet.items || []

      return NextResponse.json<TrackBetResponse>({
        success: true,
        alreadyExists: true,
        bet: {
          id: items[5]?.textValue || '',
          userId: items[16]?.textValue || '',
          matchId: items[8]?.textValue || '',
          betType: items[2]?.textValue || '',
          betOutcome: items[1]?.textValue || '',
          bookmaker: items[3]?.textValue || '',
          odds: items[10]?.doubleValue || 0,
          mlCoefficient: items[9]?.doubleValue || undefined,
          profitabilityLevel: items[11]?.textValue || undefined,
          status: items[13]?.textValue || 'active',
          trackedAt: new Date(Number(items[14]?.uint64Value) / 1000),
          resultUpdatedAt: items[12]?.nullFlagValue ? undefined : new Date(Number(items[12]?.uint64Value) / 1000),
          uniqueKey: items[15]?.textValue || '',
          homeTeam: items[4]?.textValue || undefined,
          awayTeam: items[0]?.textValue || undefined,
          league: items[6]?.textValue || undefined,
          matchDate: items[7]?.textValue || undefined,
        },
      })
    }

    // Insert new bet
    const trackedAt = formatTimestampForYDB(new Date())

    await driver.tableClient.withSession(async (session) => {
      const query = `
        DECLARE $id AS Utf8;
        DECLARE $userId AS Utf8;
        DECLARE $matchId AS Utf8;
        DECLARE $betType AS Utf8;
        DECLARE $betOutcome AS Utf8;
        DECLARE $bookmaker AS Utf8;
        DECLARE $odds AS Double;
        DECLARE $mlCoefficient AS Double?;
        DECLARE $profitabilityLevel AS Utf8?;
        DECLARE $status AS Utf8;
        DECLARE $trackedAt AS Timestamp;
        DECLARE $uniqueKey AS Utf8;
        DECLARE $homeTeam AS Utf8?;
        DECLARE $awayTeam AS Utf8?;
        DECLARE $league AS Utf8?;
        DECLARE $matchDate AS Utf8?;

        INSERT INTO tracked_bets (
          id, userId, matchId, betType, betOutcome, bookmaker,
          odds, mlCoefficient, profitabilityLevel, status, trackedAt, uniqueKey,
          homeTeam, awayTeam, league, matchDate
        ) VALUES (
          $id, $userId, $matchId, $betType, $betOutcome, $bookmaker,
          $odds, $mlCoefficient, $profitabilityLevel, $status, $trackedAt, $uniqueKey,
          $homeTeam, $awayTeam, $league, $matchDate
        );
      `

      const preparedQuery = await session.prepareQuery(query)
      await session.executeQuery(preparedQuery, {
        '$id': TypedValues.utf8(betId),
        '$userId': TypedValues.utf8(userId),
        '$matchId': TypedValues.utf8(data.matchId),
        '$betType': TypedValues.utf8(data.betType),
        '$betOutcome': TypedValues.utf8(data.betOutcome),
        '$bookmaker': TypedValues.utf8(data.bookmaker),
        '$odds': TypedValues.double(data.odds),
        '$mlCoefficient': data.mlCoefficient !== undefined ? TypedValues.optional(TypedValues.double(data.mlCoefficient)) : TypedValues.optional(TypedValues.double(0)),
        '$profitabilityLevel': data.profitabilityLevel ? TypedValues.optional(TypedValues.utf8(data.profitabilityLevel)) : TypedValues.optional(TypedValues.utf8('')),
        '$status': TypedValues.utf8('active'),
        '$trackedAt': TypedValues.timestamp(new Date(trackedAt / 1000)),
        '$uniqueKey': TypedValues.utf8(uniqueKey),
        '$homeTeam': data.homeTeam ? TypedValues.optional(TypedValues.utf8(data.homeTeam)) : TypedValues.optional(TypedValues.utf8('')),
        '$awayTeam': data.awayTeam ? TypedValues.optional(TypedValues.utf8(data.awayTeam)) : TypedValues.optional(TypedValues.utf8('')),
        '$league': data.league ? TypedValues.optional(TypedValues.utf8(data.league)) : TypedValues.optional(TypedValues.utf8('')),
        '$matchDate': data.matchDate ? TypedValues.optional(TypedValues.utf8(data.matchDate)) : TypedValues.optional(TypedValues.utf8('')),
      })
    })

    // Return created bet
    return NextResponse.json<TrackBetResponse>({
      success: true,
      bet: {
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
        trackedAt: new Date(),
        uniqueKey,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        league: data.league,
        matchDate: data.matchDate,
      },
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
