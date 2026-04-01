import { connection, NextRequest, NextResponse } from 'next/server'
import { isAddress } from 'viem'

import { BACKER_TO_BUILDER_COLUMNS } from '@/app/api/db/constants'
import { paginateQuery } from '@/app/api/utils/paginateQuery'
import { parsePaginationParams } from '@/app/api/utils/parsePaginationParams'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ backer: string }> }) {
  await connection()
  const { backer } = await params

  if (!isAddress(backer)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  try {
    const paginationResult = parsePaginationParams(req.url || '', BACKER_TO_BUILDER_COLUMNS)

    if (!paginationResult.success) {
      return NextResponse.json(
        { error: paginationResult.error.message },
        { status: paginationResult.error.statusCode },
      )
    }

    const { page, pageSize, sortDirection, sortBy } = paginationResult.data

    const baseQuery = db('BackerToBuilder')
      .select(BACKER_TO_BUILDER_COLUMNS)
      .where('BackerToBuilder.backer', '=', backer.toLowerCase())

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
