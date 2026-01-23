import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DB_COMMAND_COALESCE = `
  COALESCE(
    json_build_object(
      'next', "BackerRewardPercentage"."next"::text,
      'previous', "BackerRewardPercentage"."previous"::text, 
      'cooldownEndTime', "BackerRewardPercentage"."cooldownEndTime"::text
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
        .select({ address: 'Builder.id' }, 'Builder.totalAllocation', {
          backerRewardPct: db.raw(DB_COMMAND_COALESCE),
          stateFlags: db.raw(`
            COALESCE(
              json_build_object(
                'initialized', "BuilderState"."initialized",
                'kycApproved', "BuilderState"."kycApproved",
                'communityApproved', "BuilderState"."communityApproved",
                'kycPaused', "BuilderState"."kycPaused",
                'selfPaused', "BuilderState"."selfPaused"
              ),
              '{}'
            )
          `),
        })
        .where('BuilderState.initialized', '=', true)
        .orderByRaw('"Builder"."totalAllocation"::numeric DESC'),
      db('Cycle')
        .select('Cycle.id')
        .select({
          rewardPerToken: db.raw(`
            COALESCE(
              json_object_agg(convert_from("CycleRewardPerToken"."token", 'utf8'), "CycleRewardPerToken"."amount"::text),
              '{}'
            )
          `),
        })
        .innerJoin('CycleRewardPerToken', 'Cycle.id', '=', 'CycleRewardPerToken.cycle')
        .orderBy('currentCycleStart', 'desc')
        .groupBy('Cycle.id'),
    ])

    return NextResponse.json({ builders, cycles })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
