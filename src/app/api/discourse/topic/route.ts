import { NextRequest, NextResponse } from 'next/server'
import { extractTopicIdFromDiscourseUrl, getDiscourseTopicApiUrl } from '@/lib/discourse'

/**
 * Discourse API route to fetch topic data
 *
 * This route proxies requests to Discourse to avoid CORS issues.
 *
 * Query parameters:
 * - url: The full Discourse topic URL (e.g., https://gov.rootstockcollective.xyz/t/topic-name/123)
 * - topicId: The topic ID (alternative to url parameter)
 *
 * Example:
 * GET /api/discourse/topic?url=https://gov.rootstockcollective.xyz/t/topic-name/123
 * GET /api/discourse/topic?topicId=123
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const discourseUrl = searchParams.get('url')
  const topicIdParam = searchParams.get('topicId')

  let topicId: number | null = null

  // Extract topic ID from URL or use provided topicId
  if (discourseUrl) {
    topicId = extractTopicIdFromDiscourseUrl(discourseUrl)
  } else if (topicIdParam) {
    topicId = parseInt(topicIdParam, 10)
    if (isNaN(topicId)) {
      topicId = null
    }
  }

  if (!topicId) {
    return NextResponse.json(
      { error: 'Invalid Discourse URL or topic ID. Provide either "url" or "topicId" query parameter.' },
      { status: 400 },
    )
  }

  try {
    const apiUrl = getDiscourseTopicApiUrl(topicId)

    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'RootstockCollective-DAO-Frontend',
      },
      // Add cache control to reduce load on Discourse
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
      }

      return NextResponse.json(
        { error: `Discourse API error: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error fetching Discourse topic:', error)
    return NextResponse.json({ error: 'Failed to fetch Discourse topic data' }, { status: 500 })
  }
}
