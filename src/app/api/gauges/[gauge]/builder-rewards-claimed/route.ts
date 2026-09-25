import { NextResponse } from 'next/server'
import { type Address, isAddress } from 'viem'

import { logger } from '@/lib/logger'

import { fetchBuilderRewardsClaimedFromStateSync } from './stateSync'

const ROUTE = '/api/gauges/[gauge]/builder-rewards-claimed'

/** Advertised on a 503 so client retries are spaced instead of immediate. */
const RETRY_AFTER_SECONDS = 5

/**
 * Rewards this gauge's builder has claimed, per token, from state-sync.
 *
 * Replaces the `fetchBuilderRewardsClaimed` server action, which pulled the gauge's whole
 * BuilderRewardsClaimed log history from Blockscout every 60 seconds.
 *
 * Caching lives in {@link fetchBuilderRewardsClaimedFromStateSync}: the gauge param makes this
 * route dynamic, so a segment `revalidate` would have no effect.
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
    return NextResponse.json(
      { error: 'Failed to fetch builder reward claims' },
      { status: 503, headers: { 'Retry-After': String(RETRY_AFTER_SECONDS) } },
    )
  }
}
