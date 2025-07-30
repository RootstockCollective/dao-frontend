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

// TODO: Update flags after migration
export async function GET() {
  try {
    const [builders, cycles] = await Promise.all([
      db('Builder')
        .join('BuilderState', 'Builder.id', '=', 'BuilderState.builder')
        .join('BackerRewardPercentage', 'Builder.id', '=', 'BackerRewardPercentage.builder')
        .select({ address: 'Builder.id' }, 'Builder.totalAllocation', {
          backerRewardPct: db.raw(DB_COMMAND_COALESCE),
          stateFlags: db.raw(`
            COALESCE(
              json_build_object(
                'activated', "BuilderState"."initialized",
                'kycApproved', "BuilderState"."kycApproved",
                'communityApproved', "BuilderState"."communityApproved",
                'paused', "BuilderState"."kycPaused",
                'revoked', "BuilderState"."selfPaused"
              ),
              '{}'
            )
          `),
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
