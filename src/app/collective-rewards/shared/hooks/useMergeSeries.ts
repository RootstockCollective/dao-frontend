import { BackingPoint, CycleWindow, RewardsPoint } from '@/app/collective-rewards/types'
import { useMemo } from 'react'
import {
  CYCLE_DURATION_DAYS,
  CYCLE_DURATION_MS,
  FIRST_CYCLE_START_MS,
  ISO_DATE_LENGTH,
  ONE_DAY_IN_MS,
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

      return {
        cycle: cycle.cycleNumber || null,
        dayInCycle: `${displayDay}/${CYCLE_DURATION_DAYS}`,
      }
    }
  }

  const timeSinceFirstCycle = targetTime - FIRST_CYCLE_START_MS
  const cycleNumber = Math.floor(timeSinceFirstCycle / CYCLE_DURATION_MS) + 1
  const timeInCurrentCycle = timeSinceFirstCycle % CYCLE_DURATION_MS
  const dayInCycle = Math.floor(timeInCurrentCycle / ONE_DAY_IN_MS) + 1

  return {
    cycle: cycleNumber,
    dayInCycle: `${dayInCycle}/${CYCLE_DURATION_DAYS}`,
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
