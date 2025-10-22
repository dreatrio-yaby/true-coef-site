# Vercel Postgres Setup Guide

## Migration from YDB to Vercel Postgres

We've migrated from Yandex Database (YDB) to Vercel Postgres to resolve DNS/gRPC issues in serverless environment.

## Setup Steps

### 1. Create Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name (e.g., `true-coef-db`)
6. Click **Create**

Vercel will automatically set these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NO_SSL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 2. Initialize Database Schema

After deploying to Vercel, visit:
```
https://your-app.vercel.app/api/db/init
```

This will create the `tracked_bets` table and indexes.

You should see:
```json
{
  "success": true,
  "message": "Database schema initialized successfully"
}
```

### 3. Local Development

For local development with Vercel Postgres:

1. Pull environment variables from Vercel:
   ```bash
   vercel env pull .env.local
   ```

2. The `POSTGRES_URL` will be automatically available in `.env.local`

3. Start dev server:
   ```bash
   npm run dev
   ```

## Database Schema

The `tracked_bets` table includes:

```sql
CREATE TABLE tracked_bets (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  match_id VARCHAR(255) NOT NULL,
  bet_type VARCHAR(50) NOT NULL,
  bet_outcome VARCHAR(50) NOT NULL,
  bookmaker VARCHAR(100) NOT NULL,
  odds DECIMAL(10, 2) NOT NULL,
  ml_coefficient DECIMAL(10, 2),
  profitability_level VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  result_updated_at TIMESTAMP,
  home_team VARCHAR(255),
  away_team VARCHAR(255),
  league VARCHAR(255),
  match_date VARCHAR(255),
  unique_key VARCHAR(500) NOT NULL UNIQUE,
  CONSTRAINT tracked_bets_user_match_bet UNIQUE (user_id, match_id, bet_type, bet_outcome)
);
```

**Indexes:**
- `idx_tracked_bets_user_id` - Fast user lookups
- `idx_tracked_bets_status` - Filter by status
- `idx_tracked_bets_tracked_at` - Sort by date
- `idx_tracked_bets_user_status` - Combined user + status queries

## API Endpoints

### Track a Bet
```
POST /api/bets/track
```

**Request:**
```json
{
  "matchId": "...",
  "betType": "1x2",
  "betOutcome": "P1",
  "bookmaker": "1xBet",
  "odds": 2.50,
  "mlCoefficient": 2.20,
  "profitabilityLevel": "excellent",
  "homeTeam": "Team A",
  "awayTeam": "Team B",
  "league": "Premier League",
  "matchDate": "2025-10-22"
}
```

### Untrack a Bet
```
DELETE /api/bets/untrack
```

**Request:**
```json
{
  "betId": "..."
}
```

### Get User's Bets
```
GET /api/bets/my-bets?status=all&limit=50&offset=0
```

**Query Parameters:**
- `status`: `all` | `active` | `won` | `lost` (default: `all`)
- `limit`: Number of bets to return (default: `50`)
- `offset`: Pagination offset (default: `0`)

### Initialize Database
```
GET /api/db/init
```

Run once after setting up Vercel Postgres.

## Benefits of Vercel Postgres

✅ **Serverless-optimized** - No DNS/gRPC issues
✅ **Auto-scaling** - Scales with your traffic
✅ **Connection pooling** - Built-in connection management
✅ **Low latency** - Edge-optimized
✅ **Easy setup** - Integrated with Vercel dashboard
✅ **Free tier** - 256 MB storage, 60 hours compute

## Troubleshooting

### Database connection error

Check that `POSTGRES_URL` is set in environment variables:
```bash
vercel env ls
```

### Table doesn't exist

Visit `/api/db/init` to create the table.

### Old YDB references

All YDB code has been replaced. You can safely remove:
- `ydb-sdk` package
- YDB environment variables (`YDB_ENDPOINT`, `YDB_DATABASE`, `YDB_SERVICE_ACCOUNT_KEY_JSON`)

## Migration Notes

- **No data migration needed** - This is a new feature, no existing data in YDB
- **Backward compatible** - API endpoints remain the same
- **Same functionality** - All bet tracking features work identically

## Cost Estimate

Vercel Postgres pricing (as of 2025):
- **Free tier**: 256 MB storage, 60 hours compute/month
- **Pro**: $0.50/GB storage, $0.10/compute hour

For a typical betting app with ~1000 users:
- Storage: ~10 MB (well within free tier)
- Compute: Minimal (API calls only)

**Expected cost: FREE** for most usage levels.
