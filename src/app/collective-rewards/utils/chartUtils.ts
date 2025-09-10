import { BackingPoint, RewardsPoint, CycleWindow, DailyAllocationItem, CycleRewardsItem } from '../types'
import {
  WEI_DIVISOR,
  ONE_DAY_IN_SECONDS,
  FIVE_MONTHS_IN_MS,
  FIRST_CYCLE_START_SECONDS,
  CYCLE_DURATION_SECONDS,
} from '../constants/chartConstants'

export const convertToTimestamp = (d: Date | number | string): number => new Date(d).getTime()

export const formatShort = (n: number) => {
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `${Math.round(n / 1_000_000_000)} B`
  if (abs >= 1_000_000) return `${Math.round(n / 1_000_000)} M`
  if (abs >= 1_000) return `${Math.round(n / 1_000)} K`
  return `${n.toLocaleString()}`
}

/**
 * Filter data to show only the last 5 months
 */
const filterToLastFiveMonths = <T extends { day: Date | number | string }>(data: T[]): T[] => {
  const now = Date.now()
  const fiveMonthsAgo = now - FIVE_MONTHS_IN_MS

  return data.filter(item => {
    const itemTime = convertToTimestamp(item.day)
    return itemTime >= fiveMonthsAgo
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
  if (!data || data.length === 0) return []

  const sortedData = [...data].sort((a, b) => getTimestamp(a) - getTimestamp(b))
  const startDate = getTimestamp(sortedData[0])
  const endDate = getTimestamp(sortedData[sortedData.length - 1])

  const dataMap = new Map(sortedData.map(item => [getTimestamp(item), item]))

  const totalDays = Math.floor((endDate - startDate) / ONE_DAY_IN_SECONDS) + 1
  const allDays = Array.from({ length: totalDays }, (_, i) => startDate + i * ONE_DAY_IN_SECONDS)

  let lastKnownItem = sortedData[0]

  return allDays.map(day => {
    const actualData = dataMap.get(day)

    if (actualData) {
      lastKnownItem = actualData
      return actualData
    }

    return createInterpolatedItem(day, lastKnownItem)
  })
}

/**
 * Fills gaps between dates with the last known value for DailyAllocationItem
 */
const interpolateDailyBackingData = (data: DailyAllocationItem[]): DailyAllocationItem[] => {
  return interpolateDataByDay(
    data,
    item => item.day,
    (day, lastKnownItem) => ({
      id: `interpolated-${day}`,
      day,
      totalAllocation: lastKnownItem.totalAllocation,
    }),
  )
}

/**
 * Fills gaps between dates with the last known value for CycleRewardsItem
 */
const interpolateCycleRewardsData = (data: CycleRewardsItem[], targetEndDate: number): CycleRewardsItem[] => {
  if (!data || data.length === 0) return []

  const sortedData = [...data].sort((a, b) => Number(a.currentCycleStart) - Number(b.currentCycleStart))
  const lastItem = sortedData[sortedData.length - 1]

  const extendedTargetEndDate = targetEndDate + ONE_DAY_IN_SECONDS

  const syntheticEndItem: CycleRewardsItem = {
    ...lastItem,
    id: `synthetic-end-${extendedTargetEndDate}`,
    currentCycleStart: extendedTargetEndDate.toString(),
  }

  const extendedData = [...sortedData, syntheticEndItem]

  return interpolateDataByDay(
    extendedData,
    item => Number(item.currentCycleStart),
    (day, lastKnownItem) => ({
      ...lastKnownItem,
      id: `interpolated-${day}`,
      currentCycleStart: day.toString(),
    }),
  )
}

/**
 * Calculate USD value from RIF and RBTC rewards
 */
const calculateRewardsUSD = (
  rifAmountWei: string,
  rbtcAmountWei: string,
  rifPrice: number,
  rbtcPrice: number,
): number => {
  const rifTokens = Number(rifAmountWei) / WEI_DIVISOR
  const rbtcTokens = Number(rbtcAmountWei) / WEI_DIVISOR
  return rifTokens * rifPrice + rbtcTokens * rbtcPrice
}

/**
 * Transform backing data to BackingPoint format with interpolation
 */
const transformBackingData = (backingData: DailyAllocationItem[]): BackingPoint[] => {
  if (!backingData || !Array.isArray(backingData)) return []

  const interpolatedData = interpolateDailyBackingData(backingData)
  return interpolatedData.map(item => ({
    day: new Date(item.day * 1000),
    backing: BigInt(Math.floor(Number(item.totalAllocation) / WEI_DIVISOR)),
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
  backingData: DailyAllocationItem[],
): RewardsPoint[] => {
  if (!rewardsData || !Array.isArray(rewardsData)) return []

  const sortedData = [...rewardsData].sort(
    (a, b) => Number(a.currentCycleStart) - Number(b.currentCycleStart),
  )

  let cumulativeRifRewards = BigInt(0)
  let cumulativeRbtcRewards = BigInt(0)

  const accumulatedCycleRewards = sortedData.map((item, _) => {
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

  const sortedBacking = [...backingData].sort((a, b) => a.day - b.day)
  const targetEndDate = sortedBacking[sortedBacking.length - 1].day

  const interpolatedData = interpolateCycleRewardsData(accumulatedCycleRewards, targetEndDate)

  return interpolatedData.map(item => ({
    day: new Date(Number(item.currentCycleStart) * 1000),
    rewards: {
      rif: BigInt(Math.floor(Number(item.rewardsERC20) / WEI_DIVISOR)),
      rbtc: BigInt(Math.floor(Number(item.rewardsRBTC) / WEI_DIVISOR)),
      usd: calculateRewardsUSD(item.rewardsERC20, item.rewardsRBTC, rifPrice, rbtcPrice),
    },
  }))
}

/**
 * Transform cycle rewards data to CycleWindow format
 */
const transformCyclesData = (rewardsData: CycleRewardsItem[]): CycleWindow[] => {
  if (!rewardsData || !Array.isArray(rewardsData)) return []

  const sortedData = [...rewardsData].sort(
    (a, b) => Number(a.currentCycleStart) - Number(b.currentCycleStart),
  )

  return sortedData.map(item => {
    const startDate = new Date(Number(item.currentCycleStart) * 1000)
    const endDate = new Date((Number(item.currentCycleStart) + Number(item.currentCycleDuration)) * 1000)

    const cycleNumber =
      Math.floor((Number(item.currentCycleStart) - FIRST_CYCLE_START_SECONDS) / CYCLE_DURATION_SECONDS) + 1

    return {
      start: startDate,
      end: endDate,
      label: `cycle ${cycleNumber}`,
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
  const backingSeries: BackingPoint[] = transformBackingData(backingData)
  const rewardsSeries: RewardsPoint[] = transformRewardsData(rewardsData, rifPrice, rbtcPrice, backingData)
  const cycles: CycleWindow[] = transformCyclesData(rewardsData)

  const filteredBackingSeries = filterToLastFiveMonths(backingSeries)
  const filteredRewardsSeries = filterToLastFiveMonths(rewardsSeries)
  const filteredCycles = cycles.filter(cycle => {
    const cycleTime = convertToTimestamp(cycle.start)
    const fiveMonthsAgo = Date.now() - FIVE_MONTHS_IN_MS
    return cycleTime >= fiveMonthsAgo
  })

  return {
    backingSeries: filteredBackingSeries,
    rewardsSeries: filteredRewardsSeries,
    cycles: filteredCycles,
  }
}
