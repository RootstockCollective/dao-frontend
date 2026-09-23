import type { Address } from 'viem'

import { fromDbBytes, toDbBytes } from '@/app/api/db/bytes'
import { db } from '@/lib/db'

const TABLE_NOTIFY_REWARD = 'GaugeNotifyReward'

/** One distribution to a gauge, shaped like the parsed `NotifyReward` log the client used to decode. */
export interface NotifyRewardEvent {
  args: {
    rewardToken_: Address
    /** Decimal strings: JSON cannot carry a bigint. The client is responsible for `BigInt()`. */
    builderAmount_: string
    backersAmount_: string
  }
  /** Seconds since epoch, from the block that emitted the event. */
  timeStamp: number
}

export type NotifyRewardByGauge = Record<string, NotifyRewardEvent[]>

interface NotifyRewardRow {
  gauge: unknown
  rewardToken: unknown
  builderAmount: unknown
  backersAmount: unknown
  blockTimestamp: unknown
}

/**
 * `NotifyReward` events per gauge, from state-sync instead of Blockscout `getLogs`.
 *
 * `GaugeNotifyReward` is written by the gauge template's own handler, one row per event, keyed by
 * the emitting gauge — so unlike the claims tables no bridge through `GaugeToBuilder` is needed.
 *
 * @remarks Keys come back as the caller's own strings, not the lowercased ones from Postgres: the
 * client looks rows up with the address it sent, so rekeying here would break every lookup.
 */
export async function fetchNotifyRewardFromStateSync(gauges: Address[]): Promise<NotifyRewardByGauge> {
  const byLowercaseGauge = new Map<string, Address>()
  for (const gauge of gauges) {
    byLowercaseGauge.set(gauge.toLowerCase(), gauge)
  }

  const rows: NotifyRewardRow[] = await db(TABLE_NOTIFY_REWARD)
    .select('gauge', 'rewardToken', 'builderAmount', 'backersAmount', 'blockTimestamp')
    .whereIn('gauge', [...byLowercaseGauge.keys()].map(toDbBytes))
    .orderBy('blockTimestamp', 'asc')
    .orderBy('id', 'asc')

  const eventsByGauge: NotifyRewardByGauge = {}
  // Every requested gauge gets a key, so the client never has to tell "none" from "missing".
  for (const gauge of gauges) {
    eventsByGauge[gauge] = []
  }

  for (const row of rows) {
    const requestedGauge = byLowercaseGauge.get(fromDbBytes(row.gauge))
    if (!requestedGauge) continue

    eventsByGauge[requestedGauge].push({
      args: {
        rewardToken_: fromDbBytes(row.rewardToken) as Address,
        builderAmount_: String(row.builderAmount),
        backersAmount_: String(row.backersAmount),
      },
      timeStamp: Number(row.blockTimestamp),
    })
  }

  return eventsByGauge
}
