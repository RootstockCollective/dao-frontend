import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paginateQuery } from '@/app/api/utils/paginationQuery'
import { parsePaginationParams } from '@/app/api/utils/pagination'

export async function GET(req: Request) {
  try {
    const { page, pageSize } = parsePaginationParams(req.url || '')

    const baseQuery = db('Builder')
      .join('BackerRewardPercentage', 'Builder.id', '=', 'BackerRewardPercentage.builder')
      .join('BuilderState', 'Builder.id', '=', 'BuilderState.builder')
      .select('Builder.id', 'Builder.totalAllocation', {
        backerRewardPercentage: db.raw(`
          COALESCE(
              json_build_object(
                'next', "BackerRewardPercentage"."next",
                'previous', "BackerRewardPercentage"."previous", 
                'cooldownEndTime', "BackerRewardPercentage"."cooldownEndTime"
              ),
              '{}'
          )
        `),
        builderState: db.raw(`
          COALESCE(
            json_build_object(
              'initialized', "BuilderState"."initialized",
              'kycApproved', "BuilderState"."kycApproved",
              'communityApproved', "BuilderState"."communityApproved",
              'kycPaused', "BuilderState"."kycPaused",
              'selfPaused', "BuilderState"."selfPaused",
              'pausedReason', convert_from("BuilderState"."pausedReason", 'utf8')
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
