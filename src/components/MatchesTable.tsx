'use client'

import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from '@tanstack/react-table'
import { Match } from '@/lib/types'
import { useMatchesStore } from '@/stores/matches-store'
import {
  formatDateTime,
  getBestBookmakerOdds,
  filterMatchesByDate,
  filterMatchesByLeague,
  hasMatchProfitableBets,
} from '@/lib/utils'
import { OddsCell } from './OddsCell'

interface MatchesTableProps {
  matches: Match[]
}

const columnHelper = createColumnHelper<Match>()


export function MatchesTable({ matches }: MatchesTableProps) {
  const { filters } = useMatchesStore()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'datetime', desc: false }
  ])

  // Filter matches by date, league, and profitability
  const filteredMatches = useMemo(() => {
    let filtered = filterMatchesByDate(matches, filters.dateFilter)

    // Apply league filter if enabled
    filtered = filterMatchesByLeague(filtered, filters.selectedLeague)

    // Apply profitability filter if enabled
    if (filters.showOnlyProfitable) {
      filtered = filtered.filter(match =>
        hasMatchProfitableBets(
          match,
          filters.betType,
          filters.selectedBookmaker,
          filters.maxOddsThreshold
        )
      )
    }

    return filtered
  }, [matches, filters.dateFilter, filters.selectedLeague, filters.showOnlyProfitable, filters.betType, filters.selectedBookmaker, filters.maxOddsThreshold])

  // Create columns based on filter type
  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor((row) => row.match_basic.league.fbref_name, {
        id: 'league',
        header: ({ column }) => (
          <button
            className="hover:text-foreground font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Лига
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-xs text-left px-1 md:px-2 py-1 flex items-center gap-1">
            {row.original.match_basic.league.flag && (
              <img
                src={row.original.match_basic.league.flag}
                alt={row.original.match_basic.league.country}
                className="h-3 w-auto inline-block"
              />
            )}
            <span>{row.original.match_basic.league.fbref_name}</span>
          </div>
        ),
        size: 80,
      }),
      columnHelper.accessor((row) => {
        const date = row.match_basic.date
        const time = row.match_basic.time
        return new Date(`${date} ${time}`).getTime()
      }, {
        id: 'datetime',
        header: ({ column }) => (
          <button
            className="hover:text-foreground font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Дата
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-xs px-1 md:px-2 py-1 whitespace-nowrap">
            {row.original.match_basic.date}
          </div>
        ),
        size: 70,
      }),
      columnHelper.accessor('match_basic.home_team.fbref_name', {
        id: 'match',
        header: 'Матч',
        cell: ({ row }) => (
          <div className="text-xs text-left px-0.5 md:px-2 py-1">
            <div className="flex flex-col md:flex-row md:items-center">
              <span className="font-medium text-[11px] md:text-xs">
                {row.original.match_basic.home_team.fbref_name}
              </span>
              <span className="text-gray-500 mx-1 hidden md:inline">-</span>
              <span className="text-gray-500 text-[9px] md:hidden">vs</span>
              <span className="font-medium text-[11px] md:text-xs">
                {row.original.match_basic.away_team.fbref_name}
              </span>
            </div>
            {/* Show date on mobile for all bet types */}
            <div className="text-[9px] text-gray-500 mt-0.5 md:hidden">
              {formatDateTime(
                row.original.match_basic.date,
                row.original.match_basic.time
              ).split(' ')[0]}
            </div>
          </div>
        ),
        size: 100,
      }),
    ]

    if (filters.betType === '1x2') {
      return [
        ...baseColumns,
        columnHelper.display({
          id: 'home_win',
          header: () => (
            <div className="text-center text-xs font-semibold">
              П1
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const mlValue = match.events['1x2']?.P1?.ml
            const bookmakerOdds = getBestBookmakerOdds(
              match.events['1x2']?.P1?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            return (
              <OddsCell
                mlValue={mlValue}
                bookmakerOdds={bookmakerOdds}
                showBookmakerName={filters.selectedBookmaker === null}
                matchId={match.match_id}
                betType="1x2"
                betOutcome="P1"
                enableTracking={true}
                homeTeam={match.match_basic.home_team.fbref_name}
                awayTeam={match.match_basic.away_team.fbref_name}
                league={match.match_basic.league.fbref_name}
                matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
              />
            )
          },
          size: 50,
        }),
        columnHelper.display({
          id: 'draw',
          header: () => (
            <div className="text-center text-xs font-semibold">
              X
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const mlValue = match.events['1x2']?.X?.ml
            const bookmakerOdds = getBestBookmakerOdds(
              match.events['1x2']?.X?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            return (
              <OddsCell
                mlValue={mlValue}
                bookmakerOdds={bookmakerOdds}
                showBookmakerName={filters.selectedBookmaker === null}
                matchId={match.match_id}
                betType="1x2"
                betOutcome="X"
                enableTracking={true}
                homeTeam={match.match_basic.home_team.fbref_name}
                awayTeam={match.match_basic.away_team.fbref_name}
                league={match.match_basic.league.fbref_name}
                matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
              />
            )
          },
          size: 50,
        }),
        columnHelper.display({
          id: 'away_win',
          header: () => (
            <div className="text-center text-xs font-semibold">
              П2
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const mlValue = match.events['1x2']?.P2?.ml
            const bookmakerOdds = getBestBookmakerOdds(
              match.events['1x2']?.P2?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            return (
              <OddsCell
                mlValue={mlValue}
                bookmakerOdds={bookmakerOdds}
                showBookmakerName={filters.selectedBookmaker === null}
                matchId={match.match_id}
                betType="1x2"
                betOutcome="P2"
                enableTracking={true}
                homeTeam={match.match_basic.home_team.fbref_name}
                awayTeam={match.match_basic.away_team.fbref_name}
                league={match.match_basic.league.fbref_name}
                matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
              />
            )
          },
          size: 50,
        }),
      ]
    }

    if (filters.betType === 'both_teams_to_score') {
      return [
        ...baseColumns,
        columnHelper.display({
          id: 'btts_yes',
          header: () => (
            <div className="text-center text-xs font-semibold">
              Да
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const mlValue = match.events.both_teams_to_score?.yes?.ml
            const bookmakerOdds = getBestBookmakerOdds(
              match.events.both_teams_to_score?.yes?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            return (
              <OddsCell
                mlValue={mlValue}
                bookmakerOdds={bookmakerOdds}
                showBookmakerName={filters.selectedBookmaker === null}
                matchId={match.match_id}
                betType="both_teams_to_score"
                betOutcome="yes"
                enableTracking={true}
                homeTeam={match.match_basic.home_team.fbref_name}
                awayTeam={match.match_basic.away_team.fbref_name}
                league={match.match_basic.league.fbref_name}
                matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
              />
            )
          },
          size: 50,
        }),
        columnHelper.display({
          id: 'btts_no',
          header: () => (
            <div className="text-center text-xs font-semibold">
              Нет
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const mlValue = match.events.both_teams_to_score?.no?.ml
            const bookmakerOdds = getBestBookmakerOdds(
              match.events.both_teams_to_score?.no?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            return (
              <OddsCell
                mlValue={mlValue}
                bookmakerOdds={bookmakerOdds}
                showBookmakerName={filters.selectedBookmaker === null}
                matchId={match.match_id}
                betType="both_teams_to_score"
                betOutcome="no"
                enableTracking={true}
                homeTeam={match.match_basic.home_team.fbref_name}
                awayTeam={match.match_basic.away_team.fbref_name}
                league={match.match_basic.league.fbref_name}
                matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
              />
            )
          },
          size: 50,
        }),
      ]
    }

    if (filters.betType === 'goals') {
      const totals = ['1.5', '2.5', '3.5', '4.5']
      const totalColumns = totals.map((total) =>
        columnHelper.display({
          id: `total_${total}`,
          header: () => (
            <div className="text-center text-xs font-semibold">
              Т{total}
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const overMl = match.events.totals?.[total]?.over?.ml
            const underMl = match.events.totals?.[total]?.under?.ml
            const overBookmaker = getBestBookmakerOdds(
              match.events.totals?.[total]?.over?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            const underBookmaker = getBestBookmakerOdds(
              match.events.totals?.[total]?.under?.bookmaker_odds || [],
              filters.selectedBookmaker
            )

            return (
              <div className="space-y-1 text-xs">
                <div className="border-b border-gray-200 pb-1">
                  <div className="text-[10px] text-gray-500 mb-0.5">Б{total}</div>
                  <OddsCell
                    mlValue={overMl}
                    bookmakerOdds={overBookmaker}
                    showBookmakerName={filters.selectedBookmaker === null}
                    matchId={match.match_id}
                    betType="totals"
                    betOutcome={`over_${total}`}
                    enableTracking={true}
                    homeTeam={match.match_basic.home_team.fbref_name}
                    awayTeam={match.match_basic.away_team.fbref_name}
                    league={match.match_basic.league.fbref_name}
                    matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
                  />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5">М{total}</div>
                  <OddsCell
                    mlValue={underMl}
                    bookmakerOdds={underBookmaker}
                    showBookmakerName={filters.selectedBookmaker === null}
                    matchId={match.match_id}
                    betType="totals"
                    betOutcome={`under_${total}`}
                    enableTracking={true}
                    homeTeam={match.match_basic.home_team.fbref_name}
                    awayTeam={match.match_basic.away_team.fbref_name}
                    league={match.match_basic.league.fbref_name}
                    matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
                  />
                </div>
              </div>
            )
          },
          size: 45,
        })
      )

      return [...baseColumns, ...totalColumns]
    }

    if (filters.betType === 'total_corners') {
      const totals = ['9.5', '10.5', '11.5']
      const totalColumns = totals.map((total) =>
        columnHelper.display({
          id: `total_corners_${total}`,
          header: () => (
            <div className="text-center text-xs font-semibold">
              Т{total}
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const overMl = match.events.total_corners?.[total]?.over?.ml
            const underMl = match.events.total_corners?.[total]?.under?.ml
            const overBookmaker = getBestBookmakerOdds(
              match.events.total_corners?.[total]?.over?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            const underBookmaker = getBestBookmakerOdds(
              match.events.total_corners?.[total]?.under?.bookmaker_odds || [],
              filters.selectedBookmaker
            )

            return (
              <div className="space-y-1 text-xs">
                <div className="border-b border-gray-200 pb-1">
                  <div className="text-[10px] text-gray-500 mb-0.5">Б{total}</div>
                  <OddsCell
                    mlValue={overMl}
                    bookmakerOdds={overBookmaker}
                    showBookmakerName={filters.selectedBookmaker === null}
                    matchId={match.match_id}
                    betType="total_corners"
                    betOutcome={`over_${total}`}
                    enableTracking={true}
                    homeTeam={match.match_basic.home_team.fbref_name}
                    awayTeam={match.match_basic.away_team.fbref_name}
                    league={match.match_basic.league.fbref_name}
                    matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
                  />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5">М{total}</div>
                  <OddsCell
                    mlValue={underMl}
                    bookmakerOdds={underBookmaker}
                    showBookmakerName={filters.selectedBookmaker === null}
                    matchId={match.match_id}
                    betType="total_corners"
                    betOutcome={`under_${total}`}
                    enableTracking={true}
                    homeTeam={match.match_basic.home_team.fbref_name}
                    awayTeam={match.match_basic.away_team.fbref_name}
                    league={match.match_basic.league.fbref_name}
                    matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
                  />
                </div>
              </div>
            )
          },
          size: 45,
        })
      )

      return [...baseColumns, ...totalColumns]
    }

    if (filters.betType === 'home_goals') {
      const totals = ['0.5', '1.5', '2.5']
      const totalColumns = totals.map((total) =>
        columnHelper.display({
          id: `home_goals_${total}`,
          header: () => (
            <div className="text-center text-xs font-semibold">
              Т{total}
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const overMl = match.events.home_goals?.[total]?.over?.ml
            const underMl = match.events.home_goals?.[total]?.under?.ml
            const overBookmaker = getBestBookmakerOdds(
              match.events.home_goals?.[total]?.over?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            const underBookmaker = getBestBookmakerOdds(
              match.events.home_goals?.[total]?.under?.bookmaker_odds || [],
              filters.selectedBookmaker
            )

            return (
              <div className="space-y-1 text-xs">
                <div className="border-b border-gray-200 pb-1">
                  <div className="text-[10px] text-gray-500 mb-0.5">Б{total}</div>
                  <OddsCell
                    mlValue={overMl}
                    bookmakerOdds={overBookmaker}
                    showBookmakerName={filters.selectedBookmaker === null}
                    matchId={match.match_id}
                    betType="home_goals"
                    betOutcome={`over_${total}`}
                    enableTracking={true}
                    homeTeam={match.match_basic.home_team.fbref_name}
                    awayTeam={match.match_basic.away_team.fbref_name}
                    league={match.match_basic.league.fbref_name}
                    matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
                  />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5">М{total}</div>
                  <OddsCell
                    mlValue={underMl}
                    bookmakerOdds={underBookmaker}
                    showBookmakerName={filters.selectedBookmaker === null}
                    matchId={match.match_id}
                    betType="home_goals"
                    betOutcome={`under_${total}`}
                    enableTracking={true}
                    homeTeam={match.match_basic.home_team.fbref_name}
                    awayTeam={match.match_basic.away_team.fbref_name}
                    league={match.match_basic.league.fbref_name}
                    matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
                  />
                </div>
              </div>
            )
          },
          size: 45,
        })
      )

      return [...baseColumns, ...totalColumns]
    }

    if (filters.betType === 'away_goals') {
      const totals = ['0.5', '1.5', '2.5']
      const totalColumns = totals.map((total) =>
        columnHelper.display({
          id: `away_goals_${total}`,
          header: () => (
            <div className="text-center text-xs font-semibold">
              Т{total}
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const overMl = match.events.away_goals?.[total]?.over?.ml
            const underMl = match.events.away_goals?.[total]?.under?.ml
            const overBookmaker = getBestBookmakerOdds(
              match.events.away_goals?.[total]?.over?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            const underBookmaker = getBestBookmakerOdds(
              match.events.away_goals?.[total]?.under?.bookmaker_odds || [],
              filters.selectedBookmaker
            )

            return (
              <div className="space-y-1 text-xs">
                <div className="border-b border-gray-200 pb-1">
                  <div className="text-[10px] text-gray-500 mb-0.5">Б{total}</div>
                  <OddsCell
                    mlValue={overMl}
                    bookmakerOdds={overBookmaker}
                    showBookmakerName={filters.selectedBookmaker === null}
                    matchId={match.match_id}
                    betType="away_goals"
                    betOutcome={`over_${total}`}
                    enableTracking={true}
                    homeTeam={match.match_basic.home_team.fbref_name}
                    awayTeam={match.match_basic.away_team.fbref_name}
                    league={match.match_basic.league.fbref_name}
                    matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
                  />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5">М{total}</div>
                  <OddsCell
                    mlValue={underMl}
                    bookmakerOdds={underBookmaker}
                    showBookmakerName={filters.selectedBookmaker === null}
                    matchId={match.match_id}
                    betType="away_goals"
                    betOutcome={`under_${total}`}
                    enableTracking={true}
                    homeTeam={match.match_basic.home_team.fbref_name}
                    awayTeam={match.match_basic.away_team.fbref_name}
                    league={match.match_basic.league.fbref_name}
                    matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
                  />
                </div>
              </div>
            )
          },
          size: 45,
        })
      )

      return [...baseColumns, ...totalColumns]
    }

    if (filters.betType === 'home_corners') {
      const totals = ['4.5', '5.5', '6.5', '7.5']
      const totalColumns = totals.map((total) =>
        columnHelper.display({
          id: `home_corners_${total}`,
          header: () => (
            <div className="text-center text-xs font-semibold">
              Т{total}
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const overMl = match.events.home_corners?.[total]?.over?.ml
            const underMl = match.events.home_corners?.[total]?.under?.ml
            const overBookmaker = getBestBookmakerOdds(
              match.events.home_corners?.[total]?.over?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            const underBookmaker = getBestBookmakerOdds(
              match.events.home_corners?.[total]?.under?.bookmaker_odds || [],
              filters.selectedBookmaker
            )

            return (
              <div className="space-y-1 text-xs">
                <div className="border-b border-gray-200 pb-1">
                  <div className="text-[10px] text-gray-500 mb-0.5">Б{total}</div>
                  <OddsCell
                    mlValue={overMl}
                    bookmakerOdds={overBookmaker}
                    showBookmakerName={filters.selectedBookmaker === null}
                    matchId={match.match_id}
                    betType="home_corners"
                    betOutcome={`over_${total}`}
                    enableTracking={true}
                    homeTeam={match.match_basic.home_team.fbref_name}
                    awayTeam={match.match_basic.away_team.fbref_name}
                    league={match.match_basic.league.fbref_name}
                    matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
                  />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5">М{total}</div>
                  <OddsCell
                    mlValue={underMl}
                    bookmakerOdds={underBookmaker}
                    showBookmakerName={filters.selectedBookmaker === null}
                    matchId={match.match_id}
                    betType="home_corners"
                    betOutcome={`under_${total}`}
                    enableTracking={true}
                    homeTeam={match.match_basic.home_team.fbref_name}
                    awayTeam={match.match_basic.away_team.fbref_name}
                    league={match.match_basic.league.fbref_name}
                    matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
                  />
                </div>
              </div>
            )
          },
          size: 45,
        })
      )

      return [...baseColumns, ...totalColumns]
    }

    if (filters.betType === 'away_corners') {
      const totals = ['3.5', '4.5', '5.5', '6.5']
      const totalColumns = totals.map((total) =>
        columnHelper.display({
          id: `away_corners_${total}`,
          header: () => (
            <div className="text-center text-xs font-semibold">
              Т{total}
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const overMl = match.events.away_corners?.[total]?.over?.ml
            const underMl = match.events.away_corners?.[total]?.under?.ml
            const overBookmaker = getBestBookmakerOdds(
              match.events.away_corners?.[total]?.over?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            const underBookmaker = getBestBookmakerOdds(
              match.events.away_corners?.[total]?.under?.bookmaker_odds || [],
              filters.selectedBookmaker
            )

            return (
              <div className="space-y-1 text-xs">
                <div className="border-b border-gray-200 pb-1">
                  <div className="text-[10px] text-gray-500 mb-0.5">Б{total}</div>
                  <OddsCell
                    mlValue={overMl}
                    bookmakerOdds={overBookmaker}
                    showBookmakerName={filters.selectedBookmaker === null}
                    matchId={match.match_id}
                    betType="away_corners"
                    betOutcome={`over_${total}`}
                    enableTracking={true}
                    homeTeam={match.match_basic.home_team.fbref_name}
                    awayTeam={match.match_basic.away_team.fbref_name}
                    league={match.match_basic.league.fbref_name}
                    matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
                  />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5">М{total}</div>
                  <OddsCell
                    mlValue={underMl}
                    bookmakerOdds={underBookmaker}
                    showBookmakerName={filters.selectedBookmaker === null}
                    matchId={match.match_id}
                    betType="away_corners"
                    betOutcome={`under_${total}`}
                    enableTracking={true}
                    homeTeam={match.match_basic.home_team.fbref_name}
                    awayTeam={match.match_basic.away_team.fbref_name}
                    league={match.match_basic.league.fbref_name}
                    matchDate={`${match.match_basic.date} ${match.match_basic.time}`}
                  />
                </div>
              </div>
            )
          },
          size: 45,
        })
      )

      return [...baseColumns, ...totalColumns]
    }

    return baseColumns
  }, [filters.betType, filters.selectedBookmaker])

  // Create the table instance
  const table = useReactTable({
    data: filteredMatches,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (filteredMatches.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Нет данных для отображения
      </div>
    )
  }

  // Hide league/date columns on mobile for all bet types to prioritize matches and odds
  const isCompactMobile = true

  return (
    <div className="overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Матчи</span>
          <span className="text-xs text-gray-500">
            {filteredMatches.length} матчей
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[320px] md:min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isLeagueOrDate = header.id === 'league' || header.id === 'datetime'
                  const shouldHideOnMobile = isCompactMobile && isLeagueOrDate

                  return (
                    <th
                      key={header.id}
                      style={{ minWidth: header.getSize() }}
                      className={`text-center px-0.5 md:px-2 py-1 text-xs font-semibold text-gray-700 border-r border-gray-200 last:border-r-0 ${
                        shouldHideOnMobile ? 'hidden md:table-cell' : ''
                      }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                {row.getVisibleCells().map((cell) => {
                  const isLeagueOrDate = cell.column.id === 'league' || cell.column.id === 'datetime'
                  const shouldHideOnMobile = isCompactMobile && isLeagueOrDate

                  return (
                    <td
                      key={cell.id}
                      className={`text-center px-0.5 md:px-2 py-1 border-r border-gray-100 last:border-r-0 ${
                        shouldHideOnMobile ? 'hidden md:table-cell' : ''
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}