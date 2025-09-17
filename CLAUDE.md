# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-page web application for displaying football statistics with ML/AI-generated betting coefficients. The application is built as a standalone HTML file with embedded CSS and JavaScript, designed to load and display match data from S3 storage.

## Architecture

The project consists of a single `index.html` file that contains:

- **HTML Structure**: Basic page layout with containers for settings, filters, and match data tables
- **CSS Styling**: Modern glass-morphism design with gradients, responsive layout, and animations
- **JavaScript Logic**: Client-side functionality for data loading, filtering, and table rendering

### Key Components

1. **S3 Configuration Interface**: Input fields for bucket URL and file patterns
2. **Filter System**: Toggle buttons for different bet types (1X2, General Goals Totals)
3. **Data Visualization**: League-grouped tables showing match predictions with color-coded probabilities
4. **Responsive Design**: Mobile-friendly layout with adaptive table structure

### Data Structure

The application expects JSON data with the following structure:
```json
{
  "match_id": "18bb7c10-e4a775cb_2937041",
  "mapping_info": {
    "confidence": "high",
    "match_reason": "exact_teams; same_date; league_match",
    "merged_at": "2025-09-12T15:45:03.589246"
  },
  "match_basic": {
    "date": "2025-09-13",
    "time": "12:30",
    "league": "Premier League",
    "home_team": {
      "fbref_id": "18bb7c10",
      "fbref_name": "Arsenal",
      "odds_name": "Арсенал"
    },
    "away_team": {
      "fbref_id": "e4a775cb",
      "fbref_name": "Nottingham Forest",
      "odds_name": "Ноттингем Форест"
    }
  },
  "events": {
    "1x2": {
      "P1": {
        "ml": 1.66,
        "bookmaker_odds": [
          {
            "bookmaker_id": 4,
            "bookmaker_name": "Фонбет",
            "value": 1.37,
            "is_better": false
          }
        ],
        "better_odds": {
          "bookmaker_id": 7,
          "bookmaker_name": "БЕТСИТИ",
          "value": 1.4
        }
      }
    },
    "totals": {
      "0.5": {
        "over": {
          "ml": 1.08,
          "bookmaker_odds": [...],
          "better_odds": {...}
        },
        "under": {
          "ml": 13.19,
          "bookmaker_odds": [...],
          "better_odds": {...}
        }
      }
    }
  }
}
```

## Development

### File Structure
- `index.html` - Complete application (HTML + CSS + JavaScript)

### Key Functions
- `loadMatches()` - Loads data from S3 or local sample_match.json file
- `setFilter(filter)` - Switches between bet type views (1x2, goals)
- `renderMatches()` - Renders match tables grouped by league, shows only matches from today onwards
- `getBestOddsForBet(match, betPath)` - Gets best bookmaker odds for specific bet
- `getProfitabilityClass(mlCoef, bookmakerCoef)` - Returns CSS class based on profitability comparison
- `extractAvailableDates()` - Extracts available match dates from loaded data
- `extractAvailableBookmakers()` - Extracts available bookmakers from loaded data

### Styling Classes
- `.prob-excellent` - Green gradient for highly profitable bets (bookmaker odds 15%+ higher than ML)
- `.prob-good` - Blue gradient for good bets (bookmaker odds 8-14% higher than ML)
- `.prob-fair` - Orange gradient for fair bets (bookmaker odds 2-7% higher than ML)
- `.prob-poor` - Red gradient for poor bets (bookmaker odds lower or equal to ML)

### Current Features
- **Date Filtering**: Shows only matches from today onwards
- **Bookmaker Integration**: Displays ML coefficients alongside best bookmaker odds
- **Profitability Analysis**: Color-codes bets based on profit potential
- **Bet Types**: Supports 1X2 and General Goals Totals (0.5, 1.5, 2.5, 3.5)
- **S3 Integration**: Attempts to load from S3, falls back to local sample_match.json

### Data Processing
- Supports both legacy format (with `probs` object) and new format (with `events` structure)
- Automatically calculates probabilities from ML coefficients when `probs` not available
- Filters matches by date to show only current and future games
- Groups matches by league and sorts by date/time