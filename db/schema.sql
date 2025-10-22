-- Vercel Postgres Database Schema
-- Table for tracking user bets

CREATE TABLE IF NOT EXISTS tracked_bets (
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

  -- Indexes for better query performance
  CONSTRAINT tracked_bets_user_id_idx UNIQUE (user_id, match_id, bet_type, bet_outcome)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_tracked_bets_user_id ON tracked_bets(user_id);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_tracked_bets_status ON tracked_bets(status);

-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_tracked_bets_tracked_at ON tracked_bets(tracked_at DESC);

-- Composite index for user queries with status filter
CREATE INDEX IF NOT EXISTS idx_tracked_bets_user_status ON tracked_bets(user_id, status, tracked_at DESC);
