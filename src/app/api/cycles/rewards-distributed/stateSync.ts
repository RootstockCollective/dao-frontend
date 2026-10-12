import type { Address } from 'viem'

import { db } from '@/lib/db'

const TABLE_CYCLE = 'Cycle'
const TABLE_CYCLE_REWARD_PER_TOKEN = 'CycleRewardPerToken'

/** Total distributed per reward token, all cycles. Decimal strings: JSON has no bigint. */
export type RewardsDistributedByToken = Record<string, string>

/**
 * All-time distribution per token, summed from the per-cycle rows.
 *
 * The dApp used to derive this by pulling every gauge's NotifyReward log from Blockscout and
 * adding `builderAmount_ + backersAmount_`. `CycleRewardPerToken` is the same money counted on the
 * protocol side — one row per cycle and token, accumulated as each distribution lands.
 *
 * @remarks Accumulation was a fix (`accumulate cycle rewards instead of overwriting`, 2026-06-29),
 * shipped in subgraph v3.1.2. The mainnet deployment in state-sync's config was pointed at that
 * version on 2026-07-10, so the rows are sums rather than last-writes — worth confirming against a
 * cycle that had more than one distribution before trusting the number on screen.
 *
 * Only rows whose `Cycle` exists are counted, the same `innerJoin` `/api/cycles` applies. The
 * subgraph writes both entities in one handler, so an orphan should not exist — but state-sync
 * syncs tables independently, and if one ever appeared the all-time total would disagree with the
 * per-cycle list it is meant to add up.
 */
export async function fetchRewardsDistributedFromStateSync(): Promise<RewardsDistributedByToken> {
  const rows: { token: string; total: string | null }[] = await db(TABLE_CYCLE_REWARD_PER_TOKEN)
    .innerJoin(TABLE_CYCLE, `${TABLE_CYCLE}.id`, '=', `${TABLE_CYCLE_REWARD_PER_TOKEN}.cycle`)
    .select({ token: db.raw(`convert_from("${TABLE_CYCLE_REWARD_PER_TOKEN}"."token", 'utf8')`) })
    .sum({ total: `${TABLE_CYCLE_REWARD_PER_TOKEN}.amount` })
    .groupBy(`${TABLE_CYCLE_REWARD_PER_TOKEN}.token`)

  const totals: RewardsDistributedByToken = {}
  for (const row of rows) {
    // sum() returns NUMERIC, which pg hands back as a string; null only if the group were empty.
    totals[row.token.toLowerCase() as Address] = row.total ?? '0'
  }

  return totals
}
