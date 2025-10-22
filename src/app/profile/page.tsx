'use client'

import { useUser } from '@clerk/nextjs'
import { useMyBets } from '@/hooks/useBetTracking'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const { data, isLoading, error } = useMyBets({ status: 'all' })

  // Redirect to sign-in if not authenticated
  if (isLoaded && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Требуется авторизация</h1>
          <p className="text-gray-600 mb-6">
            Для доступа к профилю необходимо войти в систему
          </p>
          <Link href="/">
            <Button>На главную</Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Ошибка</h1>
          <p className="text-gray-600 mb-6">
            {error.message || 'Не удалось загрузить данные'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </Card>
      </div>
    )
  }

  const bets = data?.bets || []
  const totalBets = bets.length

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Профиль</h1>
            <p className="text-gray-600 mt-1">
              {user?.emailAddresses[0]?.emailAddress || user?.username}
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">На главную</Button>
          </Link>
        </div>

        {/* Tracked Bets Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Отслеживаемые ставки</h2>

          {totalBets === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Нет отслеживаемых ставок</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Перейдите на главную страницу и нажмите на коэффициент, чтобы начать отслеживать ставки
              </p>
              <Link href="/">
                <Button>На главную</Button>
              </Link>
            </div>
          ) : (
            // Compact table view
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-2 py-2 font-semibold text-gray-700">Матч</th>
                    <th className="text-center px-2 py-2 font-semibold text-gray-700">Тип</th>
                    <th className="text-center px-2 py-2 font-semibold text-gray-700">Исход</th>
                    <th className="text-center px-2 py-2 font-semibold text-gray-700">Букмекер</th>
                    <th className="text-center px-2 py-2 font-semibold text-gray-700">AI</th>
                    <th className="text-center px-2 py-2 font-semibold text-gray-700">БК</th>
                    <th className="text-center px-2 py-2 font-semibold text-gray-700">Выгодность</th>
                    <th className="text-center px-2 py-2 font-semibold text-gray-700">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {bets.map((bet, index) => (
                    <tr
                      key={bet.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-2 py-2 text-left">
                        <div className="font-medium text-gray-900 text-xs">
                          {bet.homeTeam && bet.awayTeam ? (
                            <span>{bet.homeTeam} - {bet.awayTeam}</span>
                          ) : (
                            <span className="text-gray-400">{bet.matchId}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                          {bet.betType}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 text-center font-medium">
                        {bet.betOutcome}
                      </td>
                      <td className="px-2 py-2 text-center text-gray-600">
                        {bet.bookmaker}
                      </td>
                      <td className="px-2 py-2 text-center font-mono">
                        {bet.mlCoefficient ? bet.mlCoefficient.toFixed(2) : '-'}
                      </td>
                      <td className="px-2 py-2 text-center font-mono font-medium">
                        {bet.odds.toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <Badge
                          className={`text-[10px] px-1.5 py-0.5 ${
                            bet.profitabilityLevel === 'excellent' ? 'bg-green-100 text-green-800' :
                            bet.profitabilityLevel === 'good' ? 'bg-green-50 text-green-700' :
                            bet.profitabilityLevel === 'fair' ? 'bg-gray-100 text-gray-700' :
                            'bg-gray-50 text-gray-600'
                          }`}
                        >
                          {bet.profitabilityLevel === 'excellent' && 'Отлично'}
                          {bet.profitabilityLevel === 'good' && 'Хорошо'}
                          {bet.profitabilityLevel === 'fair' && 'Средне'}
                          {bet.profitabilityLevel === 'poor' && 'Низко'}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 text-center text-gray-500 text-[11px]">
                        {new Date(bet.trackedAt).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
