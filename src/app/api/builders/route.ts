import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paginateQuery } from '@/app/api/utils/paginateQuery'
import { parsePaginationParams } from '@/app/api/utils/parsePaginationParams'

// TODO: Update flags after migration
export async function GET(req: Request) {
  try {
    const paginationResult = parsePaginationParams(req.url || '')

    if (!paginationResult.success) {
      return NextResponse.json(
        { error: paginationResult.error.message },
        { status: paginationResult.error.statusCode },
      )
    }

    const { page, pageSize } = paginationResult.data

    const baseQuery = db('Builder')
      .join('BackerRewardPercentage', 'Builder.id', '=', 'BackerRewardPercentage.builder')
      .join('BuilderState', 'Builder.id', '=', 'BuilderState.builder')
      .select({ address: 'Builder.id' }, 'Builder.totalAllocation', {
        backerRewardPct: db.raw(`
          COALESCE(
              json_build_object(
                'next', "BackerRewardPercentage"."next",
                'previous', "BackerRewardPercentage"."previous", 
                'cooldownEndTime', "BackerRewardPercentage"."cooldownEndTime"
              ),
              '{}'
          )
        `),
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
      .where({
        'BuilderState.kycApproved': true,
        'BuilderState.communityApproved': true,
        'BuilderState.initialized': true,
        'BuilderState.selfPaused': false,
      })

    const { data, count } = await paginateQuery(baseQuery, page, pageSize)

    return NextResponse.json({ data, count, page, pageSize })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
