import { unstable_cache } from 'next/cache'
import type { Address } from 'viem'

import { toDbBytes } from '@/app/api/db/bytes'
import { db } from '@/lib/db'

import { filterKnownGauges } from '../../_lib/known-gauges'

const TABLE_BUILDER_CLAIMED = 'BuilderRewardsClaimed'
const TABLE_GAUGE_TO_BUILDER = 'GaugeToBuilder'

/**
 * Seconds a gauge's claims are served from the Data Cache. Matches the client's poll interval
 * (`AVERAGE_BLOCKTIME`): the route is dynamic — it reads its params — so a segment `revalidate`
 * would not cache anything, and without this every poll of every tab would take a pool connection.
 */
const BUILDER_REWARDS_CLAIMED_CACHE_SECONDS = 60

/** Claimed-to-date per reward token. Decimal strings: JSON has no bigint. */
export type BuilderRewardsClaimedByToken = Record<string, string>

async function loadBuilderRewardsClaimed(lowercaseGauge: string): Promise<BuilderRewardsClaimedByToken> {
  const rows: { token: string; total: string | number | null }[] = await db(`${TABLE_BUILDER_CLAIMED} as b`)
    .join(`${TABLE_GAUGE_TO_BUILDER} as g`, 'g.builder', '=', 'b.builder')
    .select({ token: db.raw(`convert_from(b."token", 'utf8')`) })
    .sum({ total: 'b.amount' })
    .where('g.id', toDbBytes(lowercaseGauge))
    .groupBy('b.token')

  const claimed: BuilderRewardsClaimedByToken = {}
  for (const row of rows) {
    // sum() of a NUMERIC column comes back from pg as a string, and is NULL when every amount in the
    // group is NULL. String() keeps the contract if the column type ever parses to a number.
    claimed[row.token.toLowerCase()] = String(row.total ?? 0)
  }

  return claimed
}

/**
 * Keyed by the lowercased gauge, so every spelling of an address shares one entry — and only for
 * known gauges, so the path segment cannot mint entries of its own.
 */
const loadBuilderRewardsClaimedCached = unstable_cache(
  loadBuilderRewardsClaimed,
  ['gauge-builder-rewards-claimed', 'state-sync'],
  { revalidate: BUILDER_REWARDS_CLAIMED_CACHE_SECONDS },
)

/**
 * What this gauge's builder has claimed, per token.
 *
 * `BuilderRewardsClaimed` is accumulated by the subgraph on every claim — so where the client used
 * to reduce over a list of logs it now reads a value. The row is keyed by builder and the caller
 * holds a gauge, so this bridges through `GaugeToBuilder`, whose id is the gauge address.
 *
 * @remarks The `SUM`/`GROUP BY` is deliberate even though the table is expected to hold a single
 * row per builder and token. Reading the rows and assigning them into a record would take the
 * *last* one instead of the total, so a second row — from a re-keyed entity or a backfill —
 * would silently understate claimed money rather than fail. The join cannot multiply rows: `g.id`
 * is `GaugeToBuilder`'s key and the `WHERE` pins it to one gauge. Summing costs nothing when the expectation holds and is correct when it does not.
 */
export async function fetchBuilderRewardsClaimedFromStateSync(
  gauge: Address,
): Promise<BuilderRewardsClaimedByToken> {
  const [knownGauge] = await filterKnownGauges([gauge.toLowerCase()])
  // Not a gauge: the join would have matched nothing, so this is the same answer without the query.
  if (!knownGauge) return {}
  return loadBuilderRewardsClaimedCached(knownGauge)
}
