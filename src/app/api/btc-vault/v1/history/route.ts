import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { handleApiError, queryParam } from '@/app/api/utils/helpers'
import type { PaginationResponse } from '@/app/api/utils/types'

import { BtcVaultGlobalHistoryQuerySchema } from '../schemas'
import { enrichHistoryWithRequestStatus, getBtcVaultHistoryCount, getGlobalBtcVaultHistory } from './action'

export const revalidate = 60

/**
 * GET /api/btc-vault/v1/history
 * Returns paginated BTC vault history (global or filtered by address).
 * No auth required.
 *
 * Query params: limit (1–200, default 20), page (default 1), sort_field (timestamp | assets),
 * sort_direction (asc | desc), type[] (optional action filter), address (optional; when omitted, returns global history).
 * Response: { data: BtcVaultHistoryItemWithStatus[], pagination: PaginationResponse }.
 * Each item may include displayStatus for table display (ready_to_claim, ready_to_withdraw, pending, successful, cancelled).
 * 400 on validation error (body includes error, details); 500 on server error.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams
    const qp = queryParam(searchParams)

    const typeParams = searchParams.getAll('type').filter(v => v !== '')

    const parsed = BtcVaultGlobalHistoryQuerySchema.parse({
      limit: qp('limit'),
      page: qp('page'),
      sort_field: qp('sort_field'),
      sort_direction: qp('sort_direction'),
      type: typeParams.length > 0 ? typeParams : undefined,
      address: qp('address'),
    })

    const address = parsed.address?.toLowerCase()

    const rawData = await getGlobalBtcVaultHistory({
      limit: parsed.limit,
      page: parsed.page,
      sort_field: parsed.sort_field,
      sort_direction: parsed.sort_direction,
      type: parsed.type,
      address,
    })
    const data = await enrichHistoryWithRequestStatus(rawData)
    const total = await getBtcVaultHistoryCount(address ?? 'global', parsed.type)
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
    return handleApiError(error, 'btc vault global history route')
  }
}
