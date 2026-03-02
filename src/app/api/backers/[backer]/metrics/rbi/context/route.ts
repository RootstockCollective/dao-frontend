import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAddress } from 'viem'

const DB_COMMAND_COALESCE = `
  COALESCE(
    json_agg(
      json_build_object(
      'gauge', convert_from("GaugeStakingHistory".gauge, 'utf8'), 
      'accumulatedAllocationsTime', "GaugeStakingHistory"."accumulatedAllocationsTime"::text,
      'allocation', "GaugeStakingHistory"."allocation"::text,
      'lastBlockTimestamp', "GaugeStakingHistory"."lastBlockTimestamp"::text
      )
    ), 
  '[]')
`

export async function GET(req: Request, { params }: { params: Promise<{ backer: string }> }) {
  const { backer } = await params

  if (!isAddress(backer)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  try {
    const result = await db('BackerStakingHistory')
      .join('GaugeStakingHistory', 'BackerStakingHistory.id', '=', 'GaugeStakingHistory.backer')
      .select(
        'BackerStakingHistory.id',
        'BackerStakingHistory.backerTotalAllocation',
        'BackerStakingHistory.accumulatedTime',
        'BackerStakingHistory.lastBlockTimestamp',
        { gauges: db.raw(DB_COMMAND_COALESCE) },
      )
      .where('BackerStakingHistory.id', '=', backer.toLowerCase())
      .groupBy('BackerStakingHistory.id')
      .first()

    if (!result) {
      return NextResponse.json({ error: 'Backer not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (err) {
    logger.error({ err, route: '/api/backers/[backer]/metrics/rbi/context' }, 'Database error')
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
