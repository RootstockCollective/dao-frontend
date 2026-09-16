import type { Address } from 'viem'

import { fromDbBytes, toDbBytes } from '@/app/api/db/bytes'
import { db } from '@/lib/db'

const TABLE_CLAIMED = 'ClaimedRewardsHistory'
const TABLE_GAUGE_TO_BUILDER = 'GaugeToBuilder'

/** One claim, shaped like the parsed log the client used to build from Blockscout topics. */
export interface BackerRewardsClaimedEvent {
  args: {
    backer_: Address
    rewardToken_: Address
    /** Decimal string: JSON cannot carry a bigint. The client is responsible for `BigInt()`. */
    amount_: string
  }
  /** Seconds since epoch, from the block that emitted the claim. */
  timeStamp: number
}

export type BackerRewardsClaimedByGauge = Record<string, BackerRewardsClaimedEvent[]>

interface ClaimedRow {
  gauge: unknown
  backer: unknown
  rewardToken: unknown
  amount: unknown
  blockTimestamp: unknown
}

/**
 * Claims per gauge, from state-sync instead of Blockscout `getLogs`.
 *
 * `ClaimedRewardsHistory` is keyed by builder, and the client indexes by gauge, so this bridges
 * through `GaugeToBuilder` — whose id *is* the gauge address.
 *
 * @remarks Two things the SQL has to get right and the types will not catch:
 * - The table mixes backer claims with builder claims, the latter having a null `backer`. Without
 *   `whereNotNull` the backers' screens would sum builders' money into their totals.
 * - Keys come back as the caller's own strings, not the lowercased ones from Postgres. The client
 *   looks rows up with the same mixed-case address it sent, so rekeying here breaks every lookup
 *   silently.
 */
export async function fetchBackerRewardsClaimedFromStateSync(
  gauges: Address[],
): Promise<BackerRewardsClaimedByGauge> {
  const byLowercaseGauge = new Map<string, Address>()
  for (const gauge of gauges) {
    byLowercaseGauge.set(gauge.toLowerCase(), gauge)
  }

  const rows: ClaimedRow[] = await db(`${TABLE_CLAIMED} as c`)
    .join(`${TABLE_GAUGE_TO_BUILDER} as g`, 'g.builder', '=', 'c.builder')
    .select({
      gauge: 'g.id',
      backer: 'c.backer',
      rewardToken: 'c.rewardToken',
      amount: 'c.amount',
      blockTimestamp: 'c.blockTimestamp',
    })
    .whereIn('g.id', [...byLowercaseGauge.keys()].map(toDbBytes))
    .whereNotNull('c.backer')
    .orderBy('c.blockTimestamp', 'asc')
    .orderBy('c.id', 'asc')

  const eventsByGauge: BackerRewardsClaimedByGauge = {}
  // Every requested gauge gets a key, so the client's `?? []` never has to paper over a gap.
  for (const gauge of gauges) {
    eventsByGauge[gauge] = []
  }

  for (const row of rows) {
    const requestedGauge = byLowercaseGauge.get(fromDbBytes(row.gauge))
    if (!requestedGauge) continue

    eventsByGauge[requestedGauge].push({
      args: {
        backer_: fromDbBytes(row.backer) as Address,
        rewardToken_: fromDbBytes(row.rewardToken) as Address,
        amount_: String(row.amount),
      },
      timeStamp: Number(row.blockTimestamp),
    })
  }

  return eventsByGauge
}
