import { BackingPoint, RewardsPoint, CycleWindow, DailyAllocationItem, CycleRewardsItem } from '../types'
import { ONE_DAY_IN_SECONDS, FIVE_MONTHS_IN_MS, FIRST_CYCLE_START_SECONDS } from '../constants/chartConstants'
import Big from '@/lib/big'
import { USD, WeiPerEther } from '@/lib/constants'
import { getCombinedFiatAmount } from './getCombinedFiatAmount'
import { TokenSymbol } from '@/components/TokenImage'

export const convertToTimestamp = (d: Date | number | string): number => new Date(d).getTime()

const WeiPerEtherString = WeiPerEther.toString()

export const formatShort = (n: number) => {
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `${Math.round(n / 1_000_000_000)} B`
  if (abs >= 1_000_000) return `${Math.round(n / 1_000_000)} M`
  if (abs >= 1_000) return `${Math.round(n / 1_000)} K`
  return `${n.toLocaleString()}`
}

/**
 * Filter data to show only the last n months
 */
const filterToLastMonths = <T extends { day?: Date | number | string; start?: Date; end?: Date }>(
  data: T[],
  customMinDate?: number,
  monthsInMs: number = FIVE_MONTHS_IN_MS,
): T[] => {
  const now = Date.now()
  const fiveMonthsAgo = now - monthsInMs
  const minDate = customMinDate || fiveMonthsAgo

  return data.filter(item => {
    // For cycles
    if (item.start && item.end) {
      const cycleEnd = convertToTimestamp(item.end)
      return cycleEnd >= minDate
    }

    // For backing and rewards
    if (item.day) {
      const itemTime = convertToTimestamp(item.day)
      return itemTime >= minDate
    }

    return false
  })
}

/**
 * Generic function to fill gaps between dates with the last known value
 * Creates daily data points from sparse data using functional approach
 */
const interpolateDataByDay = <T extends { day?: number; currentCycleStart?: string }>(
  data: T[],
  getTimestamp: (item: T) => number,
  createInterpolatedItem: (day: number, lastKnownItem: T) => T,
): T[] => {
  const sortedData = [...data].sort((a, b) => getTimestamp(a) - getTimestamp(b))
  const startDate = getTimestamp(sortedData[0])
  const endDate = Date.now() / 1000 + ONE_DAY_IN_SECONDS

  const dataMap = new Map(sortedData.map(item => [getTimestamp(item), item]))

  const totalDays = Math.floor((endDate - startDate) / ONE_DAY_IN_SECONDS) + 1
  const allDays = Array.from({ length: totalDays }, (_, i) => startDate + i * ONE_DAY_IN_SECONDS)

  return allDays.map(day => {
    const actualData = dataMap.get(day)

    if (actualData) {
      return actualData
    }

    const lastKnownItem = sortedData.filter(item => getTimestamp(item) <= day).pop() || sortedData[0]

    return createInterpolatedItem(day, lastKnownItem)
  })
}

/**
 * Calculate USD value from RIF and RBTC rewards using getCombinedFiatAmount
 */
const calculateRewardsUSD = (
  rifAmountWei: string,
  rbtcAmountWei: string,
  rifPrice: number,
  rbtcPrice: number,
): number => {
  const rewardAmounts = [
    {
      value: BigInt(rifAmountWei),
      price: rifPrice,
      symbol: TokenSymbol.RIF,
      currency: USD,
    },
    {
      value: BigInt(rbtcAmountWei),
      price: rbtcPrice,
      symbol: TokenSymbol.RBTC,
      currency: USD,
    },
  ]

  return getCombinedFiatAmount(rewardAmounts).toNumber()
}

/**
 * Transform backing data to BackingPoint format with interpolation
 */
const transformBackingData = (backingData: DailyAllocationItem[]): BackingPoint[] => {
  const interpolatedData = interpolateDataByDay(
    backingData,
    item => item.day,
    (day, lastKnownItem) => ({
      id: `interpolated-${day}`,
      day,
      totalAllocation: lastKnownItem.totalAllocation,
    }),
  )

  return interpolatedData.map(item => ({
    day: new Date(item.day * 1000),
    backing: BigInt(Big(item.totalAllocation).div(WeiPerEtherString).toFixed(0)),
    backingWei: BigInt(item.totalAllocation),
  }))
}

/**
 * Transform cycle rewards data to RewardsPoint format with interpolation
 */
const transformRewardsData = (
  rewardsData: CycleRewardsItem[],
  rifPrice: number,
  rbtcPrice: number,
): RewardsPoint[] => {
  let cumulativeRifRewards = 0n
  let cumulativeRbtcRewards = 0n

  const accumulatedCycleRewards = rewardsData.map((item, _) => {
    const currentRifRewards = BigInt(item.rewardsERC20)
    const currentRbtcRewards = BigInt(item.rewardsRBTC)

    cumulativeRifRewards += currentRifRewards
    cumulativeRbtcRewards += currentRbtcRewards

    return {
      ...item,
      rewardsERC20: cumulativeRifRewards.toString(),
      rewardsRBTC: cumulativeRbtcRewards.toString(),
    }
  })

  const interpolatedData = interpolateDataByDay(
    accumulatedCycleRewards,
    item => Number(item.currentCycleStart),
    (day, lastKnownItem) => ({
      ...lastKnownItem,
      id: `interpolated-${day}`,
      currentCycleStart: day.toString(),
    }),
  )

  return interpolatedData.map(item => ({
    day: new Date(Number(item.currentCycleStart) * 1000),
    rewards: {
      rif: BigInt(Big(item.rewardsERC20).div(WeiPerEtherString).toFixed(0)),
      rbtc: BigInt(Big(item.rewardsRBTC).div(WeiPerEtherString).toFixed(0)),
      usd: calculateRewardsUSD(item.rewardsERC20, item.rewardsRBTC, rifPrice, rbtcPrice),
    },
  }))
}

/**
 * Transform cycle rewards data to CycleWindow format
 */
const transformCyclesData = (rewardsData: CycleRewardsItem[]): CycleWindow[] => {
  return rewardsData.map(item => {
    const startDate = new Date(Number(item.currentCycleStart) * 1000)
    const endDate = new Date((Number(item.currentCycleStart) + Number(item.currentCycleDuration)) * 1000)

    const cycleNumber =
      Math.floor(
        (Number(item.currentCycleStart) - FIRST_CYCLE_START_SECONDS) / Number(item.currentCycleDuration),
      ) + 1

    return {
      start: startDate,
      end: endDate,
      label: `cycle ${cycleNumber}`,
      cycleDuration: Number(item.currentCycleDuration),
      cycleNumber,
    }
  })
}

export const transformApiDataToChartData = (
  backingData: DailyAllocationItem[],
  rewardsData: CycleRewardsItem[],
  rifPrice: number,
  rbtcPrice: number,
) => {
  if (backingData.length === 0 || rewardsData.length === 0)
    return {
      backingSeries: [],
      rewardsSeries: [],
      cycles: [],
    }

  const sortedBackingData = [...backingData].sort((a, b) => a.day - b.day)
  const sortedRewardsData = [...rewardsData].sort(
    (a, b) => Number(a.currentCycleStart) - Number(b.currentCycleStart),
  )

  const backingSeries: BackingPoint[] = transformBackingData(sortedBackingData)
  const rewardsSeries: RewardsPoint[] = transformRewardsData(sortedRewardsData, rifPrice, rbtcPrice)
  const cycles: CycleWindow[] = transformCyclesData(sortedRewardsData)

  const filteredRewardsSeries = filterToLastMonths(rewardsSeries)
  const filteredCycles = filterToLastMonths(cycles)

  const minDate = convertToTimestamp(filteredRewardsSeries[0].day)
  const filteredBackingSeries = filterToLastMonths(backingSeries, minDate)

  return {
    backingSeries: filteredBackingSeries,
    rewardsSeries: filteredRewardsSeries,
    cycles: filteredCycles,
  }
}
