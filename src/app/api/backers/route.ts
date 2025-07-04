import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paginateQuery } from '@/app/api/utils/paginationQuery'
import { parsePaginationParams } from '@/app/api/utils/pagination'

export async function GET(req: Request) {
  try {
    const { page, pageSize } = parsePaginationParams(req.url || '')

    const baseQuery = db('Backer').where('totalAllocation', '>', 0)
    const { data, count } = await paginateQuery(baseQuery, page, pageSize)

    return NextResponse.json({ data, count, page, pageSize })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
