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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

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
          <div className="text-xs font-medium whitespace-nowrap">
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
          <div className="text-xs font-medium whitespace-nowrap">
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
          <div className="space-y-1">
            <div className="flex flex-col space-y-0.5 min-w-[180px]">
              <span className="font-medium text-sm">
                {row.original.match_basic.home_team.fbref_name}
              </span>
              <span className="text-xs text-muted-foreground">vs</span>
              <span className="font-medium text-sm">
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
            <div className="text-center min-w-[110px]">
              <div className="font-bold text-sm">Победа дома</div>
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const mlValue = match.events['1x2']?.P1?.ml
            const bookmakerOdds = getBestBookmakerOdds(
              match.events['1x2']?.P1?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            return <OddsCell mlValue={mlValue} bookmakerOdds={bookmakerOdds} />
          },
          size: 130,
        }),
        columnHelper.display({
          id: 'draw',
          header: () => (
            <div className="text-center min-w-[110px]">
              <div className="font-bold text-sm">Ничья</div>
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const mlValue = match.events['1x2']?.X?.ml
            const bookmakerOdds = getBestBookmakerOdds(
              match.events['1x2']?.X?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            return <OddsCell mlValue={mlValue} bookmakerOdds={bookmakerOdds} />
          },
          size: 130,
        }),
        columnHelper.display({
          id: 'away_win',
          header: () => (
            <div className="text-center min-w-[110px]">
              <div className="font-bold text-sm">Победа гостей</div>
            </div>
          ),
          cell: ({ row }) => {
            const match = row.original
            const mlValue = match.events['1x2']?.P2?.ml
            const bookmakerOdds = getBestBookmakerOdds(
              match.events['1x2']?.P2?.bookmaker_odds || [],
              filters.selectedBookmaker
            )
            return <OddsCell mlValue={mlValue} bookmakerOdds={bookmakerOdds} />
          },
          size: 130,
        }),
      ]
    }

    if (filters.betType === 'goals') {
      const totals = ['0.5', '1.5', '2.5', '3.5', '4.5', '5.5']
      const totalColumns = totals.map((total) =>
        columnHelper.display({
          id: `total_${total}`,
          header: () => (
            <div className="text-center min-w-[120px]">
              <div className="font-bold text-sm">Тотал {total}</div>
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
              <div className="space-y-2">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded border">
                  <div className="text-xs font-semibold text-center text-blue-800 dark:text-blue-300 mb-1">Больше {total}</div>
                  <OddsCell mlValue={overMl} bookmakerOdds={overBookmaker} className="w-full scale-75" />
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded border">
                  <div className="text-xs font-semibold text-center text-red-800 dark:text-red-300 mb-1">Меньше {total}</div>
                  <OddsCell mlValue={underMl} bookmakerOdds={underBookmaker} className="w-full scale-75" />
                </div>
              </div>
            )
          },
          size: 130,
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
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            Нет данных для отображения
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Матчи</span>
          <span className="text-sm font-normal text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            {filteredMatches.length} матчей
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ minWidth: header.getSize() }}
                      className="text-center p-3 border-b border-border font-semibold text-sm sticky top-0 bg-muted/80 backdrop-blur-sm"
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
                  className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="text-center p-2 align-middle"
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
      </CardContent>
    </Card>
  )
}