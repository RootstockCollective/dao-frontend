import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'

import { BACKERS_PER_CYCLE_REVALIDATE_SECONDS, getCachedBackersPerCycle } from './action'

const ROUTE = '/api/cycles/backers'

// No query params: one cache entry, and no way to force a fresh full scan per distinct value.
export async function GET() {
  try {
    const data = await getCachedBackersPerCycle()

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
