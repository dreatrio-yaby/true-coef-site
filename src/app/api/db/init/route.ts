import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db-client'

/**
 * Initialize database schema
 * Call this endpoint once after setting up Vercel Postgres
 * GET /api/db/init
 */
export async function GET() {
  try {
    await initializeDatabase()

    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully',
    })
  } catch (error) {
    console.error('Failed to initialize database:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
