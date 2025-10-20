import { BackingPoint, RewardsPoint, CycleWindow, DailyAllocationItem, CycleRewardsItem } from '../types'
import { ONE_DAY_IN_SECONDS, FIVE_MONTHS_IN_MS, FIRST_CYCLE_START_SECONDS } from '../constants/chartConstants'
import Big from '@/lib/big'
import { USD, WeiPerEther } from '@/lib/constants'
import { getCombinedFiatAmount } from './getCombinedFiatAmount'
import { TokenSymbol } from '@/components/TokenImage'
import { TOKENS } from '@/lib/tokens'

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
 * Format a date to YYYY-MM-DD format
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Filter data to show only the last n months
 */
const filterToLastMonths = <T extends { day?: Date | number | string; start?: Date; end?: Date }>(
  data: T[],
  getCompareDate: (item: T) => Date | number | string,
  customMinDate?: number,
  monthsInMs: number = FIVE_MONTHS_IN_MS,
): T[] => {
  const now = Date.now()
  const monthsAgo = now - monthsInMs
  const minDate = customMinDate || monthsAgo
  return data.filter(item => {
    const itemTime = convertToTimestamp(getCompareDate(item))
    return itemTime >= minDate
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
  maxDate?: number,
): T[] => {
  const sortedData = [...data].sort((a, b) => getTimestamp(a) - getTimestamp(b))
  const startDate = getTimestamp(sortedData[0])
  const endDate = maxDate ? maxDate + ONE_DAY_IN_SECONDS : Date.now() / 1000

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
const transformBackingData = (backingData: DailyAllocationItem[], maxDate?: number): BackingPoint[] => {
  const interpolatedData = interpolateDataByDay(
    backingData,
    item => item.day,
    (day, lastKnownItem) => ({
      id: `interpolated-${day}`,
      day,
      totalAllocation: lastKnownItem.totalAllocation,
    }),
    maxDate,
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
  const rifAddress = TOKENS.rif.address.toLowerCase()
  const rbtcAddress = TOKENS.rbtc.address.toLowerCase()

  const accumulatedCycleRewards = rewardsData.map((item, _) => {
    const currentRifRewards = BigInt(item.rewards[rifAddress])
    const currentRbtcRewards = BigInt(item.rewards[rbtcAddress])

    cumulativeRifRewards += currentRifRewards
    cumulativeRbtcRewards += currentRbtcRewards

    return {
      ...item,
      rewardsRif: cumulativeRifRewards.toString(),
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
      rif: BigInt(Big(item.rewardsRif).div(WeiPerEtherString).toFixed(0)),
      rbtc: BigInt(Big(item.rewardsRBTC).div(WeiPerEtherString).toFixed(0)),
      usd: calculateRewardsUSD(item.rewardsRif, item.rewardsRBTC, rifPrice, rbtcPrice),
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

  const rewardsSeries: RewardsPoint[] = transformRewardsData(sortedRewardsData, rifPrice, rbtcPrice)
  const lastRewardsDate = Math.floor(new Date(rewardsSeries[rewardsSeries.length - 1].day).getTime() / 1000)

  const backingSeries: BackingPoint[] = transformBackingData(sortedBackingData, lastRewardsDate)
  const cycles: CycleWindow[] = transformCyclesData(sortedRewardsData)

  const filteredRewardsSeries = filterToLastMonths(rewardsSeries, item => item.day)
  const filteredCycles = filterToLastMonths(cycles, item => item.end)

  const minDate = convertToTimestamp(filteredRewardsSeries[0].day)
  const filteredBackingSeries = filterToLastMonths(backingSeries, item => item.day, minDate)

  return {
    backingSeries: filteredBackingSeries,
    rewardsSeries: filteredRewardsSeries,
    cycles: filteredCycles,
  }
}
