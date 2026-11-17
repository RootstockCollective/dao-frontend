import { Address } from 'viem'
import { describe, expect, it } from 'vitest'

import { WeiPerEther } from '@/lib/constants'
import { TOKENS } from '@/lib/tokens'

import { GetPricesResult } from '../../user/types'
import { FIRST_CYCLE_START_SECONDS, ONE_DAY_IN_SECONDS } from '../constants/chartConstants'
import { UseGetGaugesNotifyRewardReturnType } from '../rewards'
import { CycleRewardsItem, DailyAllocationItem } from '../types'
import {
  buildBackingSeries,
  buildCycleHistory,
  getAllTimeRewardsFiat,
  toCycleStartKey,
} from './buildCycleHistory'
import { getCycleNumber } from './getCycleNumber'

const CYCLE_DURATION = 14 * ONE_DAY_IN_SECONDS
const GAUGE = '0x0000000000000000000000000000000000000001' as Address

const cycleStart = (cycleNumber: number) => FIRST_CYCLE_START_SECONDS + (cycleNumber - 1) * CYCLE_DURATION

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

    it('treats the day bucket starting at the close as the next cycle', () => {
      // Cycles close at UTC midnight and the bucket at `end` holds the next day's changes.
      const [entry] = build({
        cycles: [cycleItem(10)],
        dailyAllocations: [
          allocation(cycleStart(10) + CYCLE_DURATION - ONE_DAY_IN_SECONDS, 1_000),
          allocation(cycleStart(10) + CYCLE_DURATION, 9_999),
        ],
      })

      expect(entry.backing).toBe(1_000n)
    })

    it('is unknown, not zero, when no snapshot precedes the cycle', () => {
      const [entry] = build({
        cycles: [cycleItem(10)],
        dailyAllocations: [allocation(cycleStart(20), 5_000)],
      })

      expect(entry.backing).toBeNull()
    })

    it('leaves only the cycles that predate the earliest snapshot unknown', () => {
      const [newest, middle, oldest] = build({
        cycles: [cycleItem(8), cycleItem(9), cycleItem(10)],
        dailyAllocations: [allocation(cycleStart(9) + ONE_DAY_IN_SECONDS, 7_000)],
      })

      expect(oldest.backing).toBeNull()
      expect(middle.backing).toBe(7_000n)
      expect(newest.backing).toBe(7_000n)
    })

    it('keeps a snapshot of zero as a real zero', () => {
      const [entry] = build({
        cycles: [cycleItem(10)],
        dailyAllocations: [allocation(cycleStart(10), 0)],
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
      // 1 rBTC ($100k) to Backers vs 1,000 RIF ($100) to Builders: 50/50 by count, ~99.9/0.1 by value.
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
          notifyEvent(TOKENS.rif.address, cycleStart(10) + CYCLE_DURATION, wei(0), wei(1_000)),
        ]),
      })

      expect(entry.backersShare).toBe(0.9)
    })

    it('is null when no event falls in the window, rather than zero', () => {
      const [entry] = build({
        notifyRewards: notifyRewards([notifyEvent(TOKENS.rif.address, cycleStart(3), wei(500), wei(500))]),
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

describe('buildBackingSeries', () => {
  const numbers = (series: ReturnType<typeof buildBackingSeries>) =>
    series.map(({ cycleNumber }) => cycleNumber)

  it('is empty when no cycle is indexed', () => {
    expect(buildBackingSeries([], [allocation(cycleStart(10), 1_000)])).toEqual([])
  })

  it('fills the cycles the indexer skipped, oldest first', () => {
    const series = buildBackingSeries([cycleItem(13), cycleItem(10), cycleItem(12)], [])

    expect(numbers(series)).toEqual([10, 11, 12, 13])
    expect(series.map(({ noDistribution }) => noDistribution ?? false)).toEqual([false, true, false, false])
  })

  it('gives a filled cycle its own window', () => {
    const filled = buildBackingSeries([cycleItem(10), cycleItem(12)], [])[1]

    expect(filled.start.getTime()).toBe(cycleStart(11) * 1000)
    expect(filled.end.getTime()).toBe(cycleStart(12) * 1000)
  })

  it('fills a run of skipped cycles', () => {
    expect(numbers(buildBackingSeries([cycleItem(10), cycleItem(14)], []))).toEqual([10, 11, 12, 13, 14])
  })

  it('reads a filled cycle’s backing from the snapshots like any other', () => {
    const series = buildBackingSeries(
      [cycleItem(10), cycleItem(12)],
      [allocation(cycleStart(10), 1_000), allocation(cycleStart(11) + ONE_DAY_IN_SECONDS, 2_000)],
    )

    expect(series.map(({ backing }) => backing)).toEqual([1_000n, 2_000n, 2_000n])
  })

  it('matches the history rows’ backing for the cycles both describe', () => {
    const cycles = [cycleItem(8), cycleItem(10), cycleItem(11)]
    const dailyAllocations = [
      allocation(cycleStart(8) + ONE_DAY_IN_SECONDS, 3_000),
      allocation(cycleStart(9) + ONE_DAY_IN_SECONDS, 4_000),
      allocation(cycleStart(11), 5_000),
    ]

    const series = buildBackingSeries(cycles, dailyAllocations)
    const rows = build({ cycles, dailyAllocations })

    for (const row of rows) {
      expect(series.find(({ cycleNumber }) => cycleNumber === row.cycleNumber)?.backing).toBe(row.backing)
    }
  })

  it('leaves a gap the cycle duration does not divide, rather than guess its windows', () => {
    const shifted = { ...cycleItem(12), currentCycleStart: String(cycleStart(12) + 3_600) }

    expect(buildBackingSeries([cycleItem(10), shifted], [])).toHaveLength(2)
  })

  it('plots a cycle indexed twice once', () => {
    expect(numbers(buildBackingSeries([cycleItem(10), cycleItem(10), cycleItem(11)], []))).toEqual([10, 11])
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
  it('sums every reward token at current prices', () => {
    // 1,000 RIF at $0.10, plus 1 rBTC at $100k.
    const total = getAllTimeRewardsFiat(
      {
        [TOKENS.rif.address.toLowerCase()]: wei(1_000),
        [TOKENS.rbtc.address.toLowerCase()]: wei(1),
      },
      prices,
    )

    expect(total.toNumber()).toBe(100_100)
  })

  it('ignores tokens that are not reward tokens', () => {
    const total = getAllTimeRewardsFiat({ [GAUGE.toLowerCase()]: wei(1_000) }, prices)

    expect(total.toNumber()).toBe(0)
  })

  it('is zero when nothing has loaded', () => {
    expect(getAllTimeRewardsFiat({}, prices).toNumber()).toBe(0)
  })
})
