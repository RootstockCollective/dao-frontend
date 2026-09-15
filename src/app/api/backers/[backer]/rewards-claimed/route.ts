import { NextRequest, NextResponse } from 'next/server'
import { isAddress } from 'viem'

import { BACKERS_REWARDS_CLAIMED_COLUMNS } from '@/app/api/db/constants'
import { paginateQuery } from '@/app/api/utils/paginateQuery'
import { parsePaginationParams } from '@/app/api/utils/parsePaginationParams'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest, { params }: { params: Promise<{ backer: string }> }) {
  const { backer } = await params
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!isAddress(backer)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }
  if (token && !isAddress(token)) {
    return NextResponse.json({ error: 'Invalid token address' }, { status: 400 })
  }

  try {
    const paginationResult = parsePaginationParams(req.url || '', BACKERS_REWARDS_CLAIMED_COLUMNS)

    if (!paginationResult.success) {
      return NextResponse.json(
        { error: paginationResult.error.message },
        { status: paginationResult.error.statusCode },
      )
    }

    const { page, pageSize, sortDirection, sortBy } = paginationResult.data

    const baseQuery = db('BackerToBuilderRewardsClaimed')
      .join('BackerToBuilder', 'BackerToBuilderRewardsClaimed.backerToBuilder', '=', 'BackerToBuilder.id')
      .select({
        id: 'BackerToBuilderRewardsClaimed.id',
        token: 'BackerToBuilderRewardsClaimed.token',
        amount: 'BackerToBuilderRewardsClaimed.amount',
        builder: 'BackerToBuilder.builder',
      })
      .where('BackerToBuilder.backer', '=', backer.toLowerCase())
      .modify(qb => {
        if (token) {
          qb.where('BackerToBuilderRewardsClaimed.token', '=', token.toLowerCase())
        }
      })

    const { data, count } = await paginateQuery(baseQuery, {
      page,
      pageSize,
      sortBy,
      sortDirection,
    })

    return NextResponse.json({ data, count, page, pageSize })
  } catch (err) {
    logger.error({ err, route: '/api/backers/[backer]/rewards-claimed' }, 'Database error')
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
