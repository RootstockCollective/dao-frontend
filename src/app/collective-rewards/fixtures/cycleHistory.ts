import Big from '@/lib/big'
import { WeiPerEther } from '@/lib/constants'
import { REWARD_TOKEN_KEYS, RewardTokenKey, TOKENS } from '@/lib/tokens'

import { ONE_DAY_IN_MS } from '../constants/chartConstants'
import { CycleHistoryEntry, CycleTokenReward } from '../types'

/**
 * Deterministic cycle history for Storybook and tests.
 *
 * Everything is anchored to a fixed date rather than `Date.now()` so snapshots stay stable,
 * and the per-token amounts are derived from the fiat totals at the prices below, so a story
 * never shows a breakdown that fails to add up to its own header.
 */

const CYCLE_DURATION_DAYS = 14

/** Close of the most recent cycle in the fixture. */
const ANCHOR_END = new Date('2026-08-06T00:00:00Z')

const FIXTURE_PRICES: Record<RewardTokenKey, number> = {
  rif: 0.0801,
  rbtc: 118_000,
  usdrif: 1,
}

/** How a cycle's distribution splits across the three reward tokens. Sums to 1. */
const TOKEN_WEIGHTS: Record<RewardTokenKey, number> = {
  rbtc: 0.74,
  usdrif: 0.12,
  rif: 0.14,
}

interface CycleSeed {
  cycleNumber: number
  /** Total stRIF backing at the cycle's close, in whole tokens. */
  backing: number
  /** Combined USD value distributed in the cycle. */
  rewardsUsd: number
  backersShare: number
  backersCount: number
}

const SEEDS: CycleSeed[] = [
  { cycleNumber: 46, backing: 26_800_000, rewardsUsd: 421_000, backersShare: 0.64, backersCount: 292 },
  { cycleNumber: 45, backing: 26_600_000, rewardsUsd: 409_000, backersShare: 0.65, backersCount: 286 },
  { cycleNumber: 44, backing: 27_400_000, rewardsUsd: 402_000, backersShare: 0.64, backersCount: 279 },
  { cycleNumber: 43, backing: 27_100_000, rewardsUsd: 388_000, backersShare: 0.66, backersCount: 271 },
  { cycleNumber: 42, backing: 27_800_000, rewardsUsd: 379_000, backersShare: 0.65, backersCount: 263 },
  { cycleNumber: 41, backing: 27_500_000, rewardsUsd: 366_000, backersShare: 0.64, backersCount: 251 },
  { cycleNumber: 40, backing: 27_900_000, rewardsUsd: 352_000, backersShare: 0.66, backersCount: 244 },
  { cycleNumber: 39, backing: 27_200_000, rewardsUsd: 344_000, backersShare: 0.65, backersCount: 236 },
  { cycleNumber: 38, backing: 22_100_000, rewardsUsd: 331_000, backersShare: 0.63, backersCount: 227 },
  { cycleNumber: 37, backing: 26_400_000, rewardsUsd: 318_000, backersShare: 0.64, backersCount: 214 },
]

/** Turn a cycle's USD total into the per-token amounts that produce exactly that total. */
const buildTokenRewards = (rewardsUsd: number): CycleTokenReward[] =>
  REWARD_TOKEN_KEYS.map(tokenKey => {
    const fiatValue = Big(rewardsUsd).mul(TOKEN_WEIGHTS[tokenKey])
    const amount = fiatValue.div(FIXTURE_PRICES[tokenKey])

    return {
      tokenKey,
      symbol: TOKENS[tokenKey].symbol,
      value: BigInt(amount.mul(WeiPerEther.toString()).toFixed(0)),
      fiatValue,
    }
  })

const buildEntry = (seed: CycleSeed, index: number): CycleHistoryEntry => {
  const end = new Date(ANCHOR_END.getTime() - index * CYCLE_DURATION_DAYS * ONE_DAY_IN_MS)
  const start = new Date(end.getTime() - CYCLE_DURATION_DAYS * ONE_DAY_IN_MS)
  const rewards = buildTokenRewards(seed.rewardsUsd)

  return {
    cycleNumber: seed.cycleNumber,
    start,
    end,
    backing: BigInt(seed.backing),
    rewards,
    rewardsFiat: rewards.reduce((acc, { fiatValue }) => acc.add(fiatValue), Big(0)),
    backersShare: seed.backersShare,
    backersCount: seed.backersCount,
    // The newest cycle is the one still open; every earlier cycle has settled.
    status: index === 0 ? 'running' : 'settled',
  }
}

export const mockCycleHistory: CycleHistoryEntry[] = SEEDS.map(buildEntry)

export const mockRunningCycle = mockCycleHistory[0]

/** Same history with the fields the indexer can't answer yet blanked out. */
export const mockCycleHistoryWithoutCounts: CycleHistoryEntry[] = mockCycleHistory.map(entry => ({
  ...entry,
  backersShare: null,
  backersCount: null,
}))
