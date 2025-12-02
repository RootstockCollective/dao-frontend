import {
  getStakingHistoryCountFromDB,
  getStakingHistoryFromDB,
} from '@/app/api/staking/v1/addresses/[address]/history/action'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const SortFieldEnum = z.enum(['period', 'amount', 'action'])
const SortDirectionEnum = z.enum(['asc', 'desc'])
const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address format')
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
    // If page is provided, compute offset = (page-1) * limit
    const offset = q.page ? (q.page - 1) * q.limit : q.offset
    return { ...q, offset }
  })

export const revalidate = 60

export async function GET(req: NextRequest, context: { params: Promise<{ address: string }> }) {
  try {
    const { address: addressParam } = await context.params
    const address = AddressSchema.parse(addressParam)
    const searchParams = new URL(req.url).searchParams
    const qp = (k: string) => {
      const v = searchParams.get(k)
      return v === null || v === '' ? undefined : v
    }

    // Handle multiple 'type' query params
    const typeParams = searchParams.getAll('type').filter(v => v !== '')

    const parsed = QuerySchema.parse({
      limit: qp('limit'),
      offset: qp('offset'),
      page: qp('page'),
      sort_field: qp('sort_field'),
      sort_direction: qp('sort_direction'),
      type: typeParams.length > 0 ? typeParams : undefined,
    })

    const stakingHistory = await getStakingHistoryFromDB({
      address,
      limit: parsed.limit,
      offset: parsed.offset,
      sort_field: parsed.sort_field,
      sort_direction: parsed.sort_direction,
      type: parsed.type,
    })
    const total = await getStakingHistoryCountFromDB(address, parsed.type)
    return Response.json({
      data: stakingHistory,
      pagination: {
        limit: parsed.limit,
        offset: parsed.offset,
        page: Math.floor(parsed.offset / parsed.limit) + 1,
        sort_field: parsed.sort_field,
        sort_direction: parsed.sort_direction,
        total,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: err.flatten() }, { status: 400 })
    }
    console.error(err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
