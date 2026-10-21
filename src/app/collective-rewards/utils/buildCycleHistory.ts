import { getFiatAmount } from '@/app/shared/formatter'
import Big from '@/lib/big'
import { WeiPerEther } from '@/lib/constants'
import { REWARD_TOKEN_KEYS, RewardTokenKey, TOKENS } from '@/lib/tokens'

import { GetPricesResult } from '../../user/types'
import { getTokenTotal, TotalRewardsDistributed, UseGetGaugesNotifyRewardReturnType } from '../rewards'
import { CycleHistoryEntry, CycleRewardsItem, CycleTokenReward, DailyAllocationItem } from '../types'
import { getCycleNumber } from './getCycleNumber'

const REWARD_TOKEN_KEY_BY_ADDRESS = new Map<string, RewardTokenKey>(
  REWARD_TOKEN_KEYS.map(tokenKey => [TOKENS[tokenKey].address.toLowerCase(), tokenKey]),
)

export const toCycleStartKey = (value: string | number | bigint): string | null => {
  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds > 0 ? String(Math.trunc(seconds)) : null
}

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
      fiatValue: getFiatAmount(value, prices[symbol]?.price ?? 0),
    }
  })

  return {
    rewards,
    rewardsFiat: rewards.reduce((acc, { fiatValue }) => acc.add(fiatValue), Big(0)),
  }
}

interface CycleWindow {
  index: number
  startSeconds: number
  endSeconds: number
}

/** Binary search over windows sorted by start. Returns -1 when no window contains `timestamp`. */
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

const bucketRewardEventsByCycle = (
  notifyRewards: UseGetGaugesNotifyRewardReturnType,
  prices: GetPricesResult,
  windows: CycleWindow[],
): Map<number, CycleSplit> => {
  const buckets = new Map<number, CycleSplit>()

  for (const events of Object.values(notifyRewards)) {
    for (const event of events) {
      const windowIndex = findCycleIndex(windows, event.timeStamp)
      if (windowIndex === -1) continue

      const tokenKey = REWARD_TOKEN_KEY_BY_ADDRESS.get(event.args.rewardToken_.toLowerCase())
      if (!tokenKey) continue

      const cycleIndex = windows[windowIndex].index
      const split = buckets.get(cycleIndex) ?? { backersFiat: Big(0), buildersFiat: Big(0) }
      const price = prices[TOKENS[tokenKey].symbol]?.price ?? 0

      split.backersFiat = split.backersFiat.add(getFiatAmount(event.args.backersAmount_, price))
      split.buildersFiat = split.buildersFiat.add(getFiatAmount(event.args.builderAmount_, price))
      buckets.set(cycleIndex, split)
    }
  }

  return buckets
}

/** Weighted by fiat value, not token count. `null` when no events landed, which is not a 0% share. */
const getBackersShare = (split: CycleSplit | undefined): number | null => {
  if (!split) return null

  const total = split.backersFiat.add(split.buildersFiat)
  if (total.eq(0)) return null

  return Number(split.backersFiat.div(total).toFixed(4))
}

/**
 * Backing at each cycle's close: the last daily snapshot before it, carried forward since
 * `DailyAllocation` only has rows for days with changes. `day` is a UTC-midnight bucket holding
 * that day's changes, and cycles close at midnight, so `day === end` already belongs to the next
 * cycle. Cycles older than the earliest snapshot get no entry — the snapshots are paged, and a
 * zero there would read as a cycle nobody backed.
 */
const buildBackingByCycle = (
  dailyAllocations: DailyAllocationItem[],
  windows: CycleWindow[],
): Map<number, bigint> => {
  const sortedAllocations = [...dailyAllocations].sort((a, b) => a.day - b.day)
  const byCloseAscending = [...windows].sort((a, b) => a.endSeconds - b.endSeconds)
  const backingByCycle = new Map<number, bigint>()

  let allocationIndex = 0
  let backing: bigint | null = null

  for (const { index, endSeconds } of byCloseAscending) {
    while (
      allocationIndex < sortedAllocations.length &&
      sortedAllocations[allocationIndex].day < endSeconds
    ) {
      backing = BigInt(
        Big(sortedAllocations[allocationIndex].totalAllocation).div(WeiPerEther.toString()).toFixed(0),
      )
      allocationIndex++
    }

    if (backing !== null) backingByCycle.set(index, backing)
  }

  return backingByCycle
}

/** From the all-time per-token totals, so it isn't bounded by how many cycles are loaded. */
export const getAllTimeRewardsFiat = (totals: TotalRewardsDistributed, prices: GetPricesResult): Big =>
  REWARD_TOKEN_KEYS.reduce((acc, tokenKey) => {
    const { address, symbol } = TOKENS[tokenKey]

    return acc.add(getFiatAmount(getTokenTotal(totals, address), prices[symbol]?.price ?? 0))
  }, Big(0))

export interface BuildCycleHistoryParams {
  cycles: CycleRewardsItem[]
  dailyAllocations: DailyAllocationItem[]
  notifyRewards: UseGetGaugesNotifyRewardReturnType
  /** Keyed by cycle start in seconds. */
  backersPerCycle: Record<string, number>
  prices: GetPricesResult
  nowSeconds: number
}

/** One row per cycle, newest first. Fields a source can't answer are `null`, never zero. */
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
        id: cycle.id,
        cycleNumber: getCycleNumber(startSeconds, durationSeconds),
        start: new Date(startSeconds * 1000),
        end: new Date(endSeconds * 1000),
        backing: backingByCycle.get(index) ?? null,
        rewards,
        rewardsFiat,
        backersShare: getBackersShare(splitByCycle.get(index)),
        backersCount: (backersKey !== null ? backersPerCycle[backersKey] : undefined) ?? null,
        status: nowSeconds < endSeconds ? 'running' : 'settled',
      }
    })
    .sort((a, b) => b.cycleNumber - a.cycleNumber)
}
