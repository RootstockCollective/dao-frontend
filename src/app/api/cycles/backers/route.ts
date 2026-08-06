import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'

import { BackersPerCycleRow, buildBackersPerCycleQuery, parseCycleLimit } from './query'

const ROUTE = '/api/cycles/backers'

/** The counts only move when a cycle closes, so a short cache costs nothing. */
export const revalidate = 60

export async function GET(req: Request) {
  try {
    const limit = parseCycleLimit(new URL(req.url).searchParams.get('limit'))
    const result = await buildBackersPerCycleQuery(limit)
    const data = (result?.rows ?? []) as BackersPerCycleRow[]

    return NextResponse.json({ data })
  } catch (err) {
    logger.error({ err, route: ROUTE }, 'Database error')
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
