import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paginateQuery } from '@/app/api/utils/paginateQuery'
import { parsePaginationParams } from '@/app/api/utils/parsePaginationParams'

export async function GET(req: Request) {
  try {
    const paginationResult = parsePaginationParams(req.url || '')

    if (!paginationResult.success) {
      return NextResponse.json(
        { error: paginationResult.error.message },
        { status: paginationResult.error.statusCode },
      )
    }

    const { page, pageSize } = paginationResult.data

    const baseQuery = db('Backer')
      .select('Backer.id', 'Backer.totalAllocation', 'Backer.isBlacklisted')
      .where('totalAllocation', '>', 0)
    const { data, count } = await paginateQuery(baseQuery, page, pageSize)

    return NextResponse.json({ data, count, page, pageSize })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
