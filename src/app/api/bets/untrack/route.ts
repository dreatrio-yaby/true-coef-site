import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { untrackBetRequestSchema, type UntrackBetResponse, type ErrorResponse } from '@/lib/api-types'
import { getBetById, untrackBet } from '@/lib/db-client'

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
    const bet = await getBetById(betId)

    // Check if bet exists
    if (!bet) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: 'Bet not found' },
        { status: 404 }
      )
    }

    // Check if user owns the bet
    if (bet.userId !== userId) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: 'Forbidden: You do not own this bet' },
        { status: 403 }
      )
    }

    // Delete the bet
    const deleted = await untrackBet(betId, userId)

    if (!deleted) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: 'Failed to delete bet' },
        { status: 500 }
      )
    }

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
