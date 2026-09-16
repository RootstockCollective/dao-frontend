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
 * `BuilderRewardsClaimed` holds one row per builder and token, already accumulated by the subgraph
 * on every claim — so where the client used to reduce over a list of logs it now reads a value.
 * The row is keyed by builder and the caller holds a gauge, so this bridges through
 * `GaugeToBuilder`, whose id is the gauge address.
 */
export async function fetchBuilderRewardsClaimedFromStateSync(
  gauge: Address,
): Promise<BuilderRewardsClaimedByToken> {
  const rows: { token: string; amount: string }[] = await db(`${TABLE_BUILDER_CLAIMED} as b`)
    .join(`${TABLE_GAUGE_TO_BUILDER} as g`, 'g.builder', '=', 'b.builder')
    .select({ token: db.raw(`convert_from(b."token", 'utf8')`), amount: 'b.amount' })
    .where('g.id', toDbBytes(gauge.toLowerCase()))

  const claimed: BuilderRewardsClaimedByToken = {}
  for (const row of rows) {
    claimed[row.token.toLowerCase()] = String(row.amount)
  }

  return claimed
}
