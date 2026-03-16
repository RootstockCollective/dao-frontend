import { NextRequest } from 'next/server'
import { z } from 'zod'

import {
  getBtcVaultHistory,
  getBtcVaultHistoryCount,
} from '@/app/api/btc-vault/v1/addresses/[address]/history/action'
import { handleApiError, queryParam } from '@/app/api/utils/helpers'
import type { PaginationResponse } from '@/app/api/utils/types'
import { AddressSchema, SortDirectionEnum } from '@/app/api/utils/validators'

const SortFieldEnum = z.enum(['timestamp', 'assets'])
const ActionTypeEnum = z.enum([
  'deposit_request',
  'deposit_claimed',
  'deposit_cancelled',
  'redeem_request',
  'redeem_claimed',
  'redeem_cancelled',
])
const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(20),
  page: z.coerce.number().int().min(1).default(1),
  sort_field: SortFieldEnum.default('timestamp'),
  sort_direction: SortDirectionEnum.default('desc'),
  type: z.array(ActionTypeEnum).optional(),
})

export const revalidate = 60

export async function GET(req: NextRequest, context: { params: Promise<{ address: string }> }) {
  try {
    const { address: addressParam } = await context.params
    const address = AddressSchema.parse(addressParam).toLowerCase()
    const searchParams = new URL(req.url).searchParams
    const qp = queryParam(searchParams)

    const typeParams = searchParams.getAll('type').filter(v => v !== '')

    const parsed = QuerySchema.parse({
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

    return Response.json({ data, pagination })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: err.flatten() }, { status: 400 })
    }
    return handleApiError(err, 'btc vault history route')
  }
}
