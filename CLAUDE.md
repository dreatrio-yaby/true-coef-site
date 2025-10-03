# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern Russian-language web application for displaying football statistics with ML/AI-generated betting coefficients. The application analyzes football matches and compares ML-generated odds with bookmaker odds to identify profitable betting opportunities. Built with Next.js 14, TypeScript, and modern React patterns, it loads match data from Yandex Cloud S3 storage with fallback mechanisms for reliability.

## Architecture

The project is built with modern web technologies:

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query (React Query) for caching
- **Tables**: TanStack Table for advanced sorting and filtering
- **Deployment**: Optimized for Vercel

### Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── api/                 # API routes for data fetching
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Main home page
│   └── providers.tsx        # React Query provider setup
├── components/              # React components
│   ├── ui/                  # shadcn/ui base components (Button, Card, Badge)
│   ├── FilterPanel.tsx      # Betting filters and controls
│   ├── MatchesTable.tsx     # Main data table with TanStack Table
│   └── OddsCell.tsx         # Individual odds display component
├── hooks/                   # Custom React hooks
│   └── useMatches.ts        # Data fetching hook with React Query
├── lib/                     # Utilities and configuration
│   ├── data-fetcher.ts      # S3 and API data loading logic
│   ├── types.ts             # TypeScript type definitions
│   └── utils.ts             # Helper functions and utilities
└── stores/                  # State management
    └── matches-store.ts     # Zustand store for app state
```

### Key Components

1. **BetTypeSelector** (`src/components/BetTypeSelector.tsx`): **IMPORTANT** - This is where bet types are defined and displayed in the LEFT sidebar. When adding new bet types, modify this file, NOT FilterPanel.
2. **FilterPanel** (`src/components/FilterPanel.tsx`): Modern filter interface with probability sliders and "show profitable only" toggles - does NOT contain bet type selection.
3. **BookmakerSelector** (`src/components/BookmakerSelector.tsx`): Bookmaker selection in the RIGHT sidebar.
4. **MatchesTable** (`src/components/MatchesTable.tsx`): Advanced table with sorting, league grouping, and responsive design - contains the column rendering logic for each bet type.
5. **OddsCell**: Smart odds display showing ML vs bookmaker coefficients with profitability indicators.
6. **API Routes**: Server-side data fetching with fallback mechanisms.

### UI Layout

The application uses a **three-panel desktop layout**:
- **LEFT SIDEBAR**: Bet type selection (BetTypeSelector) - 1X2, Обе забьют, Тотал голов, Тотал угловых, Голы хозяев, Голы гостей, Угловые хозяев, Угловые гостей
- **CENTER**: Matches table (MatchesTable)
- **RIGHT SIDEBAR**: Bookmaker selection (BookmakerSelector)

On mobile, these panels stack vertically.

### Data Structure

The application expects JSON data with this structure:

```typescript
interface Match {
  match_id: string
  mapping_info: {
    confidence: string
    match_reason: string
    merged_at: string
  }
  match_basic: {
    date: string
    time: string
    league: string
    home_team: {
      fbref_id: string
      fbref_name: string
      odds_name: string
    }
    away_team: {
      fbref_id: string
      fbref_name: string
      odds_name: string
    }
  }
  events: {
    "1x2": {
      P1: BetOutcome
      X: BetOutcome
      P2: BetOutcome
    }
    totals: {
      [key: string]: {
        over: BetOutcome
        under: BetOutcome
      }
    }
  }
}

interface BetOutcome {
  ml: number
  bookmaker_odds: BookmakerOdds[]
  better_odds?: BookmakerOdds
}
```

## Development

### Modern Development Workflow

- **Type Safety**: Full TypeScript coverage with strict mode
- **Component System**: shadcn/ui components for consistency
- **State Management**: Zustand for client state, React Query for server state
- **Styling**: Tailwind CSS with custom profitability classes
- **Performance**: Server Components, automatic code splitting, optimized caching

### Key Features

- **Smart Profitability Analysis**: Real-time comparison of ML vs bookmaker odds
- **Advanced Filtering**: Filter by bookmakers, bet types, and profitability levels
- **Responsive Design**: Mobile-first approach with adaptive table layouts
- **Data Caching**: Intelligent caching with React Query for optimal performance
- **Fallback System**: Graceful degradation from S3 → API → demo data

### Profitability Analysis

The app uses sophisticated logic to determine profitability by comparing ML coefficients with bookmaker odds:

- **Excellent** (🎯): 15%+ better odds - Bookmaker odds significantly higher than ML
- **Good** (✅): 8-14% better odds - Good value opportunities
- **Fair** (⚖️): 2-7% better odds - Reasonable value
- **Poor** (❌): ≤1% better odds - No value or negative expected value

**Important**: Only shows as profitable if ML coefficient is lower than bookmaker (indicating higher confidence) AND ML coefficient is reasonable (≤ 2.5) to avoid overly risky bets.

### API Endpoints

- `/api/matches` - Load matches with pagination support
- `/api/sample-data` - Fallback demo data endpoint

### Commands

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint checks
- `npm run type-check` - TypeScript validation

### Deployment

Optimized for Vercel with:
- Automatic deployments on git push
- Environment variable management
- Edge function optimization
- Global CDN distribution

The application automatically handles S3 data loading with multiple fallback mechanisms for reliability.