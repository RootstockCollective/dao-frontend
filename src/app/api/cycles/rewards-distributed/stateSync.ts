import { isAddress } from 'viem'

import { fromDbBytes } from '@/app/api/db/bytes'
import { TABLE_GAUGE_NOTIFY_REWARD } from '@/app/api/db/constants'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

/** Total distributed per reward token, all cycles. Decimal strings: JSON has no bigint. */
export type RewardsDistributedByToken = Record<string, string>

interface RewardTotalRow {
  rewardToken: unknown
  total: string | null
}

/**
 * All-time distribution per token: what the gauges received, `builderAmount_ + backersAmount_`
 * across every `NotifyReward` they emitted.
 *
 * This is the figure the dApp used to derive from Blockscout, one paginated `getLogs` per gauge,
 * read from the `GaugeNotifyReward` rows state-sync already holds for `/api/gauges/notify-reward`.
 *
 * @remarks Not `CycleRewardPerToken`. That entity records the amounts a distribution announces
 * (`RewardDistributionRewards`), which is not necessarily what reaches the gauges. This sums the
 * gauge side, the same events the Blockscout-derived figure added up.
 */
export async function fetchRewardsDistributedFromStateSync(): Promise<RewardsDistributedByToken> {
  const rows: RewardTotalRow[] = await db(TABLE_GAUGE_NOTIFY_REWARD)
    .select(`${TABLE_GAUGE_NOTIFY_REWARD}.rewardToken`, {
      total: db.raw('sum(?? + ??)', [
        `${TABLE_GAUGE_NOTIFY_REWARD}.builderAmount`,
        `${TABLE_GAUGE_NOTIFY_REWARD}.backersAmount`,
      ]),
    })
    .groupBy(`${TABLE_GAUGE_NOTIFY_REWARD}.rewardToken`)

  const totals: RewardsDistributedByToken = {}
  for (const row of rows) {
    const token = fromDbBytes(row.rewardToken)
    // A row that is not an address cannot match any token the screens read, so skipping it changes
    // no total, and one bad row must not answer 503 for everyone.
    if (!isAddress(token, { strict: false })) {
      logger.warn(
        { table: TABLE_GAUGE_NOTIFY_REWARD, rewardToken: token },
        'Skipping NotifyReward total with an invalid reward token',
      )
      continue
    }
    // sum() returns NUMERIC, which pg hands back as a string; null only if the group were empty.
    totals[token] = row.total ?? '0'
  }

  return totals
}
