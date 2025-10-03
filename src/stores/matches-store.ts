'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MatchesStore } from '@/lib/types'

export const useMatchesStore = create<MatchesStore>()(
  persist(
    (set) => ({
      filters: {
        betType: '1x2',
        selectedBookmaker: 'Pinnacle',
        dateFilter: new Date().toISOString().split('T')[0],
        maxOddsThreshold: 2.5,
        showOnlyProfitable: false,
      },

      updateFilter: (filter) =>
        set((state) => ({
          filters: { ...state.filters, ...filter }
        })),
    }),
    {
      name: 'matches-store',
      partialize: (state) => ({
        filters: state.filters
      }),
    }
  )
)