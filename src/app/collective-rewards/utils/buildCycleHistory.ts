import { isAddressEqual } from 'viem'

import Big from '@/lib/big'
import { WeiPerEther } from '@/lib/constants'
import { REWARD_TOKEN_KEYS, RewardTokenKey, TOKENS } from '@/lib/tokens'

import { GetPricesResult } from '../../user/types'
import { FIRST_CYCLE_START_SECONDS } from '../constants/chartConstants'
import { UseGetGaugesNotifyRewardReturnType } from '../rewards'
import { CycleHistoryEntry, CycleRewardsItem, CycleTokenReward, DailyAllocationItem } from '../types'

const toFiat = (value: bigint, price: number): Big =>
  Big(value.toString()).div(WeiPerEther.toString()).mul(price)

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

/**
 * Total stRIF backing when the cycle closed, taken from the most recent daily snapshot at or
 * before the close. `DailyAllocation` only has rows for days where something changed, so the
 * last known value has to be carried forward.
 */
const getBackingAtClose = (sortedAllocations: DailyAllocationItem[], cycleEndSeconds: number): bigint => {
  let backing = 0n

  for (const { day, totalAllocation } of sortedAllocations) {
    if (day > cycleEndSeconds) break
    backing = BigInt(Big(totalAllocation).div(WeiPerEther.toString()).toFixed(0))
  }

  return backing
}

/**
 * Share of a cycle's distribution that went to Backers, weighted by each token's fiat value so
 * a cycle paying mostly rBTC isn't dominated by a large RIF token count.
 *
 * Returns `null` when no events fall inside the window: an unloaded cycle and a cycle that
 * genuinely paid Backers nothing must not look the same in the UI.
 */
const getBackersShare = (
  notifyRewards: UseGetGaugesNotifyRewardReturnType,
  prices: GetPricesResult,
  cycleStartSeconds: number,
  cycleEndSeconds: number,
): number | null => {
  let backersFiat = Big(0)
  let buildersFiat = Big(0)
  let matched = false

  for (const events of Object.values(notifyRewards)) {
    for (const event of events) {
      // Blockscout hands back a hex string here even though the type says number.
      const timestamp = Number(event.timeStamp)
      if (!Number.isFinite(timestamp)) continue
      if (timestamp < cycleStartSeconds || timestamp >= cycleEndSeconds) continue

      const tokenKey = REWARD_TOKEN_KEYS.find((key: RewardTokenKey) =>
        isAddressEqual(event.args.rewardToken_, TOKENS[key].address),
      )
      if (!tokenKey) continue

      const price = prices[TOKENS[tokenKey].symbol]?.price ?? 0
      backersFiat = backersFiat.add(toFiat(event.args.backersAmount_, price))
      buildersFiat = buildersFiat.add(toFiat(event.args.builderAmount_, price))
      matched = true
    }
  }

  if (!matched) return null

  const total = backersFiat.add(buildersFiat)
  if (total.eq(0)) return null

  return Number(backersFiat.div(total).toFixed(4))
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
  const sortedAllocations = [...dailyAllocations].sort((a, b) => a.day - b.day)

  return cycles
    .map<CycleHistoryEntry>(cycle => {
      const startSeconds = Number(cycle.currentCycleStart)
      const durationSeconds = Number(cycle.currentCycleDuration)
      const endSeconds = startSeconds + durationSeconds
      const { rewards, rewardsFiat } = buildRewards(cycle.rewardPerToken, prices)

      return {
        cycleNumber: getCycleNumber(startSeconds, durationSeconds),
        start: new Date(startSeconds * 1000),
        end: new Date(endSeconds * 1000),
        backing: getBackingAtClose(sortedAllocations, endSeconds),
        rewards,
        rewardsFiat,
        backersShare: getBackersShare(notifyRewards, prices, startSeconds, endSeconds),
        backersCount: backersPerCycle[cycle.currentCycleStart] ?? null,
        status: nowSeconds < endSeconds ? 'running' : 'settled',
      }
    })
    .sort((a, b) => b.cycleNumber - a.cycleNumber)
}
