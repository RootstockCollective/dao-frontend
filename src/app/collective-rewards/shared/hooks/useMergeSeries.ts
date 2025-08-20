import { BackingPoint, RewardsPoint } from '@/app/collective-rewards/types'
import { useMemo } from 'react'
import { bigToNum, toDate } from '@/app/collective-rewards/utils/chartUtils'

export function useMergedSeries(backing: BackingPoint[], rewards: RewardsPoint[]) {
  return useMemo(() => {
    const map = new Map<
      string,
      { day: Date; backing?: bigint; rewardsUSD?: number; rewardsRif?: number; rewardsRbtc?: number }
    >()

    for (const b of backing) {
      const date = toDate(b.day)
      const key = date.toISOString().slice(0, 10)
      const entry = map.get(key) ?? ({ day: new Date(key) } as any)
      entry.backing = bigToNum(b.backing)
      map.set(key, entry)
    }

    for (const r of rewards) {
      const date = toDate(r.day)
      const key = date.toISOString().slice(0, 10)
      const entry = map.get(key) ?? ({ day: new Date(key) } as any)
      entry.rewardsUSD = Number((r.rewards as any).usd ?? 0)
      entry.rewardsRif = bigToNum(r.rewards.rif)
      entry.rewardsRbtc = bigToNum(r.rewards.rbtc)
      map.set(key, entry)
    }

    return Array.from(map.values()).sort((a, b) => a.day.getTime() - b.day.getTime())
  }, [backing, rewards])
}
