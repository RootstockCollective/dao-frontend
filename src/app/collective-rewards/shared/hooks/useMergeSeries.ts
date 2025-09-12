import { BackingPoint, CycleWindow, RewardsPoint } from '@/app/collective-rewards/types'
import { useMemo } from 'react'
import {
  FIRST_CYCLE_START_MS,
  ISO_DATE_LENGTH,
  ONE_DAY_IN_MS,
  ONE_DAY_IN_SECONDS,
} from '@/app/collective-rewards/constants/chartConstants'
import { convertToTimestamp } from '@/app/collective-rewards/utils/chartUtils'

const calculateCycleDay = (date: Date, cycles: CycleWindow[]) => {
  const targetTime = date.getTime()

  for (const cycle of cycles) {
    const startTime = convertToTimestamp(cycle.start)
    const endTime = convertToTimestamp(cycle.end)

    if (targetTime >= startTime && targetTime < endTime) {
      const daysElapsed = Math.floor((targetTime - startTime) / ONE_DAY_IN_MS)
      const displayDay = daysElapsed + 1

      const cycleDurationDays = Math.ceil(cycle.cycleDuration / ONE_DAY_IN_SECONDS)

      return {
        cycle: cycle.cycleNumber || null,
        dayInCycle: `${displayDay}/${cycleDurationDays}`,
      }
    }
  }

  // If date does not match any cycle, return fallback value
  const referenceCycle = cycles[0]
  const cycleDurationMs = referenceCycle.cycleDuration * 1000 // Convert seconds to milliseconds
  const timeSinceFirstCycle = targetTime - FIRST_CYCLE_START_MS
  const cycleNumber = Math.floor(timeSinceFirstCycle / cycleDurationMs) + 1
  const timeInCurrentCycle = timeSinceFirstCycle % cycleDurationMs

  const dayInCycle = Math.floor(timeInCurrentCycle / ONE_DAY_IN_MS) + 1
  const fallbackCycleDurationDays = Math.ceil(cycleDurationMs / ONE_DAY_IN_MS)

  return {
    cycle: cycleNumber,
    dayInCycle: `${dayInCycle}/${fallbackCycleDurationDays}`,
  }
}

type MergedDataPoint = {
  day: Date
  backing?: number
  backingWei?: bigint
  rewardsUSD?: number
  rewardsRif?: number
  rewardsRbtc?: number
  cycle?: number | null
  dayInCycle?: string | null
}

export function useMergedSeries(backing: BackingPoint[], rewards: RewardsPoint[], cycles: CycleWindow[]) {
  return useMemo(() => {
    const map = new Map<string, MergedDataPoint>()

    for (const b of backing) {
      const date = new Date(b.day)
      const key = date.toISOString().slice(0, ISO_DATE_LENGTH)
      const entry = map.get(key) ?? { day: new Date(key) }
      const cycleInfo = calculateCycleDay(date, cycles)

      entry.backing = Number(b.backing)
      entry.backingWei = b.backingWei || b.backing
      entry.cycle = cycleInfo.cycle
      entry.dayInCycle = cycleInfo.dayInCycle
      map.set(key, entry)
    }

    for (const r of rewards) {
      const date = new Date(r.day)
      const key = date.toISOString().slice(0, ISO_DATE_LENGTH)
      const entry = map.get(key) ?? { day: new Date(key) }
      const cycleInfo = calculateCycleDay(date, cycles)

      entry.rewardsUSD = r.rewards?.usd ?? 0
      entry.rewardsRif = Number(r.rewards.rif)
      entry.rewardsRbtc = Number(r.rewards.rbtc)
      entry.cycle = cycleInfo.cycle
      entry.dayInCycle = cycleInfo.dayInCycle
      map.set(key, entry)
    }

    return Array.from(map.values()).sort((a, b) => a.day.getTime() - b.day.getTime())
  }, [backing, rewards, cycles])
}
