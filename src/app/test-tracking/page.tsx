'use client'

import { useMyBets } from '@/hooks/useBetTracking'
import { useUser } from '@clerk/nextjs'

export default function TestTrackingPage() {
  const { user } = useUser()
  const { data, isLoading, error } = useMyBets({ status: 'all' })

  if (!user) {
    return <div className="p-8">Please sign in to test tracking</div>
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error.message}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Bet Tracking Debug</h1>

      <div className="mb-4">
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Total Bets:</strong> {data?.total || 0}</p>
      </div>

      <h2 className="text-xl font-semibold mb-2">Tracked Bets:</h2>

      {data?.bets && data.bets.length > 0 ? (
        <div className="space-y-4">
          {data.bets.map((bet) => (
            <div key={bet.id} className="border p-4 rounded">
              <p><strong>ID:</strong> {bet.id}</p>
              <p><strong>Match ID:</strong> {bet.matchId}</p>
              <p><strong>Bet Type:</strong> {bet.betType}</p>
              <p><strong>Outcome:</strong> {bet.betOutcome}</p>
              <p><strong>Bookmaker:</strong> {bet.bookmaker}</p>
              <p><strong>Odds:</strong> {bet.odds}</p>
              <p><strong>Unique Key:</strong> {bet.uniqueKey}</p>
              <p><strong>Tracked At:</strong> {new Date(bet.trackedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No tracked bets yet</p>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Raw Data:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}
