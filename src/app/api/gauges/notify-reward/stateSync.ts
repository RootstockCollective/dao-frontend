import { unstable_cache } from 'next/cache'
import { type Address, isAddress } from 'viem'

import { fromDbBytes, toDbBytes } from '@/app/api/db/bytes'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

const TABLE_NOTIFY_REWARD = 'GaugeNotifyReward'

/**
 * Seconds a gauge set's rows are served from the Data Cache. Matches the client's poll interval
 * (`AVERAGE_BLOCKTIME`): the route is dynamic — it reads `req.url` — so a segment `revalidate`
 * would not cache anything, and without this every poll of every tab would take a pool connection.
 */
const NOTIFY_REWARD_CACHE_SECONDS = 60

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

/** A row reduced to JSON-safe values, so it survives the Data Cache unchanged. */
interface NotifyRewardRecord {
  gauge: string
  rewardToken: Address
  builderAmount: string
  backersAmount: string
  blockTimestamp: number
}

export interface FetchNotifyRewardOptions {
  /** Inclusive lower bound, in seconds. Omitted, the whole history comes back. */
  fromTimestamp?: number
}

async function loadNotifyRewardRecords(
  lowercaseGauges: string[],
  fromTimestamp: number | undefined,
): Promise<NotifyRewardRecord[]> {
  const query = db(TABLE_NOTIFY_REWARD)
    .select('gauge', 'rewardToken', 'builderAmount', 'backersAmount', 'blockTimestamp')
    .whereIn('gauge', lowercaseGauges.map(toDbBytes))
  if (fromTimestamp !== undefined) {
    query.where('blockTimestamp', '>=', fromTimestamp)
  }
  const rows: NotifyRewardRow[] = await query.orderBy('blockTimestamp', 'asc').orderBy('id', 'asc')

  const records: NotifyRewardRecord[] = []
  for (const row of rows) {
    const rewardToken = fromDbBytes(row.rewardToken)
    // The client runs `isAddressEqual` / `getAddress` on this inside `useMemo`, where a malformed
    // value throws during render instead of failing the query. A row that is not an address cannot
    // match any token the screens sum, so dropping it changes no total.
    if (!isAddress(rewardToken, { strict: false })) {
      logger.warn(
        { table: TABLE_NOTIFY_REWARD, rewardToken },
        'Skipping NotifyReward row with an invalid reward token',
      )
      continue
    }
    records.push({
      gauge: fromDbBytes(row.gauge),
      rewardToken,
      builderAmount: String(row.builderAmount),
      backersAmount: String(row.backersAmount),
      blockTimestamp: Number(row.blockTimestamp),
    })
  }
  return records
}

/** Keyed by its arguments, which the caller normalises so every spelling of a set shares an entry. */
const loadNotifyRewardRecordsCached = unstable_cache(
  loadNotifyRewardRecords,
  ['gauge-notify-reward', 'state-sync'],
  { revalidate: NOTIFY_REWARD_CACHE_SECONDS },
)

/**
 * `NotifyReward` events per gauge, from state-sync instead of Blockscout `getLogs`.
 *
 * `GaugeNotifyReward` is written by the gauge template's own handler, one row per event, keyed by
 * the emitting gauge — so unlike the claims tables no bridge through `GaugeToBuilder` is needed.
 *
 * @remarks Keys come back as the caller's own strings, not the lowercased ones from Postgres: the
 * client looks rows up with the address it sent, so rekeying here would break every lookup. A gauge
 * sent in more than one casing gets its events under each of them.
 */
export async function fetchNotifyRewardFromStateSync(
  gauges: Address[],
  { fromTimestamp }: FetchNotifyRewardOptions = {},
): Promise<NotifyRewardByGauge> {
  const spellingsByLowercase = new Map<string, Set<Address>>()
  for (const gauge of gauges) {
    const lowercase = gauge.toLowerCase()
    const spellings = spellingsByLowercase.get(lowercase) ?? new Set<Address>()
    spellingsByLowercase.set(lowercase, spellings.add(gauge))
  }

  const records = await loadNotifyRewardRecordsCached([...spellingsByLowercase.keys()].sort(), fromTimestamp)

  const eventsByGauge: NotifyRewardByGauge = {}
  // Every requested gauge gets a key, so the client never has to tell "none" from "missing".
  for (const gauge of gauges) {
    eventsByGauge[gauge] = []
  }

  for (const record of records) {
    const spellings = spellingsByLowercase.get(record.gauge)
    if (!spellings) continue

    const event: NotifyRewardEvent = {
      args: {
        rewardToken_: record.rewardToken,
        builderAmount_: record.builderAmount,
        backersAmount_: record.backersAmount,
      },
      timeStamp: record.blockTimestamp,
    }
    for (const spelling of spellings) {
      eventsByGauge[spelling].push(event)
    }
  }

  return eventsByGauge
}
