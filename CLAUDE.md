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
2. **Filter System**: Toggle buttons for different bet types (1X2, Goals, Corners)
3. **Data Visualization**: League-grouped tables showing match predictions with color-coded probabilities
4. **Responsive Design**: Mobile-friendly layout with adaptive table structure

### Data Structure

The application expects JSON data with the following structure:
```json
{
  "league": "Serie A",
  "date": "2025-08-20",
  "time": "19:00", 
  "home_name": "Team A",
  "away_name": "Team B",
  "probs": {
    "target_home_win": 0.4523,
    "target_draw": 0.2891,
    "target_away_win": 0.2586,
    "target_total_goals_over_0_5": 0.9143,
    // ... other probability predictions
  }
}
```

## Development

### File Structure
- `index.html` - Complete application (HTML + CSS + JavaScript)

### Key Functions
- `loadMatches()` - Loads data from S3 (currently using demo data)
- `setFilter(filter)` - Switches between bet type views
- `renderMatches()` - Renders match tables grouped by league
- `formatProb(prob)` - Formats probabilities as percentages
- `getProbClass(prob)` - Returns CSS class based on probability value

### Styling Classes
- `.prob-high` - Green gradient for probabilities ≥ 70%
- `.prob-medium` - Yellow gradient for probabilities 40-69%
- `.prob-low` - Red gradient for probabilities < 40%

### Adding New Features
- New bet types: Add filter button and update `getTableHeaders()` and `getMatchRow()` functions
- S3 integration: Implement actual S3 data fetching in `loadMatches()` function
- New probability metrics: Extend the `probs` object structure and rendering logic