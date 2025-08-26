import { BackingPoint, RewardsPoint } from '@/app/collective-rewards/types'
import { useMemo } from 'react'
import { toDate } from '@/app/collective-rewards/utils/chartUtils'

type MergedDataPoint = {
  day: Date
  backing?: number
  rewardsUSD?: number
  rewardsRif?: number
  rewardsRbtc?: number
}

export function useMergedSeries(backing: BackingPoint[], rewards: RewardsPoint[]) {
  return useMemo(() => {
    // Length of "YYYY-MM-DD" portion of ISO string for daily grouping
    const ISO_DATE_LENGTH = 10
    const map = new Map<string, MergedDataPoint>()

    for (const b of backing) {
      const date = toDate(b.day)
      const key = date.toISOString().slice(0, ISO_DATE_LENGTH)
      const entry = map.get(key) ?? { day: new Date(key) }
      entry.backing = Number(b.backing)
      map.set(key, entry)
    }

    for (const r of rewards) {
      const date = toDate(r.day)
      const key = date.toISOString().slice(0, ISO_DATE_LENGTH)
      const entry = map.get(key) ?? { day: new Date(key) }
      entry.rewardsUSD = r.rewards?.usd ?? 0
      entry.rewardsRif = Number(r.rewards.rif)
      entry.rewardsRbtc = Number(r.rewards.rbtc)
      map.set(key, entry)
    }

    return Array.from(map.values()).sort((a, b) => a.day.getTime() - b.day.getTime())
  }, [backing, rewards])
}
