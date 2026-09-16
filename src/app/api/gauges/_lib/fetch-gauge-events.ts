import { NextResponse } from 'next/server'
import { type Address, type Hex, isAddress, type RpcLog } from 'viem'

import { fetchLogsByTopic, type RpcLogWithTimestamp } from '@/lib/blockscout/fetch-logs-by-topic'
import { StaleWhileRevalidateCache } from '@/lib/blockscout/stale-while-revalidate-cache'
import { EVENTS_FROM_BLOCK } from '@/lib/constants'
import { logger } from '@/lib/logger'

/** Seconds the Blockscout response is kept in the Next.js Data Cache. */
export const GAUGE_EVENTS_REVALIDATE_SECONDS = 25

/**
 * Maximum number of gauge addresses accepted per request.
 */
export const MAX_GAUGES_PER_REQUEST = 200

/**
 * How long a gauge's logs are served without touching Blockscout. Matches the client's own poll
 * interval (`AVERAGE_BLOCKTIME`), so a steady-state page costs at most one upstream call per gauge
 * per block instead of one per tab per block.
 */
const GAUGE_LOGS_FRESH_MS = 60_000

/**
 * How long logs may still be served while refreshing in the background — and, if Blockscout is
 * failing, instead of erroring. These events are append-only history; stale is far better than 500.
 */
const GAUGE_LOGS_STALE_MS = 15 * 60_000

/** ~200 gauges × 3 topics, with headroom. */
const GAUGE_LOGS_MAX_ENTRIES = 750

/** Advertised to clients when every gauge failed, so retries are spaced instead of immediate. */
const RETRY_AFTER_SECONDS = 5

export type GaugeEventsResponse = Record<Address, RpcLog[]>

/**
 * Process-wide cache of gauge logs, keyed by topic + gauge + block floor.
 *
 * This is the load-bearing part of the Blockscout rate-limit mitigation: pacing alone (see
 * `request-throttle.ts`) only spreads the same volume of requests over time, which would make cold
 * responses unacceptably slow. Not asking twice is what keeps us inside the budget.
 */
const gaugeLogsCache = new StaleWhileRevalidateCache<RpcLogWithTimestamp[]>({
  freshMs: GAUGE_LOGS_FRESH_MS,
  staleMs: GAUGE_LOGS_STALE_MS,
  maxEntries: GAUGE_LOGS_MAX_ENTRIES,
})

/** Exposed for tests; production code should never need to drop the cache. */
export function clearGaugeLogsCache(): void {
  gaugeLogsCache.clear()
}

function cacheKey(topic0: Hex, gauge: Address, fromBlock: string): string {
  return `${topic0.toLowerCase()}|${gauge.toLowerCase()}|${fromBlock}`
}

/**
 * Shared handler for `/api/gauges/<event>` route handlers.
 *
 * Query params:
 * - `gauges` (required): comma-separated gauge addresses.
 * - `fromBlock` (optional): decimal block number; defaults to `EVENTS_FROM_BLOCK`.
 *
 * Fetches Blockscout `getLogs` per gauge for the given `topic0`, behind a stale-while-revalidate
 * cache and a process-wide paced request queue. Gauges are resolved with `allSettled` so one
 * failure is reported precisely instead of collapsing the whole batch into an opaque error.
 *
 * @remarks
 * Responses stay all-or-nothing on purpose. The client does `eventsByGauge[gauge] ?? []`, so
 * omitting a failed gauge would silently render it as "no rewards claimed" — wrong numbers are
 * worse than a retryable error here.
 */
export async function buildGaugeEventsResponse(req: Request, topic0: Hex, route: string): Promise<Response> {
  const url = new URL(req.url)
  const gaugesParam = url.searchParams.get('gauges') ?? ''
  const fromBlockParam = url.searchParams.get('fromBlock')

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

  const fromBlock =
    fromBlockParam && /^\d+$/.test(fromBlockParam) ? fromBlockParam : EVENTS_FROM_BLOCK.toString()

  const results = await Promise.allSettled(
    gauges.map(gauge =>
      gaugeLogsCache.getOrLoad(
        cacheKey(topic0, gauge, fromBlock),
        async () => {
          const { data } = await fetchLogsByTopic({
            address: gauge,
            topic0,
            fromBlock,
            fetchInit: { next: { revalidate: GAUGE_EVENTS_REVALIDATE_SECONDS } },
          })
          return data
        },
        err => logger.warn({ err, route, topic0, gauge }, 'Background refresh of gauge logs failed'),
      ),
    ),
  )

  const eventsByGauge: GaugeEventsResponse = {}
  const failures: Array<{ gauge: Address; reason: unknown }> = []

  results.forEach((result, i) => {
    const gauge = gauges[i]
    if (result.status === 'fulfilled') {
      eventsByGauge[gauge] = result.value
    } else {
      failures.push({ gauge, reason: result.reason })
    }
  })

  if (failures.length > 0) {
    logger.error(
      {
        route,
        topic0,
        fromBlock,
        failedCount: failures.length,
        totalCount: gauges.length,
        failures: failures.map(({ gauge, reason }) => ({
          gauge,
          err: reason instanceof Error ? reason.message : String(reason),
        })),
      },
      'Error fetching gauge events from Blockscout',
    )

    return NextResponse.json(
      {
        error: 'Failed to fetch gauge events',
        failedGauges: failures.map(({ gauge }) => gauge),
      },
      { status: 503, headers: { 'Retry-After': String(RETRY_AFTER_SECONDS) } },
    )
  }

  return NextResponse.json(eventsByGauge)
}
