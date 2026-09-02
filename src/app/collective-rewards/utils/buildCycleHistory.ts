import Big from '@/lib/big'
import { WeiPerEther } from '@/lib/constants'
import { REWARD_TOKEN_KEYS, RewardTokenKey, TOKENS } from '@/lib/tokens'

import { GetPricesResult } from '../../user/types'
import { FIRST_CYCLE_START_SECONDS } from '../constants/chartConstants'
import { UseGetGaugesNotifyRewardReturnType } from '../rewards'
import { CycleHistoryEntry, CycleRewardsItem, CycleTokenReward, DailyAllocationItem } from '../types'

const toFiat = (value: bigint, price: number): Big =>
  Big(value.toString()).div(WeiPerEther.toString()).mul(price)

/** Address → token key, built once so per-event lookups aren't a linear scan with a comparison. */
const REWARD_TOKEN_KEY_BY_ADDRESS = new Map<string, RewardTokenKey>(
  REWARD_TOKEN_KEYS.map(tokenKey => [TOKENS[tokenKey].address.toLowerCase(), tokenKey]),
)

export const toCycleStartKey = (value: string | number | bigint): string | null => {
  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds > 0 ? String(Math.trunc(seconds)) : null
}

/** Cycle numbers are derived the same way the chart derives them, so the two never disagree. */
export const getCycleNumber = (cycleStartSeconds: number, cycleDurationSeconds: number): number =>
  Math.floor((cycleStartSeconds - FIRST_CYCLE_START_SECONDS) / cycleDurationSeconds) + 1

const buildRewards = (
  rewardPerToken: Record<string, string>,
  prices: GetPricesResult,
): { rewards: CycleTokenReward[]; rewardsFiat: Big } => {
  const rewards = REWARD_TOKEN_KEYS.map<CycleTokenReward>(tokenKey => {
    const { address, symbol } = TOKENS[tokenKey]
    const value = BigInt(rewardPerToken[address.toLowerCase()] ?? 0)

    return {
      tokenKey,
      symbol,
      value,
      fiatValue: toFiat(value, prices[symbol]?.price ?? 0),
    }
  })

  return {
    rewards,
    rewardsFiat: rewards.reduce((acc, { fiatValue }) => acc.add(fiatValue), Big(0)),
  }
}

/** One cycle's window, carrying the index of the cycle it came from. */
interface CycleWindow {
  index: number
  startSeconds: number
  endSeconds: number
}

/**
 * Index of the cycle containing `timestamp`, or -1. Windows must be sorted ascending by start;
 * the binary search is what keeps event bucketing off the cycles × events path.
 */
const findCycleIndex = (windows: CycleWindow[], timestamp: number): number => {
  let low = 0
  let high = windows.length - 1
  let candidate = -1

  while (low <= high) {
    const mid = (low + high) >> 1

    if (windows[mid].startSeconds <= timestamp) {
      candidate = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return candidate !== -1 && timestamp < windows[candidate].endSeconds ? candidate : -1
}

interface CycleSplit {
  backersFiat: Big
  buildersFiat: Big
}

/**
 * Assigns every NotifyReward event to the cycle it fell in, in a single pass over the events.
 *
 * Doing this per cycle instead meant re-walking every gauge's full event list once for each
 * cycle on the page, and that whole fold re-runs on every price tick.
 */
const bucketRewardEventsByCycle = (
  notifyRewards: UseGetGaugesNotifyRewardReturnType,
  prices: GetPricesResult,
  windows: CycleWindow[],
): Map<number, CycleSplit> => {
  const buckets = new Map<number, CycleSplit>()

  for (const events of Object.values(notifyRewards)) {
    for (const event of events) {
      // Blockscout hands back a hex string here even though the type says number.
      const timestamp = Number(event.timeStamp)
      if (!Number.isFinite(timestamp)) continue

      const windowIndex = findCycleIndex(windows, timestamp)
      if (windowIndex === -1) continue

      const tokenKey = REWARD_TOKEN_KEY_BY_ADDRESS.get(event.args.rewardToken_.toLowerCase())
      if (!tokenKey) continue

      const cycleIndex = windows[windowIndex].index
      const split = buckets.get(cycleIndex) ?? { backersFiat: Big(0), buildersFiat: Big(0) }
      const price = prices[TOKENS[tokenKey].symbol]?.price ?? 0

      split.backersFiat = split.backersFiat.add(toFiat(event.args.backersAmount_, price))
      split.buildersFiat = split.buildersFiat.add(toFiat(event.args.builderAmount_, price))
      buckets.set(cycleIndex, split)
    }
  }

  return buckets
}

/**
 * Share of a cycle's distribution that went to Backers, weighted by each token's fiat value so
 * a cycle paying mostly rBTC isn't dominated by a large RIF token count.
 *
 * Returns `null` when no events fall inside the window: an unloaded cycle and a cycle that
 * genuinely paid Backers nothing must not look the same in the UI.
 */
const getBackersShare = (split: CycleSplit | undefined): number | null => {
  if (!split) return null

  const total = split.backersFiat.add(split.buildersFiat)
  if (total.eq(0)) return null

  return Number(split.backersFiat.div(total).toFixed(4))
}

/**
 * Total stRIF backing when each cycle closed, taken from the most recent daily snapshot at or
 * before the close. `DailyAllocation` only has rows for days where something changed, so the
 * last known value has to be carried forward.
 *
 * Swept once across cycles and snapshots together rather than rescanning the snapshots for
 * every cycle, which is the same answer for a fraction of the BigInt conversions.
 */
const buildBackingByCycle = (
  dailyAllocations: DailyAllocationItem[],
  windows: CycleWindow[],
): Map<number, bigint> => {
  const sortedAllocations = [...dailyAllocations].sort((a, b) => a.day - b.day)
  const byCloseAscending = [...windows].sort((a, b) => a.endSeconds - b.endSeconds)
  const backingByCycle = new Map<number, bigint>()

  let allocationIndex = 0
  let backing = 0n

  for (const { index, endSeconds } of byCloseAscending) {
    while (
      allocationIndex < sortedAllocations.length &&
      sortedAllocations[allocationIndex].day <= endSeconds
    ) {
      backing = BigInt(
        Big(sortedAllocations[allocationIndex].totalAllocation).div(WeiPerEther.toString()).toFixed(0),
      )
      allocationIndex++
    }

    backingByCycle.set(index, backing)
  }

  return backingByCycle
}

/**
 * Combined USD value of every reward ever distributed, at current prices.
 *
 * Deliberately read from the NotifyReward events rather than by summing the per-cycle
 * `rewardPerToken` totals: the events are the source the published all-time figure has always
 * used, and they aren't bounded by how many cycles the table happens to have loaded.
 */
export const getAllTimeRewardsFiat = (
  notifyRewards: UseGetGaugesNotifyRewardReturnType,
  prices: GetPricesResult,
): Big => {
  let total = Big(0)

  for (const events of Object.values(notifyRewards)) {
    for (const event of events) {
      const tokenKey = REWARD_TOKEN_KEY_BY_ADDRESS.get(event.args.rewardToken_.toLowerCase())
      if (!tokenKey) continue

      const price = prices[TOKENS[tokenKey].symbol]?.price ?? 0
      total = total.add(toFiat(event.args.backersAmount_ + event.args.builderAmount_, price))
    }
  }

  return total
}

export interface BuildCycleHistoryParams {
  cycles: CycleRewardsItem[]
  dailyAllocations: DailyAllocationItem[]
  notifyRewards: UseGetGaugesNotifyRewardReturnType
  /** Backers holding a positive allocation at each cycle's close, keyed by cycle start (seconds). */
  backersPerCycle: Record<string, number>
  prices: GetPricesResult
  /** Unix seconds used to decide which cycle is still running. */
  nowSeconds: number
}

/**
 * Folds the four independent sources behind the dashboard into one row per cycle. Each source
 * can be missing without taking the others down: a cycle with no split or no Backer count still
 * renders its rewards and backing, with the unknown fields set to `null`.
 */
export const buildCycleHistory = ({
  cycles,
  dailyAllocations,
  notifyRewards,
  backersPerCycle,
  prices,
  nowSeconds,
}: BuildCycleHistoryParams): CycleHistoryEntry[] => {
  const windows: CycleWindow[] = cycles
    .map((cycle, index) => {
      const startSeconds = Number(cycle.currentCycleStart)

      return { index, startSeconds, endSeconds: startSeconds + Number(cycle.currentCycleDuration) }
    })
    .sort((a, b) => a.startSeconds - b.startSeconds)

  const backingByCycle = buildBackingByCycle(dailyAllocations, windows)
  const splitByCycle = bucketRewardEventsByCycle(notifyRewards, prices, windows)

  return cycles
    .map<CycleHistoryEntry>((cycle, index) => {
      const startSeconds = Number(cycle.currentCycleStart)
      const durationSeconds = Number(cycle.currentCycleDuration)
      const endSeconds = startSeconds + durationSeconds
      const { rewards, rewardsFiat } = buildRewards(cycle.rewardPerToken, prices)
      const backersKey = toCycleStartKey(cycle.currentCycleStart)

      return {
        cycleNumber: getCycleNumber(startSeconds, durationSeconds),
        start: new Date(startSeconds * 1000),
        end: new Date(endSeconds * 1000),
        backing: backingByCycle.get(index) ?? 0n,
        rewards,
        rewardsFiat,
        backersShare: getBackersShare(splitByCycle.get(index)),
        backersCount: (backersKey !== null ? backersPerCycle[backersKey] : undefined) ?? null,
        status: nowSeconds < endSeconds ? 'running' : 'settled',
      }
    })
    .sort((a, b) => b.cycleNumber - a.cycleNumber)
}
