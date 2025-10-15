import { NextRequest, NextResponse } from 'next/server'

const BUCKET_URL = 'https://storage.yandexcloud.net/screen-shared'

// Cache configuration
export const revalidate = 300 // 5 minutes cache

/**
 * API proxy для обхода блокировок Yandex Cloud Storage российскими провайдерами.
 *
 * Этот эндпоинт проксирует запросы к S3, позволяя обойти блокировки на уровне провайдера,
 * так как запросы идут через домен приложения, а не напрямую к yandexcloud.net
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const action = searchParams.get('action') // 'list' or 'fetch'

    if (!path) {
      return NextResponse.json(
        { error: 'Missing path parameter' },
        { status: 400 }
      )
    }

    // List files in S3 folder
    if (action === 'list') {
      const listUrl = `${BUCKET_URL}/?list-type=2&prefix=${encodeURIComponent(path)}`

      console.log(`[S3 Proxy] Listing files: ${listUrl}`)

      const response = await fetch(listUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml',
          'User-Agent': 'Coefly-App/1.0'
        },
        // Важно: не передаём credentials для публичного S3
        cache: 'no-store' // Отключаем кэш для списков файлов
      })

      if (!response.ok) {
        console.error(`[S3 Proxy] List failed: ${response.status} ${response.statusText}`)
        return NextResponse.json(
          { error: `S3 request failed: ${response.statusText}` },
          { status: response.status }
        )
      }

      const xmlText = await response.text()

      return new NextResponse(xmlText, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Fetch individual file
    const fileUrl = path.startsWith('http') ? path : `${BUCKET_URL}/${path}`

    console.log(`[S3 Proxy] Fetching file: ${fileUrl}`)

    const response = await fetch(fileUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Coefly-App/1.0'
      },
      // Кэшируем файлы на 5 минут
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }

      console.error(`[S3 Proxy] Fetch failed: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `S3 request failed: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('[S3 Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Internal proxy error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Enable CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
