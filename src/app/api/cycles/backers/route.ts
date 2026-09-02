import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'

import { BACKERS_PER_CYCLE_REVALIDATE_SECONDS, getCachedBackersPerCycle } from './action'
import { parseCycleLimit } from './query'

const ROUTE = '/api/cycles/backers'

export async function GET(req: Request) {
  try {
    const limit = parseCycleLimit(new URL(req.url).searchParams.get('limit'))
    const data = await getCachedBackersPerCycle(limit)

    return NextResponse.json(
      { data },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${BACKERS_PER_CYCLE_REVALIDATE_SECONDS}, stale-while-revalidate=${BACKERS_PER_CYCLE_REVALIDATE_SECONDS}`,
        },
      },
    )
  } catch (err) {
    logger.error({ err, route: ROUTE }, 'Database error')
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
