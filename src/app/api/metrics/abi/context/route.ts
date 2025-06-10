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
    const builders = await db('Builder')
      .join('BuilderState', 'Builder.id', '=', 'BuilderState.builder')
      .join('BackerRewardPercentage', 'Builder.id', '=', 'BackerRewardPercentage.builder')
      .select({ id: db.raw('convert_from("Builder".id, \'utf8\')') }, 'Builder.totalAllocation', {
        backerRewardPercentage: db.raw(DB_COMMAND_COALESCE),
      })
      .where('BuilderState.kycApproved', '=', true)
      .where('BuilderState.communityApproved', '=', true)
      .where('BuilderState.initialized', '=', true)
      .where('BuilderState.selfPaused', '=', false)

    const cycles = await db('Cycle')
      .select({ id: db.raw("convert_from(id, 'utf8')") }, 'rewardsERC20', 'rewardsRBTC')
      .orderBy('id', 'desc')

    return NextResponse.json({ builders, cycles })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
