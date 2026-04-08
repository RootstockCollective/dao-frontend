import { NextRequest, NextResponse } from 'next/server'

import { fetchPrices } from '@/app/user/Balances/actions'
import { logger } from '@/lib/logger'

/**
 * Cache prices for 5 minutes (matches CoinMarketCap revalidation window)
 */
export const revalidate = 300

/**
 * GET /api/prices
 *
 * Returns current token prices so local consumers can fetch them
 * without requiring their own CoinMarketCap API key.
 *
 * Rejects requests with `X-Prices-Source: fallback` to prevent circular
 * loops when a local instance has PRICES_API_URL pointing back to itself.
 */
export async function GET(request: NextRequest) {
  if (request.headers.get('X-Prices-Source') === 'fallback') {
    logger.warn(
      { route: '/api/prices' },
      'Circular fallback detected — PRICES_API_URL points back to this instance',
    )
    return NextResponse.json(
      { error: 'Circular fallback detected. Check PRICES_API_URL configuration.' },
      { status: 508 },
    )
  }

  try {
    const prices = await fetchPrices()
    return NextResponse.json(prices)
  } catch (error) {
    logger.error({ err: error, route: '/api/prices' }, 'Error fetching prices')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch prices' },
      { status: 500 },
    )
  }
}
