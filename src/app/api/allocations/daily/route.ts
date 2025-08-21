import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paginateQuery } from '@/app/api/utils/paginateQuery'
import { parsePaginationParams } from '@/app/api/utils/parsePaginationParams'
import { sortConfig } from './sortConfig'

export async function GET(req: Request) {
  try {
    const { allowedColumns, castedSortFieldsMap } = sortConfig

    const paginationResult = parsePaginationParams(req.url || '', allowedColumns)

    if (!paginationResult.success) {
      return NextResponse.json(
        { error: paginationResult.error.message },
        { status: paginationResult.error.statusCode },
      )
    }

    const { page, pageSize, sortDirection, sortBy } = paginationResult.data

    const baseQuery = db('DailyAllocation').select('id', 'day', 'totalAllocation')

    const { data, count } = await paginateQuery(baseQuery, {
      page,
      pageSize,
      sortBy,
      sortDirection,
      castedSortFieldsMap,
    })

    return NextResponse.json({ data, count, page, pageSize })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
