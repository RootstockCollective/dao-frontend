import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Address } from 'viem'

const coalesce = `
  COALESCE(
    json_agg(
      json_build_object('gauge_', convert_from("GaugeStakingHistory".gauge, 'utf8'), 
      'accumulatedAllocationsTime_', "GaugeStakingHistory"."accumulatedAllocationsTime",
      'allocation_', "GaugeStakingHistory"."allocation",
      'lastBlockTimestamp_', "GaugeStakingHistory"."lastBlockTimestamp"
      )
    ), 
  '[]')
`

export async function GET(request: NextRequest, { params }: { params: Promise<{ backer: Address }> }) {
  const { backer } = await params

  try {
    const result = await db('BackerStakingHistory')
      .join('GaugeStakingHistory', 'BackerStakingHistory.id', '=', 'GaugeStakingHistory.backer')
      .select(
        { id: db.raw(`convert_from("BackerStakingHistory".id, 'utf8')`) },
        { backerTotalAllocation_: 'BackerStakingHistory.backerTotalAllocation' },
        { accumulatedTime_: 'BackerStakingHistory.accumulatedTime' },
        { lastBlockTimestamp_: 'BackerStakingHistory.lastBlockTimestamp' },
        { gauges_: db.raw(coalesce) },
      )
      .where('BackerStakingHistory.id', '=', backer.toLowerCase())
      .groupBy('BackerStakingHistory.id')
      .first()

    return NextResponse.json(result)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
