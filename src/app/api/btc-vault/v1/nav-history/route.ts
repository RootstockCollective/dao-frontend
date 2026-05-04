import { type NextRequest, NextResponse } from 'next/server'

import { BtcVaultNavHistoryQuerySchema } from '@/app/api/btc-vault/v1/schemas'
import { handleApiError } from '@/app/api/utils/helpers'
import type { PaginationResponse } from '@/app/api/utils/types'

import { fetchBtcVaultNavHistoryPage } from './action'

/** Query affects body; disable static/full-route caching so sort/pagination stays correct per URL. */
export const dynamic = 'force-dynamic'
export const revalidate = 20
/**
 * GET /api/btc-vault/v1/nav-history
 * Supports pagination and sort mirroring {@link BtcVaultNavHistoryQuerySchema}.
 */
export async function GET(request: NextRequest) {
  try {
    const queryObject = Object.fromEntries(request.nextUrl.searchParams.entries())
    const parsed = BtcVaultNavHistoryQuerySchema.safeParse(queryObject)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      )
    }

    const { page, limit, sort_field, sort_direction } = parsed.data
    const { data, total } = await fetchBtcVaultNavHistoryPage({
      page,
      limit,
      sort_field,
      sort_direction,
    })
    const offset = (page - 1) * limit
    const totalPages = Math.max(1, Math.ceil(total / limit))

    const pagination: PaginationResponse = {
      page,
      limit,
      offset,
      total,
      totalPages,
      sort_field,
      sort_direction,
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
