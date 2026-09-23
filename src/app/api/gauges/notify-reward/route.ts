import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'

import { parseGaugesParam } from '../_lib/parse-gauges-param'
import { fetchNotifyRewardFromStateSync } from './stateSync'

const ROUTE = '/api/gauges/notify-reward'

export const revalidate = 25

/**
 * `NotifyReward` events per gauge, read from state-sync Postgres.
 *
 * Was one paginated Blockscout `getLogs` call per gauge on every refresh of the builders table,
 * plus another per token from the builder's own rewards page. `GaugeNotifyReward` carries the
 * same events with the four fields the client uses, so the explorer is no longer in this path.
 *
 * Query params:
 * - `gauges` (required): comma-separated gauge addresses.
 *
 * `fromBlock` is gone. Nothing passed it, and `GaugeNotifyReward` has no block number to filter on.
 */
export async function GET(req: Request) {
  const parsed = parseGaugesParam(req)
  if ('error' in parsed) return parsed.error
  const { gauges } = parsed

  try {
    return NextResponse.json(await fetchNotifyRewardFromStateSync(gauges))
  } catch (err) {
    logger.error({ err, route: ROUTE, gaugeCount: gauges.length }, 'Error reading NotifyReward events')

    // All-or-nothing: a gauge missing from a partial response would render as "no rewards last
    // cycle", and a retryable error is better than a wrong number.
    return NextResponse.json({ error: 'Failed to fetch NotifyReward events' }, { status: 503 })
  }
}
