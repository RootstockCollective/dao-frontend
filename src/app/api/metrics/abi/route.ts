import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const coalesce = `
    COALESCE(
    json_agg(
      json_build_object('id', convert_from("BackerRewardPercentage".id, 'utf8'), 
      'next', "BackerRewardPercentage"."next",
      'previous', "BackerRewardPercentage"."previous",
      'cooldownEndTime', "BackerRewardPercentage"."cooldownEndTime"
      )
    ), 
  '[]')
`

export async function GET() {
  try {
    const result = await db('Builder')
      .join('BuilderState', 'Builder.id', '=', 'BuilderState.builder')
      .join('BackerRewardPercentage', 'Builder.id', '=', 'BackerRewardPercentage.builder')
      .select({ id: db.raw(`convert_from("Builder".id, 'utf8')`) }, 'Builder.totalAllocation', {
        backerRewardPercentage: db.raw(coalesce),
      })
      .where('BuilderState.kycApproved', '=', true)
      .where('BuilderState.communityApproved', '=', true)
      .where('BuilderState.initialized', '=', true)
      .where('BuilderState.selfPaused', '=', false)
      .groupBy('Builder.id')
    return NextResponse.json(result)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
