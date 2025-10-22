import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { untrackBetRequestSchema, type UntrackBetResponse, type ErrorResponse } from '@/lib/api-types'
import { getYDBDriver } from '@/lib/ydb-client'
import { TypedValues } from 'ydb-sdk'

export async function DELETE(request: NextRequest) {
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
    const validationResult = untrackBetRequestSchema.safeParse(body)

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

    const { betId } = validationResult.data

    // Get bet and verify ownership
    const driver = await getYDBDriver()

    const bet = await driver.tableClient.withSession(async (session) => {
      const query = `
        DECLARE $id AS Utf8;

        SELECT userId FROM tracked_bets
        WHERE id = $id
        LIMIT 1;
      `

      const preparedQuery = await session.prepareQuery(query)
      const { resultSets } = await session.executeQuery(preparedQuery, {
        '$id': TypedValues.utf8(betId),
      })

      return resultSets?.[0]?.rows?.[0] ?? null
    })

    // Check if bet exists
    if (!bet) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: 'Bet not found' },
        { status: 404 }
      )
    }

    // Parse YDB row format (SELECT userId returns items array with single userId value)
    const items = bet.items || []
    const betUserId = items[0]?.textValue

    // Check if user owns the bet
    if (betUserId !== userId) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: 'Forbidden: You do not own this bet' },
        { status: 403 }
      )
    }

    // Delete the bet
    await driver.tableClient.withSession(async (session) => {
      const query = `
        DECLARE $id AS Utf8;

        DELETE FROM tracked_bets
        WHERE id = $id;
      `

      const preparedQuery = await session.prepareQuery(query)
      await session.executeQuery(preparedQuery, {
        '$id': TypedValues.utf8(betId),
      })
    })

    return NextResponse.json<UntrackBetResponse>({
      success: true,
    })

  } catch (error) {
    console.error('Error untracking bet:', error)
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
