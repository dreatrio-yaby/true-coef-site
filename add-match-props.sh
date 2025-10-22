#!/bin/bash

# Script to add match properties to all OddsCell components with enableTracking=true

file="src/components/MatchesTable.tsx"

# Create a temporary file
temp_file=$(mktemp)

# Read the file line by line
line_num=0
in_odds_cell=false
has_enable_tracking=false
has_match_props=false
indent=""

while IFS= read -r line; do
  ((line_num++))

  # Check if we're entering an OddsCell component
  if [[ $line =~ \<OddsCell ]]; then
    in_odds_cell=true
    has_enable_tracking=false
    has_match_props=false
    # Extract indentation
    indent="${line%%[! ]*}"
  fi

  # Check if this OddsCell has enableTracking
  if [[ $in_odds_cell == true ]] && [[ $line =~ enableTracking=\{true\} ]]; then
    has_enable_tracking=true
  fi

  # Check if match props already exist
  if [[ $in_odds_cell == true ]] && [[ $line =~ (homeTeam|awayTeam|league|matchDate)= ]]; then
    has_match_props=true
  fi

  # If we're closing the OddsCell and it has enableTracking but no match props
  if [[ $in_odds_cell == true ]] && [[ $line =~ /\> ]] && [[ $has_enable_tracking == true ]] && [[ $has_match_props == false ]]; then
    # Insert the match props before the closing />
    echo "$indent  homeTeam={match.match_basic.home_team.fbref_name}" >> "$temp_file"
    echo "$indent  awayTeam={match.match_basic.away_team.fbref_name}" >> "$temp_file"
    echo "$indent  league={match.match_basic.league.fbref_name}" >> "$temp_file"
    echo "$indent  matchDate={\`\${match.match_basic.date} \${match.match_basic.time}\`}" >> "$temp_file"
    in_odds_cell=false
  fi

  # Write the current line
  echo "$line" >> "$temp_file"
done < "$file"

# Replace the original file
mv "$temp_file" "$file"

echo "Done! Added match props to all OddsCell components with enableTracking=true"
