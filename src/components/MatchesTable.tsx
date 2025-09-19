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

  // Filter matches by date
  const filteredMatches = useMemo(() => {
    return filterMatchesByDate(matches, filters.dateFilter)
  }, [matches, filters.dateFilter])

  // Create columns based on filter type
  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor('match_basic.league', {
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
          <div className="text-xs text-left px-2 py-1">
            {row.original.match_basic.league}
          </div>
        ),
        size: 120,
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
            Дата/Время
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-xs px-2 py-1">
            {formatDateTime(
              row.original.match_basic.date,
              row.original.match_basic.time
            )}
          </div>
        ),
        size: 100,
      }),
      columnHelper.accessor('match_basic.home_team.fbref_name', {
        id: 'match',
        header: 'Матч',
        cell: ({ row }) => (
          <div className="text-xs text-left px-2 py-1">
            <div>
              <span className="font-medium">
                {row.original.match_basic.home_team.fbref_name}
              </span>
              <span className="text-gray-500 mx-1">-</span>
              <span className="font-medium">
                {row.original.match_basic.away_team.fbref_name}
              </span>
            </div>
          </div>
        ),
        size: 200,
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
            return <OddsCell mlValue={mlValue} bookmakerOdds={bookmakerOdds} showBookmakerName={filters.selectedBookmaker === null} />
          },
          size: 80,
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
            return <OddsCell mlValue={mlValue} bookmakerOdds={bookmakerOdds} showBookmakerName={filters.selectedBookmaker === null} />
          },
          size: 80,
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
            return <OddsCell mlValue={mlValue} bookmakerOdds={bookmakerOdds} showBookmakerName={filters.selectedBookmaker === null} />
          },
          size: 80,
        }),
      ]
    }

    if (filters.betType === 'goals') {
      const totals = ['0.5', '1.5', '2.5', '3.5', '4.5', '5.5']
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
                  <OddsCell mlValue={overMl} bookmakerOdds={overBookmaker} showBookmakerName={filters.selectedBookmaker === null} />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5">М{total}</div>
                  <OddsCell mlValue={underMl} bookmakerOdds={underBookmaker} showBookmakerName={filters.selectedBookmaker === null} />
                </div>
              </div>
            )
          },
          size: 90,
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

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Матчи</span>
          <span className="text-xs text-gray-500">
            {filteredMatches.length} матчей
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ minWidth: header.getSize() }}
                    className="text-center px-2 py-1 text-xs font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
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
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="text-center px-2 py-1 border-r border-gray-100 last:border-r-0"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}