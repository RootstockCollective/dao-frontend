import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

const query = `
 SELECT convert_from(b.id, 'utf8') AS id, b."totalAllocation",
    COALESCE(
    json_agg(
      json_build_object('id', convert_from(brp.id, 'utf8'), 
      'next', brp."next",
      'previous', brp."previous",
      'cooldownEndTime', brp."cooldownEndTime"
      )
    ), 
  '[]') AS "backerRewardPercentage"
  FROM "Builder" b
  INNER JOIN "BuilderState" bs ON b.id = bs.builder
  INNER JOIN "BackerRewardPercentage" brp ON b.id = brp.builder
  WHERE bs."kycApproved" = TRUE
  AND bs."communityApproved" = TRUE
  AND bs.initialized = TRUE
  AND bs."selfPaused" = FALSE
  GROUP BY b.id;
`

export async function GET() {
  try {
    const result = await pool.query(query)
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
