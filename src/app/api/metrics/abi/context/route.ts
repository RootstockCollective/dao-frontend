import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DB_COMMAND_COALESCE = `
  COALESCE(
    json_build_object(
      'next', "BackerRewardPercentage"."next",
      'previous', "BackerRewardPercentage"."previous", 
      'cooldownEndTime', "BackerRewardPercentage"."cooldownEndTime"
    ),
    '{}'
  )
`

export async function GET() {
  try {
    const [builders, cycles] = await Promise.all([
      db('Builder')
        .join('BuilderState', 'Builder.id', '=', 'BuilderState.builder')
        .join('BackerRewardPercentage', 'Builder.id', '=', 'BackerRewardPercentage.builder')
        .select('Builder.id', 'Builder.totalAllocation', {
          backerRewardPercentage: db.raw(DB_COMMAND_COALESCE),
        })
        .where('BuilderState.initialized', '=', true)
        .orderByRaw('"Builder"."totalAllocation"::numeric DESC'),
      db('Cycle').select('Cycle.id', 'Cycle.rewardsERC20', 'Cycle.rewardsRBTC').orderBy('id', 'desc'),
    ])

    return NextResponse.json({ builders, cycles })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
