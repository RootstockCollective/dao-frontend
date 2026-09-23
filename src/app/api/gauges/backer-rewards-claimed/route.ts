import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'

import { parseGaugesParam } from '../_lib/parse-gauges-param'
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
  const parsed = parseGaugesParam(req)
  if ('error' in parsed) return parsed.error
  const { gauges } = parsed

  try {
    return NextResponse.json(await fetchBackerRewardsClaimedFromStateSync(gauges))
  } catch (err) {
    logger.error({ err, route: ROUTE, gaugeCount: gauges.length }, 'Error reading backer reward claims')

    // All-or-nothing, as before: the client does `eventsByGauge[gauge] ?? []`, so a partial
    // response would render a failure as "nothing claimed" — wrong numbers beat no numbers here.
    return NextResponse.json({ error: 'Failed to fetch backer reward claims' }, { status: 503 })
  }
}
