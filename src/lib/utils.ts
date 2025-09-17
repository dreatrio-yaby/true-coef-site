import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { BookmakerOdds, ProfitabilityLevel } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: string, time: string): string {
  const d = new Date(`${date} ${time}`)
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatOdds(value: number): string {
  if (value === 0) return '∞'
  return value.toFixed(2)
}

export function calculateProbabilityFromOdds(odds: number): number {
  return odds > 0 ? 1 / odds : 0
}

export function calculateUnderProbability(overProb: number): number {
  return 1 - overProb
}

export function getProfitabilityLevel(
  mlCoef?: number,
  bookmakerCoef?: number
): ProfitabilityLevel {
  if (!mlCoef || !bookmakerCoef || mlCoef <= 0 || bookmakerCoef <= 0) {
    return 'poor'
  }

  // Only show as profitable if ML coefficient is lower than bookmaker (higher probability)
  // and ML coefficient is not too risky (≤ 2.5)
  if (mlCoef >= bookmakerCoef || mlCoef > 2.5) {
    return 'poor'
  }

  const profitRatio = bookmakerCoef / mlCoef

  if (profitRatio >= 1.15) return 'excellent'  // 15%+ better
  if (profitRatio >= 1.08) return 'good'       // 8-14% better
  if (profitRatio >= 1.02) return 'fair'       // 2-7% better
  return 'poor'                                 // Equal or worse
}

export function getProfitabilityFromProbability(prob: number): ProfitabilityLevel {
  const coef = 1 / prob
  if (coef <= 1.4) return 'excellent'
  if (coef <= 2.0) return 'good'
  if (coef <= 3.5) return 'fair'
  return 'poor'
}

export function getBestBookmakerOdds(
  bookmakerOdds: BookmakerOdds[],
  selectedBookmaker?: string | null
): BookmakerOdds | null {
  if (!bookmakerOdds || bookmakerOdds.length === 0) return null

  let filteredOdds = bookmakerOdds

  // Filter by selected bookmaker if specified
  if (selectedBookmaker) {
    filteredOdds = bookmakerOdds.filter(
      odds => odds.bookmaker_name === selectedBookmaker
    )
  }

  if (filteredOdds.length === 0) return null

  // Find the best (highest) odds
  return filteredOdds.reduce((best, current) =>
    parseFloat(current.value.toString()) > parseFloat(best.value.toString())
      ? current
      : best
  )
}

export function getAvailableBookmakers(matches: any[]): string[] {
  const bookmakers = new Set<string>()

  matches.forEach(match => {
    if (match.events) {
      // Process 1x2 odds
      if (match.events['1x2']) {
        ['P1', 'X', 'P2'].forEach(outcome => {
          const outcomeData = match.events['1x2'][outcome]
          if (outcomeData?.bookmaker_odds) {
            outcomeData.bookmaker_odds.forEach((odds: BookmakerOdds) => {
              if (odds.bookmaker_name) {
                bookmakers.add(odds.bookmaker_name)
              }
            })
          }
        })
      }

      // Process totals odds
      if (match.events.totals) {
        Object.values(match.events.totals).forEach((total: any) => {
          ['over', 'under'].forEach(direction => {
            const directionData = total[direction]
            if (directionData?.bookmaker_odds) {
              directionData.bookmaker_odds.forEach((odds: BookmakerOdds) => {
                if (odds.bookmaker_name) {
                  bookmakers.add(odds.bookmaker_name)
                }
              })
            }
          })
        })
      }
    }
  })

  return Array.from(bookmakers).sort()
}

export function filterMatchesByDate(matches: any[], dateFilter?: string): any[] {
  const today = new Date().toISOString().split('T')[0]
  const targetDate = dateFilter || today

  return matches.filter(match => {
    const matchDate = match.match_basic?.date || match.date
    return matchDate >= targetDate
  })
}

export function groupMatchesByLeague(matches: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {}

  matches.forEach(match => {
    const league = match.match_basic?.league || match.league || 'Unknown League'
    if (!grouped[league]) {
      grouped[league] = []
    }
    grouped[league].push(match)
  })

  // Sort matches within each league by date and time
  Object.keys(grouped).forEach(league => {
    grouped[league].sort((a, b) => {
      const dateA = new Date(`${a.match_basic?.date || a.date} ${a.match_basic?.time || a.time}`)
      const dateB = new Date(`${b.match_basic?.date || b.date} ${b.match_basic?.time || b.time}`)
      return dateA.getTime() - dateB.getTime()
    })
  })

  return grouped
}