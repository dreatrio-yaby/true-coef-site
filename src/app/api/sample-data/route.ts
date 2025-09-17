import { NextResponse } from 'next/server'
import { generateFallbackData } from '@/lib/data-fetcher'

export async function GET() {
  try {
    const sampleData = generateFallbackData()
    return NextResponse.json(sampleData)
  } catch (error) {
    console.error('Error generating sample data:', error)
    return NextResponse.json(
      { error: 'Failed to generate sample data' },
      { status: 500 }
    )
  }
}