import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'

import { parseGaugesParam } from '../_lib/parse-gauges-param'
import { fetchNotifyRewardFromStateSync } from './stateSync'

const ROUTE = '/api/gauges/notify-reward'

/** Advertised on a 503 so client retries are spaced instead of immediate. */
const RETRY_AFTER_SECONDS = 5

/**
 * `NotifyReward` events per gauge, read from state-sync Postgres.
 *
 * Was one paginated Blockscout `getLogs` call per gauge on every refresh of the builders table,
 * plus another per token from the builder's own rewards page. `GaugeNotifyReward` carries the
 * same events with the four fields the client uses, so the explorer is no longer in this path.
 *
 * Query params:
 * - `gauges` (required): comma-separated gauge addresses.
 * - `fromTimestamp` (optional): inclusive lower bound in seconds. Both screens only read the last
 *   cycle, so without it every poll would carry each gauge's whole history.
 *
 * `fromBlock` is gone. Nothing passed it, and `GaugeNotifyReward` has no block number to filter on.
 * Caching lives in {@link fetchNotifyRewardFromStateSync}: reading `req.url` makes this route
 * dynamic, so a segment `revalidate` would have no effect.
 */
export async function GET(req: Request) {
  const parsed = parseGaugesParam(req)
  if ('error' in parsed) return parsed.error
  const { gauges } = parsed

  const fromTimestampParam = new URL(req.url).searchParams.get('fromTimestamp')
  const fromTimestamp = fromTimestampParam === null ? undefined : Number(fromTimestampParam)
  // The regex keeps out signs, decimals and exponents; the safe-integer check keeps out values that
  // parse to `Infinity`, which `unstable_cache` would serialise to `null` — the same cache key as no
  // bound at all, so one request could park an empty history under every client's entry.
  if (
    fromTimestampParam !== null &&
    (!/^\d+$/.test(fromTimestampParam) || !Number.isSafeInteger(fromTimestamp))
  ) {
    return NextResponse.json(
      { error: '`fromTimestamp` must be a non-negative integer of seconds' },
      { status: 400 },
    )
  }

  try {
    return NextResponse.json(await fetchNotifyRewardFromStateSync(gauges, { fromTimestamp }))
  } catch (err) {
    logger.error({ err, route: ROUTE, gaugeCount: gauges.length }, 'Error reading NotifyReward events')

    // All-or-nothing: a gauge missing from a partial response would render as "no rewards last
    // cycle", and a retryable error is better than a wrong number.
    return NextResponse.json(
      { error: 'Failed to fetch NotifyReward events' },
      { status: 503, headers: { 'Retry-After': String(RETRY_AFTER_SECONDS) } },
    )
  }
}
