import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { handleApiError, queryParam } from '@/app/api/utils/helpers'
import type { PaginationResponse } from '@/app/api/utils/types'

import { BtcVaultWhitelistRoleHistoryQuerySchema } from '../schemas'
import { fetchBtcVaultWhitelistedUsersPage } from './action'

/**
 * GET /api/btc-vault/v1/whitelist-role-history
 * Paginated BTC vault whitelist state from subgraph `btcVaultWhitelistedUsers`.
 *
 * Query: limit (1–200, default 20), page (default 1),
 * sort_field (lastUpdated | account | status), sort_direction (asc | desc).
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams
    const qp = queryParam(searchParams)

    const parsed = BtcVaultWhitelistRoleHistoryQuerySchema.parse({
      limit: qp('limit'),
      page: qp('page'),
      sort_field: qp('sort_field'),
      sort_direction: qp('sort_direction'),
    })

    const { data, total } = await fetchBtcVaultWhitelistedUsersPage({
      limit: parsed.limit,
      page: parsed.page,
      sort_field: parsed.sort_field,
      sort_direction: parsed.sort_direction,
    })

    const totalPages = Math.ceil(total / parsed.limit) || 1
    const offset = (parsed.page - 1) * parsed.limit
    const pagination: PaginationResponse = {
      page: parsed.page,
      limit: parsed.limit,
      offset,
      total,
      totalPages,
      sort_field: parsed.sort_field,
      sort_direction: parsed.sort_direction,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.flatten() },
        { status: 400 },
      )
    }
    return handleApiError(error, 'btc vault whitelist role history route')
  }
}
