import type { Address } from 'viem'

import { toDbBytes } from '@/app/api/db/bytes'
import { db } from '@/lib/db'

const TABLE_BUILDER_CLAIMED = 'BuilderRewardsClaimed'
const TABLE_GAUGE_TO_BUILDER = 'GaugeToBuilder'

/** Claimed-to-date per reward token. Decimal strings: JSON has no bigint. */
export type BuilderRewardsClaimedByToken = Record<string, string>

/**
 * What this gauge's builder has claimed, per token.
 *
 * `BuilderRewardsClaimed` is accumulated by the subgraph on every claim — so where the client used
 * to reduce over a list of logs it now reads a value. The row is keyed by builder and the caller
 * holds a gauge, so this bridges through `GaugeToBuilder`, whose id is the gauge address.
 *
 * @remarks The `SUM`/`GROUP BY` is deliberate even though the table is expected to hold a single
 * row per builder and token. Reading the rows and assigning them into a record would take the
 * *last* one instead of the total, so a second row — from a re-keyed entity, a backfill, or a
 * builder reachable through more than one gauge — would silently understate claimed money rather
 * than fail. Summing costs nothing when the expectation holds and is correct when it does not.
 */
export async function fetchBuilderRewardsClaimedFromStateSync(
  gauge: Address,
): Promise<BuilderRewardsClaimedByToken> {
  const rows: { token: string; total: string | null }[] = await db(`${TABLE_BUILDER_CLAIMED} as b`)
    .join(`${TABLE_GAUGE_TO_BUILDER} as g`, 'g.builder', '=', 'b.builder')
    .select({ token: db.raw(`convert_from(b."token", 'utf8')`) })
    .sum({ total: 'b.amount' })
    .where('g.id', toDbBytes(gauge.toLowerCase()))
    .groupBy('b.token')

  const claimed: BuilderRewardsClaimedByToken = {}
  for (const row of rows) {
    // sum() returns NUMERIC, which pg hands back as a string; null only if the group were empty.
    claimed[row.token.toLowerCase()] = row.total ?? '0'
  }

  return claimed
}
