# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern Russian-language web application for displaying football statistics with ML/AI-generated betting coefficients. The application analyzes football matches and compares ML-generated odds with bookmaker odds to identify profitable betting opportunities. Built with Next.js 14, TypeScript, and modern React patterns, it loads match data from Yandex Cloud S3 storage with fallback mechanisms for reliability.

## Architecture

The project is built with modern web technologies:

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Clerk for user authentication and management
- **Database**: Yandex Database (YDB) for bet tracking data
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query (React Query) for caching
- **Tables**: TanStack Table for advanced sorting and filtering
- **Deployment**: Optimized for Vercel

### Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── bets/            # Bet tracking API endpoints
│   │   │   ├── track/       # Track a bet (POST)
│   │   │   ├── untrack/     # Untrack a bet (DELETE)
│   │   │   └── my-bets/     # Get user's tracked bets (GET)
│   │   ├── matches/         # Main data fetching endpoint
│   │   └── s3-proxy/        # S3 proxy for bypassing restrictions
│   ├── profile/             # User profile page
│   │   └── page.tsx         # Profile page with tracked bets table
│   ├── globals.css          # Global styles with Tailwind (includes bet tracking styles)
│   ├── layout.tsx           # Root layout with Clerk, providers and analytics
│   ├── page.tsx             # Main home page with 3-panel layout
│   ├── providers.tsx        # React Query provider setup
│   └── sitemap.ts           # Dynamic sitemap generation
├── components/              # React components
│   ├── ui/                  # shadcn/ui base components (Button, Card, Badge)
│   ├── BetTypeSelector.tsx  # Left sidebar bet type selection
│   ├── BookmakerSelector.tsx # Right sidebar bookmaker selection
│   ├── FilterPanel.tsx      # Probability filters and profit toggle
│   ├── GoogleAnalytics.tsx  # GA4 integration component
│   ├── LeagueSelector.tsx   # League filter dropdown
│   ├── Logo.tsx             # CF logo component with variants
│   ├── MatchesTable.tsx     # Main data table with TanStack Table + bet tracking
│   ├── OddsCell.tsx         # Smart odds display with profitability + click to track
│   └── StructuredData.tsx   # SEO structured data (JSON-LD)
├── hooks/                   # Custom React hooks
│   ├── useBetTracking.ts    # Bet tracking mutations and queries
│   ├── useIsBetTracked.ts   # Check if a bet is tracked
│   └── useMatches.ts        # Data fetching hook with React Query
├── lib/                     # Utilities and configuration
│   ├── analytics.ts         # Google Analytics helper functions
│   ├── api-client.ts        # API client for bet tracking
│   ├── api-types.ts         # Zod schemas and types for API
│   ├── bet-utils.ts         # Bet ID generation and validation utilities
│   ├── data-fetcher.ts      # S3 and API data loading logic
│   ├── types.ts             # TypeScript type definitions
│   ├── utils.ts             # Helper functions and cn() utility
│   ├── ydb-client.ts        # YDB database client
│   └── ydb-migrations.ts    # YDB table migrations
├── stores/                  # State management
│   └── matches-store.ts     # Zustand store with persistence
└── middleware.ts            # Clerk authentication middleware
```

### Key Components

1. **BetTypeSelector** (`src/components/BetTypeSelector.tsx`): **IMPORTANT** - This is where bet types are defined and displayed in the LEFT sidebar. When adding new bet types, modify this file, NOT FilterPanel.
2. **FilterPanel** (`src/components/FilterPanel.tsx`): Modern filter interface with probability sliders and "show profitable only" toggles - does NOT contain bet type selection.
3. **BookmakerSelector** (`src/components/BookmakerSelector.tsx`): Bookmaker selection in the RIGHT sidebar.
4. **MatchesTable** (`src/components/MatchesTable.tsx`): Advanced table with sorting, league grouping, and responsive design - contains the column rendering logic for each bet type.
5. **OddsCell** (`src/components/OddsCell.tsx`): Smart odds display showing ML vs bookmaker coefficients with profitability indicators.
6. **LeagueSelector** (`src/components/LeagueSelector.tsx`): Dropdown for filtering matches by league.
7. **Logo** (`src/components/Logo.tsx`): Brand logo with multiple style variants.
8. **GoogleAnalytics** (`src/components/GoogleAnalytics.tsx`): GA4 tracking integration.
9. **StructuredData** (`src/components/StructuredData.tsx`): JSON-LD structured data for SEO.

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
- **Bet Tracking System**: Click-to-track functionality with persistent storage in YDB
- **User Authentication**: Clerk-based authentication with protected profile page
- **Advanced Filtering**: Filter by bookmakers, bet types, and profitability levels
- **Responsive Design**: Mobile-first approach with adaptive table layouts
- **Data Caching**: Intelligent caching with React Query for optimal performance
- **Fallback System**: Graceful degradation with S3 proxy for bypassing restrictions
- **SEO Optimization**: Full metadata, sitemap, robots.txt, and structured data
- **Analytics**: Google Analytics 4 integration for tracking user behavior

### Profitability Analysis

The app uses sophisticated logic to determine profitability by comparing ML coefficients with bookmaker odds:

- **Excellent** (🎯): 15%+ better odds - Bookmaker odds significantly higher than ML
- **Good** (✅): 8-14% better odds - Good value opportunities
- **Fair** (⚖️): 2-7% better odds - Reasonable value
- **Poor** (❌): ≤1% better odds - No value or negative expected value

**Important**: Only shows as profitable if ML coefficient is lower than bookmaker (indicating higher confidence) AND ML coefficient is reasonable (≤ 2.5) to avoid overly risky bets.

### API Endpoints

#### Match Data
- `/api/matches` - Load matches with pagination support
- `/api/s3-proxy` - Proxy for S3 data to bypass mobile operator restrictions

#### Bet Tracking (Protected by Clerk Auth)
- `POST /api/bets/track` - Track a new bet
  - Body: `{ matchId, betType, betOutcome, bookmaker, odds, mlCoefficient?, profitabilityLevel?, homeTeam?, awayTeam?, league?, matchDate? }`
  - Returns: `{ success: true, bet: TrackedBet, alreadyExists?: boolean }`
- `DELETE /api/bets/untrack` - Untrack a bet
  - Body: `{ betId }`
  - Returns: `{ success: true }`
- `GET /api/bets/my-bets` - Get user's tracked bets
  - Query params: `status=all|active|won|lost`, `limit=50`, `offset=0`
  - Returns: `{ bets: TrackedBet[], total: number, hasMore: boolean }`

### Bet Tracking System

The application includes a complete bet tracking system with the following features:

#### Database Schema (YDB)
Table `tracked_bets` with columns:
- `id` (PK) - Unique bet ID
- `userId` - Clerk user ID
- `matchId` - Match identifier
- `betType` - Type of bet (1x2, totals, etc.)
- `betOutcome` - Specific outcome (P1, X, P2, over_2.5, etc.)
- `bookmaker` - Bookmaker name
- `odds` - Bookmaker odds value
- `mlCoefficient` - ML-generated coefficient
- `profitabilityLevel` - excellent, good, fair, or poor
- `status` - active, won, or lost
- `trackedAt` - Timestamp when bet was tracked
- `resultUpdatedAt` - Timestamp when result was updated
- `uniqueKey` - Composite key (userId + matchId + betType + betOutcome)
- `homeTeam` - Home team name
- `awayTeam` - Away team name
- `league` - League name
- `matchDate` - Match date and time

#### Visual Feedback
- **Green border and background**: Indicates a tracked bet
- **Hover effect**: Darker green on hover (no red - removed per user preference)
- **Click to track/untrack**: Toggle tracking by clicking on OddsCell
- **No toast notifications**: Visual feedback only (removed per user preference)

#### Profile Page
- Clean, minimal design with tracked bets table
- Displays: Match (Team vs Team), Type, Outcome, Bookmaker, AI odds, BK odds, Profitability, Date
- Compact table format matching main MatchesTable style
- No statistics cards (removed per user preference)
- Empty state with call-to-action to track bets

#### Technical Implementation
- **React Query**: Optimistic updates and automatic cache invalidation
- **Unique key constraint**: Prevents duplicate tracking of the same bet
- **YDB migrations**: `npm run migrate` to create/update tables
- **Type safety**: Full TypeScript with Zod validation
- **Error handling**: Silent errors with console logging (no user-facing toasts)

### Commands

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint checks
- `npm run type-check` - TypeScript validation
- `npm run migrate` - Run YDB database migrations
- `npx tsx scripts/migrate.ts down` - Rollback migrations (drop tables)

### Deployment

Optimized for Vercel with:
- Automatic deployments on git push
- Environment variable management
- Edge function optimization
- Global CDN distribution

The application automatically handles S3 data loading with multiple fallback mechanisms for reliability.