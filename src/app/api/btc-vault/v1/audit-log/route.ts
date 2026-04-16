import { NextRequest } from 'next/server'
import { z } from 'zod'

import { handleApiError, queryParam } from '@/app/api/utils/helpers'
import type { PaginationResponse } from '@/app/api/utils/types'

import { BtcVaultAuditLogQuerySchema } from '../schemas'
import { fetchBtcVaultAuditLogPage } from './action'

/**
 * GET /api/btc-vault/v1/audit-log
 * Paginated audit log from The Graph subgraph (`btcVaultLogs`).
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams
    const qp = queryParam(searchParams)

    const parsed = BtcVaultAuditLogQuerySchema.parse({
      limit: qp('limit'),
      page: qp('page'),
      sort_field: qp('sort_field') || undefined,
      sort_direction: qp('sort_direction') || undefined,
      type: searchParams.getAll('type'),
      role: searchParams.getAll('role'),
      show: searchParams.getAll('show'),
    })

    const { data, total } = await fetchBtcVaultAuditLogPage(parsed)

    const totalPages = Math.ceil(total / parsed.limit) || 1
    const offset = (parsed.page - 1) * parsed.limit
    const pagination: PaginationResponse = {
      page: parsed.page,
      limit: parsed.limit,
      offset,
      total,
      totalPages,
      sort_field: parsed.sort_field ?? 'natural',
      sort_direction: parsed.sort_direction ?? 'desc',
    }

    return new Response(
      JSON.stringify({ data, pagination }, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, no-store, must-revalidate',
        },
      },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: 'Validation failed', details: error.flatten() },
        { status: 400 },
      )
    }
    return handleApiError(error, 'BTC vault audit log route')
  }
}
