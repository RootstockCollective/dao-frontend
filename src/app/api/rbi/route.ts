import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

const query = `
  SELECT convert_from(bsh.id, 'utf8') AS id, 
  bsh."backerTotalAllocation" AS "backerTotalAllocation_", 
  bsh."accumulatedTime" AS "accumulatedTime_", 
  bsh."lastBlockTimestamp" AS "lastBlockTimestamp_",
  COALESCE(
    json_agg(
      json_build_object('gauge_', convert_from(gsh.gauge, 'utf8'), 
      'accumulatedAllocationsTime_', gsh."accumulatedAllocationsTime",
      'allocation_', gsh."allocation",
      'lastBlockTimestamp_', gsh."lastBlockTimestamp"
      )
    ), 
  '[]') AS gauges_
  FROM "BackerStakingHistory" bsh 
  INNER JOIN "GaugeStakingHistory" gsh ON bsh.id = gsh.backer
  WHERE bsh.id = LOWER($1)::bytea
  GROUP BY bsh.id;
`

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const backer = searchParams.get('backer')

  if (!backer) {
    return NextResponse.json({ error: 'backer is required' }, { status: 400 })
  }

  try {
    const result = await pool.query(query, [backer])
    return NextResponse.json(result.rows[0])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
