import { unstable_cache } from 'next/cache'

import { fromDbBytes } from '@/app/api/db/bytes'
import { db } from '@/lib/db'

const TABLE_GAUGE_TO_BUILDER = 'GaugeToBuilder'

/**
 * Seconds the gauge list is served from the Data Cache. Same as the per-gauge entries it guards,
 * so a new gauge is served within one poll of it being indexed.
 */
const KNOWN_GAUGES_CACHE_SECONDS = 60

async function loadKnownGauges(): Promise<string[]> {
  const rows: { id: unknown }[] = await db(TABLE_GAUGE_TO_BUILDER).select('id')
  return rows.map(row => fromDbBytes(row.id))
}

/** A single entry: an array, since the Data Cache stores JSON and a `Set` would come back empty. */
const loadKnownGaugesCached = unstable_cache(loadKnownGauges, ['known-gauges', 'state-sync'], {
  revalidate: KNOWN_GAUGES_CACHE_SECONDS,
})

/**
 * Keeps only the gauges state-sync has indexed.
 *
 * The `/api/gauges/*` routes cache one entry per gauge, which bounds the Data Cache by the number of
 * real gauges — but only if an address that is not a gauge never reaches the cache. Without this,
 * every well-formed address a client invents would be a cache miss, a pooled query, and an entry on
 * disk that is never evicted.
 *
 * Dropping the rest changes no response. The claims queries already join through `GaugeToBuilder`,
 * so a gauge missing from it had no rows to return. `GaugeNotifyReward` comes from the gauge
 * template, which the subgraph spawns in the same handler that writes `GaugeToBuilder`.
 *
 * @param gauges — Gauges in any casing.
 * @returns The known ones, lowercased as the `Bytes` columns hold them, in the order given. Callers
 *   use them as cache keys and to query, so a checksummed address must not read as unknown.
 */
export async function filterKnownGauges(gauges: string[]): Promise<string[]> {
  const known = new Set(await loadKnownGaugesCached())
  return gauges.map(gauge => gauge.toLowerCase()).filter(gauge => known.has(gauge))
}
