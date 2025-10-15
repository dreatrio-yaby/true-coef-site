import { NextRequest, NextResponse } from 'next/server'
import { loadMatchesFromS3 } from '@/lib/data-fetcher'

// Configure Edge Runtime for Cloudflare Pages
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const matches = await loadMatchesFromS3()

    // Apply pagination if requested
    let paginatedMatches = matches
    if (limit) {
      const limitNum = parseInt(limit, 10)
      const offsetNum = offset ? parseInt(offset, 10) : 0
      paginatedMatches = matches.slice(offsetNum, offsetNum + limitNum)
    }

    return NextResponse.json({
      matches: paginatedMatches,
      total: matches.length,
      limit: limit ? parseInt(limit, 10) : matches.length,
      offset: offset ? parseInt(offset, 10) : 0,
    })
  } catch (error) {
    console.error('Error loading matches:', error)
    return NextResponse.json(
      { error: 'Failed to load matches' },
      { status: 500 }
    )
  }
}

// Enable CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}