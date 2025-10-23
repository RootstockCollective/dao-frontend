import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paginateQuery } from '@/app/api/utils/paginateQuery'
import { parsePaginationParams } from '@/app/api/utils/parsePaginationParams'
import { CYCLE_COLUMNS } from '@/app/api/db/constants'

export async function GET(req: Request) {
  try {
    const paginationResult = parsePaginationParams(req.url || '', CYCLE_COLUMNS)

    if (!paginationResult.success) {
      return NextResponse.json(
        { error: paginationResult.error.message },
        { status: paginationResult.error.statusCode },
      )
    }

    const { page, pageSize, sortDirection, sortBy } = paginationResult.data

    const baseQuery = db('Cycle')
      .select(CYCLE_COLUMNS)
      .innerJoin('CycleRewardPerToken', 'Cycle.id', '=', 'CycleRewardPerToken.cycle')
      .select({
        rewardPerToken: db.raw(`
        COALESCE(
          json_object_agg(convert_from("CycleRewardPerToken"."token", 'utf8'), "CycleRewardPerToken"."amount"::text),
          '{}'
        )
      `),
      })
      .groupBy('Cycle.id')

    const { data, count } = await paginateQuery(baseQuery, {
      page,
      pageSize,
      sortBy,
      sortDirection,
    })

    return NextResponse.json({ data, count, page, pageSize })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
