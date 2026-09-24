import { unstable_cache } from 'next/cache'
import type { Address } from 'viem'

import { fromDbBytes, toDbBytes } from '@/app/api/db/bytes'
import { db } from '@/lib/db'

const TABLE_CLAIMED = 'ClaimedRewardsHistory'
const TABLE_GAUGE_TO_BUILDER = 'GaugeToBuilder'

/**
 * Seconds a gauge set's claims are served from the Data Cache. Matches the client's poll interval
 * (`AVERAGE_BLOCKTIME`): the route is dynamic — it reads `req.url` — so a segment `revalidate`
 * would not cache anything, and without this every poll of every tab would take a pool connection.
 */
const BACKER_REWARDS_CLAIMED_CACHE_SECONDS = 60

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

/** A row reduced to JSON-safe values, so it survives the Data Cache unchanged. */
interface ClaimedRecord {
  gauge: string
  backer: Address
  rewardToken: Address
  amount: string
  blockTimestamp: number
}

async function loadBackerRewardsClaimedRecords(lowercaseGauges: string[]): Promise<ClaimedRecord[]> {
  const rows: ClaimedRow[] = await db(`${TABLE_CLAIMED} as c`)
    .join(`${TABLE_GAUGE_TO_BUILDER} as g`, 'g.builder', '=', 'c.builder')
    .select({
      gauge: 'g.id',
      backer: 'c.backer',
      rewardToken: 'c.rewardToken',
      amount: 'c.amount',
      blockTimestamp: 'c.blockTimestamp',
    })
    .whereIn('g.id', lowercaseGauges.map(toDbBytes))
    .whereNotNull('c.backer')
    .orderBy('c.blockTimestamp', 'asc')
    .orderBy('c.id', 'asc')

  return rows.map(row => ({
    gauge: fromDbBytes(row.gauge),
    backer: fromDbBytes(row.backer) as Address,
    rewardToken: fromDbBytes(row.rewardToken) as Address,
    amount: String(row.amount),
    blockTimestamp: Number(row.blockTimestamp),
  }))
}

/** Keyed by its argument, which the caller normalises so every spelling of a set shares an entry. */
const loadBackerRewardsClaimedRecordsCached = unstable_cache(
  loadBackerRewardsClaimedRecords,
  ['gauge-backer-rewards-claimed', 'state-sync'],
  { revalidate: BACKER_REWARDS_CLAIMED_CACHE_SECONDS },
)

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
 *   silently. A gauge sent in more than one casing gets its claims under each of them.
 */
export async function fetchBackerRewardsClaimedFromStateSync(
  gauges: Address[],
): Promise<BackerRewardsClaimedByGauge> {
  const spellingsByLowercase = new Map<string, Set<Address>>()
  for (const gauge of gauges) {
    const lowercase = gauge.toLowerCase()
    const spellings = spellingsByLowercase.get(lowercase) ?? new Set<Address>()
    spellingsByLowercase.set(lowercase, spellings.add(gauge))
  }

  const records = await loadBackerRewardsClaimedRecordsCached([...spellingsByLowercase.keys()].sort())

  const eventsByGauge: BackerRewardsClaimedByGauge = {}
  // Every requested gauge gets a key, so the client's `?? []` never has to paper over a gap.
  for (const gauge of gauges) {
    eventsByGauge[gauge] = []
  }

  for (const record of records) {
    const spellings = spellingsByLowercase.get(record.gauge)
    if (!spellings) continue

    const event: BackerRewardsClaimedEvent = {
      args: {
        backer_: record.backer,
        rewardToken_: record.rewardToken,
        amount_: record.amount,
      },
      timeStamp: record.blockTimestamp,
    }
    for (const spelling of spellings) {
      eventsByGauge[spelling].push(event)
    }
  }

  return eventsByGauge
}
