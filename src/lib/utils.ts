import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { BookmakerOdds, ProfitabilityLevel, Match, FilterType } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: string, time: string): string {
  const d = new Date(`${date} ${time}`)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}-${minutes}`
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
  mlCoef?: number | null,
  bookmakerCoef?: number | null,
  maxOddsThreshold?: number
): ProfitabilityLevel {
  if (!mlCoef || bookmakerCoef == null || mlCoef <= 0 || bookmakerCoef <= 0) {
    return 'poor'
  }

  const threshold = maxOddsThreshold ?? 2.5

  // Only show as profitable if ML coefficient is lower than bookmaker (higher probability)
  // and ML coefficient is not too risky (≤ threshold)
  if (mlCoef >= bookmakerCoef || mlCoef > threshold) {
    return 'poor'
  }

  const profitRatio = bookmakerCoef / mlCoef

  if (profitRatio >= 1.15) return 'excellent'  // 15%+ better
  if (profitRatio >= 1.10) return 'good'       // 10-15% better
  if (profitRatio > 1.0) return 'fair'         // 0-10% better
  return 'poor'                                 // Equal or worse
}

export function calculateProfitPercent(
  mlCoef?: number | null,
  bookmakerCoef?: number | null
): number {
  if (!mlCoef || bookmakerCoef == null || mlCoef <= 0 || bookmakerCoef <= 0) {
    return 0
  }
  return Math.round(((bookmakerCoef / mlCoef - 1) * 100))
}

export function meetsMinProfitRequirement(
  mlCoef?: number | null,
  bookmakerCoef?: number | null,
  minProfitPercent?: number
): boolean {
  const profitPercent = calculateProfitPercent(mlCoef, bookmakerCoef)
  const minRequired = minProfitPercent ?? 0
  return profitPercent >= minRequired
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
  return filteredOdds.reduce((best, current) => {
    const currentValue = current.value != null ? parseFloat(current.value.toString()) : 0
    const bestValue = best.value != null ? parseFloat(best.value.toString()) : 0
    return currentValue > bestValue ? current : best
  })
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

      // Process both_teams_to_score odds
      if (match.events.both_teams_to_score) {
        ['yes', 'no'].forEach(outcome => {
          const outcomeData = match.events.both_teams_to_score[outcome]
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

export interface LeagueInfo {
  name: string
  flag: string
  country: string
}

export function getAvailableLeagues(matches: any[]): LeagueInfo[] {
  const leaguesMap = new Map<string, LeagueInfo>()

  matches.forEach(match => {
    if (match.match_basic?.league) {
      const league = match.match_basic.league
      const name = league.fbref_name || league.api_name

      if (name && !leaguesMap.has(name)) {
        leaguesMap.set(name, {
          name,
          flag: league.flag || '',
          country: league.country || ''
        })
      }
    }
  })

  return Array.from(leaguesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export function filterMatchesByDate(matches: any[], dateFilter?: string): any[] {
  const today = new Date().toISOString().split('T')[0]
  const targetDate = dateFilter || today
  const now = new Date()

  return matches.filter(match => {
    const matchDate = match.match_basic?.date || match.date
    const matchTime = match.match_basic?.time || match.time

    // Create match datetime
    const matchDateTime = new Date(`${matchDate} ${matchTime}`)

    // Filter out past matches and only show matches from target date forward
    return matchDate >= targetDate && matchDateTime > now
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

export function filterMatchesByLeague(matches: any[], selectedLeague?: string | null): any[] {
  if (!selectedLeague) {
    return matches
  }

  return matches.filter(match => {
    const leagueName = match.match_basic?.league?.fbref_name || match.match_basic?.league?.api_name
    return leagueName === selectedLeague
  })
}

export function hasMatchProfitableBets(
  match: Match,
  betType: FilterType,
  selectedBookmaker: string | null,
  maxOddsThreshold: number,
  minProfitPercent?: number
): boolean {
  if (betType === '1x2') {
    const outcomes = ['P1', 'X', 'P2'] as const
    return outcomes.some(outcome => {
      const betData = match.events['1x2']?.[outcome]
      if (!betData) return false

      const mlValue = betData.ml
      const bookmakerOdds = getBestBookmakerOdds(betData.bookmaker_odds || [], selectedBookmaker)

      if (!mlValue || !bookmakerOdds) return false

      const profitability = getProfitabilityLevel(mlValue, bookmakerOdds.value, maxOddsThreshold)
      const meetsProfitRequirement = meetsMinProfitRequirement(mlValue, bookmakerOdds.value, minProfitPercent)
      return profitability !== 'poor' && meetsProfitRequirement
    })
  }

  if (betType === 'both_teams_to_score') {
    const outcomes = ['yes', 'no'] as const
    return outcomes.some(outcome => {
      const betData = match.events.both_teams_to_score?.[outcome]
      if (!betData) return false

      const mlValue = betData.ml
      const bookmakerOdds = getBestBookmakerOdds(betData.bookmaker_odds || [], selectedBookmaker)

      if (!mlValue || !bookmakerOdds) return false

      const profitability = getProfitabilityLevel(mlValue, bookmakerOdds.value, maxOddsThreshold)
      const meetsProfitRequirement = meetsMinProfitRequirement(mlValue, bookmakerOdds.value, minProfitPercent)
      return profitability !== 'poor' && meetsProfitRequirement
    })
  }

  if (betType === 'goals') {
    // Only check displayed totals: 1.5, 2.5, 3.5, 4.5 (excluding 0.5 and 5.5)
    const displayedTotals = ['1.5', '2.5', '3.5', '4.5']
    return displayedTotals.some(totalKey => {
      const totalData = match.events.totals?.[totalKey]
      if (!totalData) return false

      const directions = ['over', 'under'] as const
      return directions.some(direction => {
        const betData = totalData[direction]
        if (!betData) return false

        const mlValue = betData.ml
        const bookmakerOdds = getBestBookmakerOdds(betData.bookmaker_odds || [], selectedBookmaker)

        if (!mlValue || !bookmakerOdds) return false

        const profitability = getProfitabilityLevel(mlValue, bookmakerOdds.value, maxOddsThreshold)
        const meetsProfitRequirement = meetsMinProfitRequirement(mlValue, bookmakerOdds.value, minProfitPercent)
        return profitability !== 'poor' && meetsProfitRequirement
      })
    })
  }

  if (betType === 'total_corners') {
    const displayedTotals = ['9.5', '10.5', '11.5']
    return displayedTotals.some(totalKey => {
      const totalData = match.events.total_corners?.[totalKey]
      if (!totalData) return false

      const directions = ['over', 'under'] as const
      return directions.some(direction => {
        const betData = totalData[direction]
        if (!betData) return false

        const mlValue = betData.ml
        const bookmakerOdds = getBestBookmakerOdds(betData.bookmaker_odds || [], selectedBookmaker)

        if (!mlValue || !bookmakerOdds) return false

        const profitability = getProfitabilityLevel(mlValue, bookmakerOdds.value, maxOddsThreshold)
        const meetsProfitRequirement = meetsMinProfitRequirement(mlValue, bookmakerOdds.value, minProfitPercent)
        return profitability !== 'poor' && meetsProfitRequirement
      })
    })
  }

  if (betType === 'home_goals') {
    const displayedTotals = ['0.5', '1.5', '2.5']
    return displayedTotals.some(totalKey => {
      const totalData = match.events.home_goals?.[totalKey]
      if (!totalData) return false

      const directions = ['over', 'under'] as const
      return directions.some(direction => {
        const betData = totalData[direction]
        if (!betData) return false

        const mlValue = betData.ml
        const bookmakerOdds = getBestBookmakerOdds(betData.bookmaker_odds || [], selectedBookmaker)

        if (!mlValue || !bookmakerOdds) return false

        const profitability = getProfitabilityLevel(mlValue, bookmakerOdds.value, maxOddsThreshold)
        const meetsProfitRequirement = meetsMinProfitRequirement(mlValue, bookmakerOdds.value, minProfitPercent)
        return profitability !== 'poor' && meetsProfitRequirement
      })
    })
  }

  if (betType === 'away_goals') {
    const displayedTotals = ['0.5', '1.5', '2.5']
    return displayedTotals.some(totalKey => {
      const totalData = match.events.away_goals?.[totalKey]
      if (!totalData) return false

      const directions = ['over', 'under'] as const
      return directions.some(direction => {
        const betData = totalData[direction]
        if (!betData) return false

        const mlValue = betData.ml
        const bookmakerOdds = getBestBookmakerOdds(betData.bookmaker_odds || [], selectedBookmaker)

        if (!mlValue || !bookmakerOdds) return false

        const profitability = getProfitabilityLevel(mlValue, bookmakerOdds.value, maxOddsThreshold)
        const meetsProfitRequirement = meetsMinProfitRequirement(mlValue, bookmakerOdds.value, minProfitPercent)
        return profitability !== 'poor' && meetsProfitRequirement
      })
    })
  }

  if (betType === 'home_corners') {
    const displayedTotals = ['4.5', '5.5', '6.5', '7.5']
    return displayedTotals.some(totalKey => {
      const totalData = match.events.home_corners?.[totalKey]
      if (!totalData) return false

      const directions = ['over', 'under'] as const
      return directions.some(direction => {
        const betData = totalData[direction]
        if (!betData) return false

        const mlValue = betData.ml
        const bookmakerOdds = getBestBookmakerOdds(betData.bookmaker_odds || [], selectedBookmaker)

        if (!mlValue || !bookmakerOdds) return false

        const profitability = getProfitabilityLevel(mlValue, bookmakerOdds.value, maxOddsThreshold)
        const meetsProfitRequirement = meetsMinProfitRequirement(mlValue, bookmakerOdds.value, minProfitPercent)
        return profitability !== 'poor' && meetsProfitRequirement
      })
    })
  }

  if (betType === 'away_corners') {
    const displayedTotals = ['3.5', '4.5', '5.5', '6.5']
    return displayedTotals.some(totalKey => {
      const totalData = match.events.away_corners?.[totalKey]
      if (!totalData) return false

      const directions = ['over', 'under'] as const
      return directions.some(direction => {
        const betData = totalData[direction]
        if (!betData) return false

        const mlValue = betData.ml
        const bookmakerOdds = getBestBookmakerOdds(betData.bookmaker_odds || [], selectedBookmaker)

        if (!mlValue || !bookmakerOdds) return false

        const profitability = getProfitabilityLevel(mlValue, bookmakerOdds.value, maxOddsThreshold)
        const meetsProfitRequirement = meetsMinProfitRequirement(mlValue, bookmakerOdds.value, minProfitPercent)
        return profitability !== 'poor' && meetsProfitRequirement
      })
    })
  }

  return false
}