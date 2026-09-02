import { Address } from 'viem'
import { describe, expect, it } from 'vitest'

import { WeiPerEther } from '@/lib/constants'
import { TOKENS } from '@/lib/tokens'

import { GetPricesResult } from '../../user/types'
import { FIRST_CYCLE_START_SECONDS, ONE_DAY_IN_SECONDS } from '../constants/chartConstants'
import { UseGetGaugesNotifyRewardReturnType } from '../rewards'
import { CycleRewardsItem, DailyAllocationItem } from '../types'
import { buildCycleHistory, getAllTimeRewardsFiat, getCycleNumber, toCycleStartKey } from './buildCycleHistory'

const CYCLE_DURATION = 14 * ONE_DAY_IN_SECONDS
const GAUGE = '0x0000000000000000000000000000000000000001' as Address

/** Start of the Nth cycle, so tests can talk in cycle numbers instead of timestamps. */
const cycleStart = (cycleNumber: number) =>
  FIRST_CYCLE_START_SECONDS + (cycleNumber - 1) * CYCLE_DURATION

const wei = (amount: number) => BigInt(amount) * WeiPerEther

const prices: GetPricesResult = {
  [TOKENS.rif.symbol]: { price: 0.1, lastUpdated: '' },
  [TOKENS.rbtc.symbol]: { price: 100_000, lastUpdated: '' },
  [TOKENS.usdrif.symbol]: { price: 1, lastUpdated: '' },
}

const cycleItem = (cycleNumber: number, rewardPerToken: Record<string, string> = {}): CycleRewardsItem => ({
  id: `cycle-${cycleNumber}`,
  currentCycleStart: String(cycleStart(cycleNumber)),
  currentCycleDuration: String(CYCLE_DURATION),
  distributionDuration: '3600',
  onDistributionPeriod: false,
  rewardPerToken,
})

const rifRewards = (amount: number) => ({ [TOKENS.rif.address.toLowerCase()]: wei(amount).toString() })

const allocation = (day: number, whole: number): DailyAllocationItem => ({
  id: `alloc-${day}`,
  day,
  totalAllocation: (BigInt(whole) * WeiPerEther).toString(),
})

const notifyEvent = (tokenAddress: Address, timeStamp: number, backers: bigint, builders: bigint) =>
  ({
    args: { rewardToken_: tokenAddress, backersAmount_: backers, builderAmount_: builders },
    timeStamp,
  }) as unknown as UseGetGaugesNotifyRewardReturnType[Address][number]

const build = (overrides: Partial<Parameters<typeof buildCycleHistory>[0]> = {}) =>
  buildCycleHistory({
    cycles: [cycleItem(10)],
    dailyAllocations: [],
    notifyRewards: {},
    backersPerCycle: {},
    prices,
    nowSeconds: cycleStart(11),
    ...overrides,
  })

describe('getCycleNumber', () => {
  it('numbers the first cycle 1', () => {
    expect(getCycleNumber(FIRST_CYCLE_START_SECONDS, CYCLE_DURATION)).toBe(1)
  })

  it('numbers later cycles by elapsed duration', () => {
    expect(getCycleNumber(cycleStart(23), CYCLE_DURATION)).toBe(23)
  })
})

describe('buildCycleHistory', () => {
  it('maps a cycle to its number, window and fiat total', () => {
    const [entry] = build({ cycles: [cycleItem(10, rifRewards(1_000))] })

    expect(entry.cycleNumber).toBe(10)
    expect(entry.start.getTime()).toBe(cycleStart(10) * 1000)
    expect(entry.end.getTime()).toBe((cycleStart(10) + CYCLE_DURATION) * 1000)
    // 1,000 RIF at $0.10
    expect(entry.rewardsFiat.toNumber()).toBe(100)
  })

  it('returns newest cycle first', () => {
    const entries = build({ cycles: [cycleItem(8), cycleItem(10), cycleItem(9)] })

    expect(entries.map(({ cycleNumber }) => cycleNumber)).toEqual([10, 9, 8])
  })

  it('always reports every reward token, at zero when the cycle paid none', () => {
    const [entry] = build({ cycles: [cycleItem(10, rifRewards(5))] })

    expect(entry.rewards).toHaveLength(3)
    expect(entry.rewards.filter(({ value }) => value === 0n)).toHaveLength(2)
  })

  describe('backing', () => {
    it('carries the last known allocation forward to the cycle close', () => {
      // Only one snapshot, days before the cycle ends: it still applies at close.
      const [entry] = build({
        cycles: [cycleItem(10)],
        dailyAllocations: [allocation(cycleStart(10) + ONE_DAY_IN_SECONDS, 26_800_000)],
      })

      expect(entry.backing).toBe(26_800_000n)
    })

    it('ignores snapshots taken after the cycle closed', () => {
      const [entry] = build({
        cycles: [cycleItem(10)],
        dailyAllocations: [
          allocation(cycleStart(10), 1_000),
          allocation(cycleStart(10) + CYCLE_DURATION + ONE_DAY_IN_SECONDS, 9_999),
        ],
      })

      expect(entry.backing).toBe(1_000n)
    })

    it('is zero when no snapshot precedes the cycle', () => {
      const [entry] = build({
        cycles: [cycleItem(10)],
        dailyAllocations: [allocation(cycleStart(20), 5_000)],
      })

      expect(entry.backing).toBe(0n)
    })
  })

  describe('backer/builder split', () => {
    const notifyRewards = (events: ReturnType<typeof notifyEvent>[]) =>
      ({ [GAUGE]: events }) as UseGetGaugesNotifyRewardReturnType

    it('splits by fiat value across the cycle window', () => {
      const [entry] = build({
        notifyRewards: notifyRewards([
          notifyEvent(TOKENS.rif.address, cycleStart(10) + 100, wei(600), wei(400)),
        ]),
      })

      expect(entry.backersShare).toBe(0.6)
    })

    it('weights tokens by price rather than raw amount', () => {
      // 1 rBTC to Backers ($100k) against 1,000 RIF to Builders ($100) — a token-count
      // split would read as 50/50 instead of ~99.9/0.1.
      const [entry] = build({
        notifyRewards: notifyRewards([
          notifyEvent(TOKENS.rbtc.address, cycleStart(10) + 100, wei(1), 0n),
          notifyEvent(TOKENS.rif.address, cycleStart(10) + 200, 0n, wei(1_000)),
        ]),
      })

      expect(entry.backersShare).toBeCloseTo(0.999, 3)
    })

    it('excludes events outside the cycle window', () => {
      const [entry] = build({
        notifyRewards: notifyRewards([
          notifyEvent(TOKENS.rif.address, cycleStart(10) + 100, wei(900), wei(100)),
          // Belongs to the next cycle: the boundary is exclusive at the end.
          notifyEvent(TOKENS.rif.address, cycleStart(10) + CYCLE_DURATION, wei(0), wei(1_000)),
        ]),
      })

      expect(entry.backersShare).toBe(0.9)
    })

    it('accepts the hex timestamps Blockscout actually returns', () => {
      const hexTimestamp = `0x${(cycleStart(10) + 100).toString(16)}` as unknown as number

      const [entry] = build({
        notifyRewards: notifyRewards([
          notifyEvent(TOKENS.rif.address, hexTimestamp, wei(700), wei(300)),
        ]),
      })

      expect(entry.backersShare).toBe(0.7)
    })

    it('is null when no event falls in the window, rather than zero', () => {
      const [entry] = build({
        notifyRewards: notifyRewards([
          notifyEvent(TOKENS.rif.address, cycleStart(3), wei(500), wei(500)),
        ]),
      })

      expect(entry.backersShare).toBeNull()
    })

    it('is null when nothing has loaded', () => {
      expect(build().at(0)?.backersShare).toBeNull()
    })
  })

  describe('backers count', () => {
    it('reads the count keyed by cycle start', () => {
      const [entry] = build({ backersPerCycle: { [String(cycleStart(10))]: 292 } })

      expect(entry.backersCount).toBe(292)
    })

    it('is null when the cycle has no count', () => {
      const [entry] = build({ backersPerCycle: { [String(cycleStart(3))]: 10 } })

      expect(entry.backersCount).toBeNull()
    })

    it('looks the cycle up by its normalised key', () => {
      // What the hook stores: `toCycleStartKey` is applied on both sides of the join.
      const key = toCycleStartKey(`${cycleStart(10)}.0`)!
      const [entry] = build({ backersPerCycle: { [key]: 292 } })

      expect(entry.backersCount).toBe(292)
    })
  })

  describe('status', () => {
    it('marks a cycle running until its end passes', () => {
      const [entry] = build({ nowSeconds: cycleStart(10) + ONE_DAY_IN_SECONDS })

      expect(entry.status).toBe('running')
    })

    it('marks a cycle settled once it closes', () => {
      const [entry] = build({ nowSeconds: cycleStart(10) + CYCLE_DURATION })

      expect(entry.status).toBe('settled')
    })
  })

  it('assigns each event to its own cycle in one pass', () => {
    // The bucketing is a binary search over cycle windows rather than a rescan per cycle;
    // this is the case that breaks if a boundary is off by one.
    const entries = build({
      cycles: [cycleItem(10), cycleItem(11), cycleItem(12)],
      notifyRewards: {
        [GAUGE]: [
          notifyEvent(TOKENS.rif.address, cycleStart(10) + 1, wei(900), wei(100)),
          notifyEvent(TOKENS.rif.address, cycleStart(11) + 1, wei(100), wei(900)),
        ],
      } as UseGetGaugesNotifyRewardReturnType,
      nowSeconds: cycleStart(13),
    })

    const byCycle = new Map(entries.map(({ cycleNumber, backersShare }) => [cycleNumber, backersShare]))

    expect(byCycle.get(10)).toBe(0.9)
    expect(byCycle.get(11)).toBe(0.1)
    expect(byCycle.get(12)).toBeNull()
  })
})

describe('toCycleStartKey', () => {
  it('normalises the shapes a cycle start arrives in', () => {
    for (const raw of ['1747008000', '1747008000.0', 1747008000, ' 1747008000 ']) {
      expect(toCycleStartKey(raw)).toBe('1747008000')
    }
  })

  it('returns null for anything that is not a timestamp', () => {
    for (const raw of ['', 'abc', 'NaN']) {
      expect(toCycleStartKey(raw)).toBeNull()
    }
  })
})

describe('getAllTimeRewardsFiat', () => {
  const notifyRewards = (events: ReturnType<typeof notifyEvent>[]) =>
    ({ [GAUGE]: events }) as UseGetGaugesNotifyRewardReturnType

  it('sums both sides of every event at current prices', () => {
    // 600 + 400 RIF at $0.10, plus 1 rBTC at $100k.
    const total = getAllTimeRewardsFiat(
      notifyRewards([
        notifyEvent(TOKENS.rif.address, cycleStart(10), wei(600), wei(400)),
        notifyEvent(TOKENS.rbtc.address, cycleStart(2), wei(1), 0n),
      ]),
      prices,
    )

    expect(total.toNumber()).toBe(100_100)
  })

  it('counts events from cycles the table never loaded', () => {
    // The whole point of reading the events: the figure is not capped by the cycle page size.
    const total = getAllTimeRewardsFiat(
      notifyRewards([notifyEvent(TOKENS.rif.address, cycleStart(1), wei(1_000), 0n)]),
      prices,
    )

    expect(total.toNumber()).toBe(100)
  })

  it('is zero when nothing has loaded', () => {
    expect(getAllTimeRewardsFiat({}, prices).toNumber()).toBe(0)
  })
})
