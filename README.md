# Football Stats AI

ML-powered betting odds predictions for football matches. This application analyzes football statistics and provides insights for finding profitable betting opportunities.

## Features

- 🎯 **Smart Odds Analysis**: ML-generated coefficients compared with bookmaker odds
- 📊 **Real-time Data**: Live updates from S3 storage with automatic fallback
- 🎨 **Modern UI**: Clean, responsive design optimized for data readability
- 🔍 **Advanced Filtering**: Filter by bookmakers, bet types, and profitability levels
- 📱 **Mobile-First**: Fully responsive design for all devices
- ⚡ **Fast Performance**: Built with Next.js 14 and optimized for speed

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query (React Query)
- **Tables**: TanStack Table with sorting and filtering
- **Deployment**: Vercel with automatic CI/CD

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd football-stats-ai
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Start development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── api/                 # API routes
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── providers.tsx        # React Query provider
├── components/              # React components
│   ├── ui/                  # shadcn/ui base components
│   ├── FilterPanel.tsx      # Betting filters
│   ├── MatchesTable.tsx     # Main data table
│   └── OddsCell.tsx         # Odds display cell
├── hooks/                   # Custom React hooks
│   └── useMatches.ts        # Data fetching hook
├── lib/                     # Utilities and types
│   ├── data-fetcher.ts      # S3 and API data loading
│   ├── types.ts             # TypeScript definitions
│   └── utils.ts             # Helper functions
└── stores/                  # State management
    └── matches-store.ts     # Zustand store
```

## Data Sources

The application loads data from:

1. **Primary**: S3 bucket with JSON match files
2. **Fallback**: Local API endpoint with sample data
3. **Demo**: Generated fallback data for development

### Data Format

Match data follows this structure:

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
    home_team: { fbref_name: string, odds_name: string }
    away_team: { fbref_name: string, odds_name: string }
  }
  events: {
    "1x2": {
      P1: { ml: number, bookmaker_odds: BookmakerOdds[] }
      X: { ml: number, bookmaker_odds: BookmakerOdds[] }
      P2: { ml: number, bookmaker_odds: BookmakerOdds[] }
    }
    totals: {
      "0.5": { over: BetOutcome, under: BetOutcome }
      // ... more totals
    }
  }
}
```

## Profitability Levels

The app categorizes betting opportunities by profitability:

- 🎯 **Excellent** (15%+ better): Bookmaker odds significantly higher than ML
- ✅ **Good** (8-14% better): Good value opportunities
- ⚖️ **Fair** (2-7% better): Reasonable value
- ❌ **Poor** (≤0% better): No value or negative expected value

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Adding New Features

1. **New Bet Types**: Add to `FilterType` in `types.ts` and update table columns
2. **New Data Sources**: Extend `data-fetcher.ts` with new endpoints
3. **UI Components**: Use shadcn/ui components for consistency

## Performance Optimizations

- **Server Components**: Used where possible for better performance
- **Data Caching**: React Query caches API responses
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js automatic image optimization
- **Responsive Design**: Mobile-first approach

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request