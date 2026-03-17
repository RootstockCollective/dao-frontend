import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  getBtcVaultHistory,
  getBtcVaultHistoryCount,
} from '@/app/api/btc-vault/v1/addresses/[address]/history/action'
import { BtcVaultAddressHistoryQuerySchema } from '@/app/api/btc-vault/v1/schemas'
import { handleApiError, queryParam } from '@/app/api/utils/helpers'
import type { PaginationResponse } from '@/app/api/utils/types'
import { AddressSchema } from '@/app/api/utils/validators'

export const revalidate = 60

/**
 * GET /api/btc-vault/v1/addresses/:address/history
 * Returns paginated BTC vault history for the given address.
 * No auth required.
 *
 * Path: address (ethereum address). Query params: limit (1–200, default 20), page (default 1),
 * sort_field (timestamp | assets), sort_direction (asc | desc), type[] (optional action filter).
 * Response: { data: BtcVaultHistoryItem[], pagination: PaginationResponse }.
 * 400 on validation error (body includes error, details); 500 on server error.
 */
export async function GET(req: NextRequest, context: { params: Promise<{ address: string }> }) {
  try {
    const { address: addressParam } = await context.params
    const address = AddressSchema.parse(addressParam).toLowerCase()
    const searchParams = new URL(req.url).searchParams
    const qp = queryParam(searchParams)

    const typeParams = searchParams.getAll('type').filter(v => v !== '')

    const parsed = BtcVaultAddressHistoryQuerySchema.parse({
      limit: qp('limit'),
      page: qp('page'),
      sort_field: qp('sort_field'),
      sort_direction: qp('sort_direction'),
      type: typeParams.length > 0 ? typeParams : undefined,
    })

    const data = await getBtcVaultHistory({
      address,
      limit: parsed.limit,
      page: parsed.page,
      sort_field: parsed.sort_field,
      sort_direction: parsed.sort_direction,
      type: parsed.type,
    })
    const total = await getBtcVaultHistoryCount(address, parsed.type)
    const totalPages = Math.ceil(total / parsed.limit)
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

    return NextResponse.json({ data, pagination })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.flatten() },
        { status: 400 },
      )
    }
    return handleApiError(error, 'btc vault history route')
  }
}
