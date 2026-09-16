import { NextResponse } from 'next/server'
import { type Address, isAddress } from 'viem'

import { logger } from '@/lib/logger'

import { MAX_GAUGES_PER_REQUEST } from '../_lib/fetch-gauge-events'
import { fetchBackerRewardsClaimedFromStateSync } from './stateSync'

const ROUTE = '/api/gauges/backer-rewards-claimed'

export const revalidate = 25

/**
 * Backer reward claims per gauge, read from state-sync Postgres.
 *
 * Was one paginated Blockscout `getLogs` call per gauge — ~42 per refresh cycle on mainnet against
 * a 5k/day budget. `ClaimedRewardsHistory` carries the same claims with the four fields the client
 * uses, so the explorer is no longer in this path at all.
 *
 * Query params:
 * - `gauges` (required): comma-separated gauge addresses.
 *
 * `fromBlock` is gone. It scoped the explorer's pagination, nothing passed it, and
 * `ClaimedRewardsHistory` has no block number to filter on.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const gaugesParam = url.searchParams.get('gauges') ?? ''

  const gauges = gaugesParam
    .split(',')
    .map(g => g.trim())
    .filter(Boolean) as Address[]

  if (gauges.length === 0) {
    return NextResponse.json({ error: 'Missing required `gauges` query param' }, { status: 400 })
  }
  if (gauges.length > MAX_GAUGES_PER_REQUEST) {
    return NextResponse.json(
      { error: `Too many gauges; max ${MAX_GAUGES_PER_REQUEST} per request` },
      { status: 400 },
    )
  }
  if (!gauges.every(g => isAddress(g))) {
    return NextResponse.json({ error: 'Invalid gauge address in `gauges`' }, { status: 400 })
  }

  try {
    return NextResponse.json(await fetchBackerRewardsClaimedFromStateSync(gauges))
  } catch (err) {
    logger.error({ err, route: ROUTE, gaugeCount: gauges.length }, 'Error reading backer reward claims')

    // All-or-nothing, as before: the client does `eventsByGauge[gauge] ?? []`, so a partial
    // response would render a failure as "nothing claimed" — wrong numbers beat no numbers here.
    return NextResponse.json({ error: 'Failed to fetch backer reward claims' }, { status: 503 })
  }
}
