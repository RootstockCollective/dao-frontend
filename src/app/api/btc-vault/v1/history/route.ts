import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { handleApiError, queryParam } from '@/app/api/utils/helpers'
import type { PaginationResponse } from '@/app/api/utils/types'

import { BtcVaultGlobalHistoryQuerySchema } from '../schemas'
import { fetchBtcVaultHistoryPageAndEnrich } from './action'

export const revalidate = 20

/**
 * GET /api/btc-vault/v1/history
 * Returns paginated BTC vault history (global or filtered by address).
 * No auth required.
 *
 * Query params: limit (1–200, default 20), page (default 1), sort_field (timestamp | assets),
 * sort_direction (asc | desc), type[] (optional action filter), address (optional; when omitted, returns global history).
 * Response: { data: BtcVaultHistoryItemWithStatus[], pagination: PaginationResponse }.
 * Each item may include displayStatus for table display (open_to_claim, claim_pending, pending, successful, cancelled, approved).
 * When The Graph is unavailable, history is loaded from Blockscout (DAO-2106). Blockscout rows may use `action` values
 * `DEPOSIT_CLAIMABLE`, `REDEEM_ACCEPTED`, `REDEEM_CLAIMABLE` when epoch events are present (not only `*_REQUEST`).
 * List and `displayStatus` enrichment are **per-source** (Blockscout path uses on-chain `pending*` / `claimable*` reads via
 * multicall for request-like actions; falls back to action-only labels if RPC fails).
 *
 * Response headers (same pattern as GET /api/btc-vault/v1/epoch-history):
 * - `X-Source`: `the-graph` | `blockscout` when data was loaded successfully
 * - `X-Source-Errors`: semicolon-separated prior failures when fallback occurred (or unexpected errors)
 * 400 on validation error (body includes error, details); 500 when no source could return data.
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

    const { data, total, source, errors } = await fetchBtcVaultHistoryPageAndEnrich({
      limit: parsed.limit,
      page: parsed.page,
      sort_field: parsed.sort_field,
      sort_direction: parsed.sort_direction,
      type: parsed.type,
      address,
    })

    const headers: Record<string, string> = {}
    if (errors.length > 0) {
      headers['X-Source-Errors'] = errors.map(e => `${e.source}: ${e.message}`).join('; ')
    }

    if (source === null) {
      return NextResponse.json(
        { error: 'Cannot fetch BTC vault history from any source' },
        { status: 500, headers },
      )
    }
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

    headers['X-Source'] = source
    return NextResponse.json({ data, pagination }, { headers })
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
