import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getBetsQuerySchema, type GetBetsResponse, type ErrorResponse } from '@/lib/api-types'
import { getYDBDriver } from '@/lib/ydb-client'
import { TypedValues } from 'ydb-sdk'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      status: searchParams.get('status') || 'all',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    const validationResult = getBetsQuerySchema.safeParse(queryParams)

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Invalid query parameters',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const { status, limit, offset } = validationResult.data

    // Fetch bets from database
    const driver = await getYDBDriver()

    const result = await driver.tableClient.withSession(async (session) => {
      // Build query based on status filter
      let whereClause = 'WHERE userId = $userId'
      if (status !== 'all') {
        whereClause += ' AND status = $status'
      }

      const query = `
        DECLARE $userId AS Utf8;
        ${status !== 'all' ? 'DECLARE $status AS Utf8;' : ''}
        DECLARE $limit AS Uint64;
        DECLARE $offset AS Uint64;

        SELECT * FROM tracked_bets
        ${whereClause}
        ORDER BY trackedAt DESC
        LIMIT $limit
        OFFSET $offset;
      `

      const params: Record<string, any> = {
        '$userId': TypedValues.utf8(userId),
        '$limit': TypedValues.uint64(limit + 1), // Fetch one extra to check if there are more
        '$offset': TypedValues.uint64(offset),
      }

      if (status !== 'all') {
        params['$status'] = TypedValues.utf8(status)
      }

      const preparedQuery = await session.prepareQuery(query)
      const { resultSets } = await session.executeQuery(preparedQuery, params)

      return resultSets?.[0]?.rows ?? []
    })

    // Check if there are more results
    const hasMore = result.length > limit
    const bets = hasMore ? result.slice(0, limit) : result

    // Get total count
    const total = await driver.tableClient.withSession(async (session) => {
      let whereClause = 'WHERE userId = $userId'
      if (status !== 'all') {
        whereClause += ' AND status = $status'
      }

      const query = `
        DECLARE $userId AS Utf8;
        ${status !== 'all' ? 'DECLARE $status AS Utf8;' : ''}

        SELECT COUNT(*) AS count FROM tracked_bets
        ${whereClause};
      `

      const params: Record<string, any> = {
        '$userId': TypedValues.utf8(userId),
      }

      if (status !== 'all') {
        params['$status'] = TypedValues.utf8(status)
      }

      const preparedQuery = await session.prepareQuery(query)
      const { resultSets } = await session.executeQuery(preparedQuery, params)

      const row = resultSets?.[0]?.rows?.[0]
      const count = row?.items?.[0]?.uint64Value
      return typeof count === 'string' ? Number(count) : 0
    })

    // Map bets to response format
    // YDB returns rows with items array in alphabetical column order:
    // [awayTeam, betOutcome, betType, bookmaker, homeTeam, id, league, matchDate,
    //  matchId, mlCoefficient, odds, profitabilityLevel, resultUpdatedAt, status,
    //  trackedAt, uniqueKey, userId]
    const mappedBets = bets.map((bet: any) => {
      const items = bet.items || []

      return {
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
        trackedAt: new Date(Number(items[14]?.uint64Value) / 1000), // Convert from microseconds
        resultUpdatedAt: items[12]?.nullFlagValue ? undefined : new Date(Number(items[12]?.uint64Value) / 1000),
        uniqueKey: items[15]?.textValue || '',
        homeTeam: items[4]?.textValue || undefined,
        awayTeam: items[0]?.textValue || undefined,
        league: items[6]?.textValue || undefined,
        matchDate: items[7]?.textValue || undefined,
      }
    })

    return NextResponse.json<GetBetsResponse>({
      bets: mappedBets,
      total,
      hasMore,
    })

  } catch (error) {
    console.error('Error fetching bets:', error)

    // Provide more specific error message for DNS/connection issues
    let errorMessage = 'Internal server error'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'

    if (errorDetails.includes('DNS') || errorDetails.includes('UNAVAILABLE')) {
      errorMessage = 'Database connection error'
      errorDetails = 'Unable to connect to database. This may be a temporary issue. Please check your environment variables (YDB_ENDPOINT, YDB_DATABASE, YDB_SERVICE_ACCOUNT_KEY_JSON) are correctly set in Vercel.'

      // Log environment check
      console.error('Environment check:', {
        hasEndpoint: !!process.env.YDB_ENDPOINT,
        hasDatabase: !!process.env.YDB_DATABASE,
        hasServiceAccount: !!process.env.YDB_SERVICE_ACCOUNT_KEY_JSON,
      })
    }

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    )
  }
}
