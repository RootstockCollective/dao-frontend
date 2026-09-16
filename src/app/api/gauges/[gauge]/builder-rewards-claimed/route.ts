import { NextResponse } from 'next/server'
import { type Address, isAddress } from 'viem'

import { logger } from '@/lib/logger'

import { fetchBuilderRewardsClaimedFromStateSync } from './stateSync'

const ROUTE = '/api/gauges/[gauge]/builder-rewards-claimed'

export const revalidate = 25

/**
 * Rewards this gauge's builder has claimed, per token, from state-sync.
 *
 * Replaces the `fetchBuilderRewardsClaimed` server action, which pulled the gauge's whole
 * BuilderRewardsClaimed log history from Blockscout every 60 seconds, outside the shared
 * stale-while-revalidate cache the `/api/gauges` routes use.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ gauge: string }> }) {
  const { gauge } = await params

  if (!isAddress(gauge)) {
    return NextResponse.json({ error: 'Invalid gauge address' }, { status: 400 })
  }

  try {
    return NextResponse.json(await fetchBuilderRewardsClaimedFromStateSync(gauge as Address))
  } catch (err) {
    logger.error({ err, route: ROUTE, gauge }, 'Error reading builder reward claims')
    return NextResponse.json({ error: 'Failed to fetch builder reward claims' }, { status: 503 })
  }
}
