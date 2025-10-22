import type {
  TrackBetRequest,
  TrackBetResponse,
  UntrackBetResponse,
  GetBetsResponse,
  ErrorResponse,
} from './api-types'

/**
 * Base fetch wrapper with error handling
 */
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    const error = data as ErrorResponse
    throw new Error(error.error || 'API request failed')
  }

  return data as T
}

/**
 * Track a new bet
 */
export async function trackBet(data: TrackBetRequest): Promise<TrackBetResponse> {
  return fetchAPI<TrackBetResponse>('/api/bets/track', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Untrack a bet
 */
export async function untrackBet(betId: string): Promise<UntrackBetResponse> {
  return fetchAPI<UntrackBetResponse>('/api/bets/untrack', {
    method: 'DELETE',
    body: JSON.stringify({ betId }),
  })
}

/**
 * Get user's tracked bets
 */
export async function getMyBets(params?: {
  status?: 'all' | 'active' | 'won' | 'lost'
  limit?: number
  offset?: number
}): Promise<GetBetsResponse> {
  const searchParams = new URLSearchParams()

  if (params?.status) searchParams.set('status', params.status)
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.offset) searchParams.set('offset', params.offset.toString())

  const url = `/api/bets/my-bets?${searchParams.toString()}`

  return fetchAPI<GetBetsResponse>(url, {
    method: 'GET',
  })
}
