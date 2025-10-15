import { Match } from './types'

const BUCKET_URL = 'https://storage.yandexcloud.net/screen-shared'
const FOLDER_PATH = 'merged-matches'

// Использовать прокси для обхода блокировок мобильных операторов
const USE_PROXY = false // Отключаем прокси - используем прямой доступ к S3
const PROXY_ENDPOINT = '/api/s3-proxy'

export async function fetchFileWithFallback(filePath: string): Promise<Match | null> {
  try {
    let url: string

    if (USE_PROXY) {
      // Через прокси - обходим блокировки провайдеров
      url = `${PROXY_ENDPOINT}?path=${encodeURIComponent(filePath)}`
    } else {
      // Прямой запрос к S3 (может блокироваться)
      url = filePath.startsWith('http') ? filePath : `${BUCKET_URL}/${filePath}`
    }

    const response = await fetch(url)
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${filePath}:`, error)
    return null
  }
}

export async function getS3FileList(bucketUrl: string, prefix: string): Promise<string[] | null> {
  try {
    let listUrl: string

    if (USE_PROXY) {
      // Через прокси - обходим блокировки провайдеров
      listUrl = `${PROXY_ENDPOINT}?action=list&path=${encodeURIComponent(prefix)}`
      console.log(`🗂️ Using proxy for S3 ListObjects: ${prefix}`)
    } else {
      // Прямой запрос к S3 (может блокироваться)
      listUrl = `${bucketUrl}/?list-type=2&prefix=${encodeURIComponent(prefix)}`
      console.log(`🗂️ Direct S3 ListObjects: ${listUrl}`)
    }

    const response = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const xmlText = await response.text()

    // Parse XML using regex (works on both client and server)
    // Check for errors
    if (xmlText.includes('<Error>')) {
      const codeMatch = xmlText.match(/<Code>(.*?)<\/Code>/)
      const code = codeMatch ? codeMatch[1] : 'Unknown'
      throw new Error(`S3 Error: ${code}`)
    }

    // Extract files using regex
    const keyMatches = xmlText.matchAll(/<Key>(.*?)<\/Key>/g)
    const files: string[] = []

    for (const match of keyMatches) {
      const key = match[1]
      if (key && key.endsWith('.json')) {
        files.push(key)
      }
    }

    console.log(`✅ S3 API returned ${files.length} files`)
    return files

  } catch (error) {
    console.log(`❌ S3 API failed: ${error}`)
    return null
  }
}

export async function loadSampleData(): Promise<Match[]> {
  console.log('📦 Using fallback sample data')
  return generateFallbackData()
}

function getDateFolders(): string[] {
  const today = new Date()
  const folders: string[] = []

  // Generate date folders for today + 7 days forward
  for (let i = 0; i <= 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
    folders.push(`${FOLDER_PATH}/${dateStr}`)
  }

  return folders
}

export async function loadMatchesFromS3(): Promise<Match[]> {
  try {
    const dateFolders = getDateFolders()
    console.log(`🗓️ Searching for matches in date folders: ${dateFolders.map(f => f.split('/').pop()).join(', ')}`)

    const allFiles: string[] = []

    // Get files from each date folder
    for (const folder of dateFolders) {
      const fileList = await getS3FileList(BUCKET_URL, folder + '/')
      if (fileList && fileList.length > 0) {
        console.log(`📁 Found ${fileList.length} files in ${folder.split('/').pop()}`)
        allFiles.push(...fileList)
      }
    }

    if (allFiles.length === 0) {
      console.log('No S3 files found in date range, falling back to sample data')
      return await loadSampleData()
    }

    console.log(`Found ${allFiles.length} total files, loading...`)

    // Load files in batches to avoid overwhelming the browser
    const BATCH_SIZE = 20
    const allMatches: Match[] = []

    for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
      const batch = allFiles.slice(i, i + BATCH_SIZE)
      const promises = batch.map(async (filePath) => {
        // fetchFileWithFallback теперь автоматически использует прокси, если USE_PROXY = true
        return await fetchFileWithFallback(filePath)
      })

      const results = await Promise.all(promises)
      const validMatches = results.filter((data): data is Match =>
        data !== null && !!data.match_basic && !!data.events
      )

      allMatches.push(...validMatches)
      console.log(`Loaded batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allFiles.length / BATCH_SIZE)}: ${validMatches.length} matches`)
    }

    console.log(`Loaded ${allMatches.length} total matches from S3`)
    return allMatches

  } catch (error) {
    console.error('Error loading from S3:', error)
    console.log('Fallback to sample data')
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