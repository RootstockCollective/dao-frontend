import { NextRequest } from 'next/server'
import { z } from 'zod'

import { handleApiError, queryParam } from '@/app/api/utils/helpers'
import type { PaginationResponse } from '@/app/api/utils/types'
import { AddressSchema, SortDirectionEnum } from '@/app/api/utils/validators'

import { getBtcVaultHistoryCount, getGlobalBtcVaultHistory } from './action'

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
  address: AddressSchema.optional(),
})

export const revalidate = 60

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams
    const qp = queryParam(searchParams)

    const typeParams = searchParams.getAll('type').filter(v => v !== '')

    const parsed = QuerySchema.parse({
      limit: qp('limit'),
      page: qp('page'),
      sort_field: qp('sort_field'),
      sort_direction: qp('sort_direction'),
      type: typeParams.length > 0 ? typeParams : undefined,
      address: qp('address'),
    })

    const address = parsed.address?.toLowerCase()

    const data = await getGlobalBtcVaultHistory({
      limit: parsed.limit,
      page: parsed.page,
      sort_field: parsed.sort_field,
      sort_direction: parsed.sort_direction,
      type: parsed.type,
      address,
    })
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

    return Response.json({ data, pagination })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: err.flatten() }, { status: 400 })
    }
    return handleApiError(err, 'btc vault global history route')
  }
}
