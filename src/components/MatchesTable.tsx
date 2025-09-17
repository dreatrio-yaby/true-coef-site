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
            <div className="text-center">
              <div>Победа дома</div>
              <small className="text-[10px] opacity-75">
                {filters.selectedBookmaker ? `(${filters.selectedBookmaker})` : '(ML/Выгодный)'}
              </small>
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
          size: 120,
        }),
        columnHelper.display({
          id: 'draw',
          header: () => (
            <div className="text-center">
              <div>Ничья</div>
              <small className="text-[10px] opacity-75">
                {filters.selectedBookmaker ? `(${filters.selectedBookmaker})` : '(ML/Выгодный)'}
              </small>
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
          size: 120,
        }),
        columnHelper.display({
          id: 'away_win',
          header: () => (
            <div className="text-center">
              <div>Победа гостей</div>
              <small className="text-[10px] opacity-75">
                {filters.selectedBookmaker ? `(${filters.selectedBookmaker})` : '(ML/Выгодный)'}
              </small>
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
          size: 120,
        }),
      ]
    }

    if (filters.betType === 'goals') {
      const totals = ['0.5', '1.5', '2.5', '3.5']
      const totalColumns = totals.map((total) =>
        columnHelper.display({
          id: `total_${total}`,
          header: () => (
            <div className="text-center">
              <div className="font-bold">Тотал {total}</div>
              <div className="text-[10px] opacity-75 mt-1">
                {filters.selectedBookmaker ? `(${filters.selectedBookmaker})` : '(ML/Выгодный)'}
              </div>
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
              <div className="space-y-1">
                <div className="text-xs font-medium text-center text-muted-foreground">Больше</div>
                <OddsCell mlValue={overMl} bookmakerOdds={overBookmaker} className="w-full" />
                <div className="text-xs font-medium text-center text-muted-foreground">Меньше</div>
                <OddsCell mlValue={underMl} bookmakerOdds={underBookmaker} className="w-full" />
              </div>
            )
          },
          size: 140,
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
        <div className="table-container">
          <table className="matches-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="text-center"
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
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="text-center"
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