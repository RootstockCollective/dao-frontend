import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Address, isAddress } from 'viem'
import { parsePaginationParams } from '@/app/api/utils/parsePaginationParams'
import { TX_HISTORY_COLUMNS } from '@/app/api/db/constants'

export async function GET(req: Request, { params }: { params: Promise<{ backer: Address }> }) {
  const { backer } = await params

  if (!isAddress(backer)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  try {
    const paginationResult = parsePaginationParams(req.url || '', TX_HISTORY_COLUMNS)

    if (!paginationResult.success) {
      return NextResponse.json(
        { error: paginationResult.error.message },
        { status: paginationResult.error.statusCode },
      )
    }

    const { page, pageSize, sortBy, sortDirection } = paginationResult.data

    const allocationHistory = db('AllocationHistory')
      .select(
        'id',
        db.raw("'Back' as type"),
        'backer',
        'builder',
        'blockHash',
        'blockTimestamp',
        'cycleStart',
        'allocation',
        'increased',
        db.raw('NULL as amount'),
        db.raw('NULL as "rewardToken"'),
      )
      .where('backer', '=', backer.toLowerCase())

    const claimedRewardsHistory = db('ClaimedRewardsHistory')
      .select(
        'id',
        db.raw("'Claim' as type"),
        'backer',
        'builder',
        'blockHash',
        'blockTimestamp',
        'cycleStart',
        db.raw('NULL as allocation'),
        db.raw('NULL as increased'),
        'amount',
        'rewardToken',
      )
      .where('backer', '=', backer.toLowerCase())

    const combinedQuery = allocationHistory.union(claimedRewardsHistory)

    const data = await db
      .select('*')
      .from(db.raw(`(${combinedQuery.toString()}) as combined`))
      .orderBy(sortBy || 'blockTimestamp', sortDirection || 'desc')
      .limit(pageSize)

    const countResult = await db
      .count('* as count')
      .from(db.raw(`(${combinedQuery.toString()}) as combined`))
      .first()

    const count = Number(countResult?.count || 0)

    return NextResponse.json({
      data,
      count,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
