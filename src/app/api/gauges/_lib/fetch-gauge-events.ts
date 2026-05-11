import { NextResponse } from 'next/server'
import { type Address, type Hex, isAddress, type RpcLog } from 'viem'

import { fetchLogsByTopic } from '@/lib/blockscout/fetch-logs-by-topic'
import { EVENTS_FROM_BLOCK } from '@/lib/constants'
import { logger } from '@/lib/logger'

/** Seconds the Blockscout response is kept in the Next.js Data Cache. */
export const GAUGE_EVENTS_REVALIDATE_SECONDS = 25

export type GaugeEventsResponse = Record<Address, RpcLog[]>

/**
 * Shared handler for `/api/gauges/<event>` route handlers.
 *
 * Query params:
 * - `gauges` (required): comma-separated gauge addresses.
 * - `fromBlock` (optional): decimal block number; defaults to `EVENTS_FROM_BLOCK`.
 *
 * Fetches Blockscout `getLogs` per gauge in parallel for the given `topic0`. Each underlying
 * `fetch` opts into Next.js Data Cache via `next.revalidate`, so concurrent requests within the
 * window share a single Blockscout round-trip.
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
  if (!gauges.every(g => isAddress(g))) {
    return NextResponse.json({ error: 'Invalid gauge address in `gauges`' }, { status: 400 })
  }

  const fromBlock =
    fromBlockParam && /^\d+$/.test(fromBlockParam) ? fromBlockParam : EVENTS_FROM_BLOCK.toString()

  try {
    const results = await Promise.all(
      gauges.map(gauge =>
        fetchLogsByTopic({
          address: gauge,
          topic0,
          fromBlock,
          fetchInit: { next: { revalidate: GAUGE_EVENTS_REVALIDATE_SECONDS } },
        }),
      ),
    )

    const eventsByGauge: GaugeEventsResponse = {}
    gauges.forEach((gauge, i) => {
      eventsByGauge[gauge] = results[i].data
    })

    return NextResponse.json(eventsByGauge)
  } catch (err) {
    logger.error({ err, route, topic0 }, 'Error fetching gauge events from Blockscout')
    return NextResponse.json({ error: 'Failed to fetch gauge events' }, { status: 500 })
  }
}
