import { Match, AllMatchesResponse } from './types'

const BUCKET_URL = 'https://storage.yandexcloud.net/screen-shared'
const FOLDER_PATH = 'merged-matches'

// Использовать прокси для обхода блокировок мобильных операторов
const USE_PROXY = false // Отключаем прокси - используем прямой доступ к S3
const PROXY_ENDPOINT = '/api/s3-proxy'

export async function fetchAllMatchesFile(date: string): Promise<AllMatchesResponse | null> {
  try {
    const filePath = `${FOLDER_PATH}/${date}/all_matches.json`
    let url: string

    if (USE_PROXY) {
      // Через прокси - обходим блокировки провайдеров
      url = `${PROXY_ENDPOINT}?path=${encodeURIComponent(filePath)}`
    } else {
      // Прямой запрос к S3 (может блокироваться)
      url = `${BUCKET_URL}/${filePath}`
    }

    console.log(`📥 Fetching all_matches.json for ${date} from ${url}`)

    const response = await fetch(url)
    if (response.status === 404) {
      console.log(`⚠️ No matches found for ${date}`)
      return null
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: AllMatchesResponse = await response.json()
    console.log(`✅ Loaded ${data.matches_count} matches for ${date}`)
    return data
  } catch (error) {
    console.error(`❌ Error fetching all_matches.json for ${date}:`, error)
    return null
  }
}


export async function loadSampleData(): Promise<Match[]> {
  console.log('📦 Using fallback sample data')
  return generateFallbackData()
}

function getDateList(): string[] {
  const today = new Date()
  const dates: string[] = []

  // Generate date list for today + 7 days forward
  for (let i = 0; i <= 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
    dates.push(dateStr)
  }

  return dates
}

export async function loadMatchesFromS3(): Promise<Match[]> {
  try {
    const dates = getDateList()
    console.log(`🗓️ Loading matches for dates: ${dates.join(', ')}`)

    const allMatches: Match[] = []

    // Load all_matches.json for each date
    for (const date of dates) {
      const matchesData = await fetchAllMatchesFile(date)
      if (matchesData && matchesData.matches && matchesData.matches.length > 0) {
        console.log(`📊 Loaded ${matchesData.matches_count} matches for ${date}`)
        allMatches.push(...matchesData.matches)
      }
    }

    if (allMatches.length === 0) {
      console.log('⚠️ No matches found in S3, falling back to sample data')
      return await loadSampleData()
    }

    console.log(`✅ Total: ${allMatches.length} matches loaded from S3`)
    return allMatches

  } catch (error) {
    console.error('❌ Error loading from S3:', error)
    console.log('📦 Fallback to sample data')
    return await loadSampleData()
  }
}

export function generateFallbackData(): Match[] {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  return [
    {
      match_id: "demo_match_1",
      mapping_info: {
        confidence: "high",
        match_reason: "demo_data",
        merged_at: new Date().toISOString()
      },
      match_basic: {
        date: todayStr,
        time: "15:00",
        league: {
          fbref_name: "Premier League",
          api_name: "Premier League",
          api_id: 39,
          country: "England",
          logo: "https://media.api-sports.io/football/leagues/39.png",
          flag: "https://media.api-sports.io/flags/gb.svg"
        },
        venue: {
          id: 1,
          name: "Emirates Stadium",
          city: "London"
        },
        home_team: {
          fbref_id: "demo1",
          fbref_name: "Arsenal",
          api_name: "Arsenal",
          api_id: 42,
          logo: "https://media.api-sports.io/football/teams/42.png"
        },
        away_team: {
          fbref_id: "demo2",
          fbref_name: "Chelsea",
          api_name: "Chelsea",
          api_id: 49,
          logo: "https://media.api-sports.io/football/teams/49.png"
        }
      },
      events: {
        "1x2": {
          P1: {
            ml: 2.1,
            bookmaker_odds: [
              {
                bookmaker_id: 4,
                bookmaker_name: "Фонбет",
                value: 2.25,
                is_better: true
              }
            ],
            better_odds: {
              bookmaker_id: 4,
              bookmaker_name: "Фонбет",
              value: 2.25
            }
          },
          X: {
            ml: 3.4,
            bookmaker_odds: [
              {
                bookmaker_id: 4,
                bookmaker_name: "Фонбет",
                value: 3.6,
                is_better: true
              }
            ],
            better_odds: {
              bookmaker_id: 4,
              bookmaker_name: "Фонбет",
              value: 3.6
            }
          },
          P2: {
            ml: 3.2,
            bookmaker_odds: [
              {
                bookmaker_id: 4,
                bookmaker_name: "Фонбет",
                value: 3.4,
                is_better: true
              }
            ],
            better_odds: {
              bookmaker_id: 4,
              bookmaker_name: "Фонбет",
              value: 3.4
            }
          }
        },
        totals: {
          "0.5": {
            over: {
              ml: 1.08,
              bookmaker_odds: [
                {
                  bookmaker_id: 4,
                  bookmaker_name: "Фонбет",
                  value: 1.12,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 4,
                bookmaker_name: "Фонбет",
                value: 1.12
              }
            },
            under: {
              ml: 8.5,
              bookmaker_odds: [
                {
                  bookmaker_id: 4,
                  bookmaker_name: "Фонбет",
                  value: 9.0,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 4,
                bookmaker_name: "Фонбет",
                value: 9.0
              }
            }
          },
          "1.5": {
            over: {
              ml: 1.25,
              bookmaker_odds: [
                {
                  bookmaker_id: 4,
                  bookmaker_name: "Фонбет",
                  value: 1.30,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 4,
                bookmaker_name: "Фонбет",
                value: 1.30
              }
            },
            under: {
              ml: 3.8,
              bookmaker_odds: [
                {
                  bookmaker_id: 4,
                  bookmaker_name: "Фонбет",
                  value: 4.0,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 4,
                bookmaker_name: "Фонбет",
                value: 4.0
              }
            }
          },
          "2.5": {
            over: {
              ml: 1.75,
              bookmaker_odds: [
                {
                  bookmaker_id: 4,
                  bookmaker_name: "Фонбет",
                  value: 1.85,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 4,
                bookmaker_name: "Фонбет",
                value: 1.85
              }
            },
            under: {
              ml: 2.1,
              bookmaker_odds: [
                {
                  bookmaker_id: 4,
                  bookmaker_name: "Фонбет",
                  value: 2.2,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 4,
                bookmaker_name: "Фонбет",
                value: 2.2
              }
            }
          },
          "3.5": {
            over: {
              ml: 3.6,
              bookmaker_odds: [
                {
                  bookmaker_id: 4,
                  bookmaker_name: "Фонбет",
                  value: 3.8,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 4,
                bookmaker_name: "Фонбет",
                value: 3.8
              }
            },
            under: {
              ml: 1.35,
              bookmaker_odds: [
                {
                  bookmaker_id: 4,
                  bookmaker_name: "Фонбет",
                  value: 1.40,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 4,
                bookmaker_name: "Фонбет",
                value: 1.40
              }
            }
          }
        }
      }
    },
    {
      match_id: "demo_match_2",
      mapping_info: {
        confidence: "high",
        match_reason: "demo_data",
        merged_at: new Date().toISOString()
      },
      match_basic: {
        date: tomorrowStr,
        time: "17:30",
        league: {
          fbref_name: "La Liga",
          api_name: "La Liga",
          api_id: 140,
          country: "Spain",
          logo: "https://media.api-sports.io/football/leagues/140.png",
          flag: "https://media.api-sports.io/flags/es.svg"
        },
        venue: {
          id: 2,
          name: "Santiago Bernabéu",
          city: "Madrid"
        },
        home_team: {
          fbref_id: "demo3",
          fbref_name: "Real Madrid",
          api_name: "Real Madrid",
          api_id: 541,
          logo: "https://media.api-sports.io/football/teams/541.png"
        },
        away_team: {
          fbref_id: "demo4",
          fbref_name: "Barcelona",
          api_name: "Barcelona",
          api_id: 529,
          logo: "https://media.api-sports.io/football/teams/529.png"
        }
      },
      events: {
        "1x2": {
          P1: {
            ml: 1.9,
            bookmaker_odds: [
              {
                bookmaker_id: 2,
                bookmaker_name: "Винлайн",
                value: 2.0,
                is_better: true
              }
            ],
            better_odds: {
              bookmaker_id: 2,
              bookmaker_name: "Винлайн",
              value: 2.0
            }
          },
          X: {
            ml: 3.8,
            bookmaker_odds: [
              {
                bookmaker_id: 2,
                bookmaker_name: "Винлайн",
                value: 4.0,
                is_better: true
              }
            ],
            better_odds: {
              bookmaker_id: 2,
              bookmaker_name: "Винлайн",
              value: 4.0
            }
          },
          P2: {
            ml: 3.5,
            bookmaker_odds: [
              {
                bookmaker_id: 2,
                bookmaker_name: "Винлайн",
                value: 3.7,
                is_better: true
              }
            ],
            better_odds: {
              bookmaker_id: 2,
              bookmaker_name: "Винлайн",
              value: 3.7
            }
          }
        },
        totals: {
          "0.5": {
            over: {
              ml: 1.05,
              bookmaker_odds: [
                {
                  bookmaker_id: 2,
                  bookmaker_name: "Винлайн",
                  value: 1.08,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 2,
                bookmaker_name: "Винлайн",
                value: 1.08
              }
            },
            under: {
              ml: 12.0,
              bookmaker_odds: [
                {
                  bookmaker_id: 2,
                  bookmaker_name: "Винлайн",
                  value: 13.0,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 2,
                bookmaker_name: "Винлайн",
                value: 13.0
              }
            }
          },
          "1.5": {
            over: {
              ml: 1.30,
              bookmaker_odds: [
                {
                  bookmaker_id: 2,
                  bookmaker_name: "Винлайн",
                  value: 1.35,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 2,
                bookmaker_name: "Винлайн",
                value: 1.35
              }
            },
            under: {
              ml: 3.5,
              bookmaker_odds: [
                {
                  bookmaker_id: 2,
                  bookmaker_name: "Винлайн",
                  value: 3.7,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 2,
                bookmaker_name: "Винлайн",
                value: 3.7
              }
            }
          },
          "2.5": {
            over: {
              ml: 1.90,
              bookmaker_odds: [
                {
                  bookmaker_id: 2,
                  bookmaker_name: "Винлайн",
                  value: 2.0,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 2,
                bookmaker_name: "Винлайн",
                value: 2.0
              }
            },
            under: {
              ml: 1.95,
              bookmaker_odds: [
                {
                  bookmaker_id: 2,
                  bookmaker_name: "Винлайн",
                  value: 2.05,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 2,
                bookmaker_name: "Винлайн",
                value: 2.05
              }
            }
          },
          "3.5": {
            over: {
              ml: 4.2,
              bookmaker_odds: [
                {
                  bookmaker_id: 2,
                  bookmaker_name: "Винлайн",
                  value: 4.4,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 2,
                bookmaker_name: "Винлайн",
                value: 4.4
              }
            },
            under: {
              ml: 1.28,
              bookmaker_odds: [
                {
                  bookmaker_id: 2,
                  bookmaker_name: "Винлайн",
                  value: 1.32,
                  is_better: true
                }
              ],
              better_odds: {
                bookmaker_id: 2,
                bookmaker_name: "Винлайн",
                value: 1.32
              }
            }
          }
        }
      }
    }
  ]
}