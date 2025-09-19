export interface TeamInfo {
  fbref_id: string
  fbref_name: string
  odds_name: string
}

export interface MatchBasic {
  date: string
  time: string
  league: string
  home_team: TeamInfo
  away_team: TeamInfo
}

export interface MappingInfo {
  confidence: string
  match_reason: string
  merged_at: string
}

export interface BookmakerOdds {
  bookmaker_id: number
  bookmaker_name: string
  value: number
  is_better?: boolean
}

export interface BetOutcome {
  ml: number
  bookmaker_odds: BookmakerOdds[]
  better_odds?: BookmakerOdds
}

export interface Match1X2 {
  P1: BetOutcome
  X: BetOutcome
  P2: BetOutcome
}

export interface TotalBet {
  over: BetOutcome
  under: BetOutcome
}

export interface MatchTotals {
  [key: string]: TotalBet // "0.5", "1.5", "2.5", "3.5"
}

export interface MatchEvents {
  "1x2": Match1X2
  totals: MatchTotals
}

export interface Match {
  match_id: string
  mapping_info: MappingInfo
  match_basic: MatchBasic
  events: MatchEvents
}

export interface LegacyProbabilities {
  target_home_win?: number
  target_draw?: number
  target_away_win?: number
  target_total_goals_over_0_5?: number
  target_total_goals_over_1_5?: number
  target_total_goals_over_2_5?: number
  target_total_goals_over_3_5?: number
}

export interface LegacyMatch {
  match_id?: string
  date: string
  time: string
  league: string
  home_name: string
  away_name: string
  probs?: LegacyProbabilities
  bookmaker_odds?: any
}

export type FilterType = '1x2' | 'goals' | 'corners'

export type ProfitabilityLevel = 'excellent' | 'good' | 'fair' | 'poor'

export interface OddsCellData {
  mlValue?: number
  bookmakerOdds?: BookmakerOdds
  profitability: ProfitabilityLevel
}

export interface FilterState {
  betType: FilterType
  selectedBookmaker: string | null
  dateFilter: string
  maxOddsThreshold: number
}

export interface MatchesStore {
  filters: FilterState
  updateFilter: (filter: Partial<FilterState>) => void
}