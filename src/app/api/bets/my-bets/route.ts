import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getBetsQuerySchema, type GetBetsResponse, type ErrorResponse } from '@/lib/api-types'
import { getUserBets } from '@/lib/db-client'

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
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      status: searchParams.get('status') || 'all',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0,
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
    const { bets, total, hasMore } = await getUserBets(userId, {
      status,
      limit,
      offset,
    })

    return NextResponse.json<GetBetsResponse>({
      bets,
      total,
      hasMore,
    })

  } catch (error) {
    console.error('Error fetching bets:', error)

    // Provide more specific error message for connection issues
    let errorMessage = 'Internal server error'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'

    if (errorDetails.includes('connect') || errorDetails.includes('ECONNREFUSED')) {
      errorMessage = 'Database connection error'
      errorDetails = 'Unable to connect to database. Please check your Vercel Postgres configuration and ensure POSTGRES_URL is set in environment variables.'
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
