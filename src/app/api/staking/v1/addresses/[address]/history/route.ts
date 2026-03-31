import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fetchStakingHistoryFromSources } from '@/app/api/staking/v1/addresses/[address]/history/sources/fetchStakingHistoryFromSources'
import { handleApiError, queryParam } from '@/app/api/utils/helpers'
import type { PaginationResponse } from '@/app/api/utils/types'
import { AddressSchema, SortDirectionEnum } from '@/app/api/utils/validators'

const SortFieldEnum = z.enum(['period', 'amount', 'action'])
const QuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(200).default(20),
    offset: z.coerce.number().int().min(0).default(0),
    page: z.coerce.number().int().min(1).optional(), // optional convenience
    sort_field: SortFieldEnum.default('period'),
    sort_direction: SortDirectionEnum.default('desc'),
    type: z.array(z.enum(['stake', 'unstake'])).optional(), // Filter by action type
  })
  .transform(q => {
    const offset = q.page ? (q.page - 1) * q.limit : q.offset
    return { ...q, offset }
  })

export const revalidate = 60

/**
 * GET `/api/staking/v1/addresses/:address/history` — paginated staking history with multi-source fallback.
 * Response: `{ data, pagination }`.
 * Headers: `X-Source` = `source-0` | `source-1` (index); `x-source-name` = `database` | `blockscout`.
 */
export async function GET(req: NextRequest, context: { params: Promise<{ address: string }> }) {
  try {
    const { address: addressParam } = await context.params
    const address = AddressSchema.parse(addressParam).toLowerCase()
    const searchParams = new URL(req.url).searchParams
    const qp = queryParam(searchParams)
    const typeParams = searchParams.getAll('type').filter(v => v !== '')

    const parsed = QuerySchema.parse({
      limit: qp('limit'),
      offset: qp('offset'),
      page: qp('page'),
      sort_field: qp('sort_field'),
      sort_direction: qp('sort_direction'),
      type: typeParams.length > 0 ? typeParams : undefined,
    })

    const {
      data: stakingHistory,
      total,
      sourceName,
      sourceIndex,
    } = await fetchStakingHistoryFromSources({
      address,
      limit: parsed.limit,
      offset: parsed.offset,
      sort_field: parsed.sort_field,
      sort_direction: parsed.sort_direction,
      type: parsed.type,
    })

    const pagination: PaginationResponse = {
      limit: parsed.limit,
      offset: parsed.offset,
      page: Math.floor(parsed.offset / parsed.limit) + 1,
      sort_field: parsed.sort_field,
      sort_direction: parsed.sort_direction,
      total,
    }
    return Response.json(
      {
        data: stakingHistory,
        pagination,
      },
      {
        headers: {
          'X-Source': `source-${sourceIndex}`,
          'x-source-name': sourceName,
        },
      },
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: err.flatten() }, { status: 400 })
    }
    return handleApiError(err, 'staking history route')
  }
}
