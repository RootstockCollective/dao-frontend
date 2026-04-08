import { NextResponse } from 'next/server'

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
 */
export async function GET() {
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
