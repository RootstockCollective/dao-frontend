import { NextResponse } from 'next/server'

import { handleApiError } from '@/app/api/utils/helpers'
import type { PaginationResponse } from '@/app/api/utils/types'

import { fetchBtcVaultNavHistoryPage } from './action'

export const revalidate = 20
/**
 * GET /api/btc-vault/v1/nav-history
 * Returns every BTC vault NAV history row in one response (no query params).
 * `pagination` is kept in the payload for backwards-compatibility and always
 * reports a single page containing everything.
 */
export async function GET() {
  try {
    const { data, total } = await fetchBtcVaultNavHistoryPage()

    const pagination: PaginationResponse = {
      page: 1,
      limit: total,
      offset: 0,
      total,
      totalPages: 1,
      sort_field: 'processedAt',
      sort_direction: 'desc',
    }

    return NextResponse.json(
      { data, pagination },
      {
        headers: {
          'Cache-Control': 'private, no-store, must-revalidate',
        },
      },
    )
  } catch (error) {
    return handleApiError(error, 'btc vault nav history route')
  }
}
