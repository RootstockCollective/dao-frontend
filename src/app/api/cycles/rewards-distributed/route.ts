import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'

import { fetchRewardsDistributedFromStateSync } from './stateSync'

const ROUTE = '/api/cycles/rewards-distributed'

export const revalidate = 25

/**
 * All-time rewards distributed per token, from state-sync.
 *
 * Replaces walking every gauge's NotifyReward history on Blockscout to add up the same figure.
 */
export async function GET() {
  try {
    return NextResponse.json(await fetchRewardsDistributedFromStateSync())
  } catch (err) {
    logger.error({ err, route: ROUTE }, 'Error reading distributed rewards')
    return NextResponse.json({ error: 'Failed to fetch distributed rewards' }, { status: 503 })
  }
}
