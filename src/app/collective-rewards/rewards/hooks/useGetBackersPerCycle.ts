import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { toCycleStartKey } from '../../utils/buildCycleHistory'

interface BackersPerCycleItem {
  cycleStart: string
  backersCount: number
}

const REFETCH_INTERVAL_MS = 5 * 60 * 1000

/** Backers per cycle, keyed by cycle start in seconds. */
export const useGetBackersPerCycle = () => {
  const { data, isLoading, error } = useQuery<BackersPerCycleItem[], Error>({
    queryFn: async () => {
      const response = await fetch('/api/cycles/backers')
      if (!response.ok) {
        throw new Error('Failed to fetch backers per cycle')
      }
      const result = await response.json()
      return result.data as BackersPerCycleItem[]
    },
    queryKey: ['backersPerCycle'],
    staleTime: REFETCH_INTERVAL_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
  })

  const byCycleStart = useMemo(
    () =>
      (data ?? []).reduce<Record<string, number>>((acc, { cycleStart, backersCount }) => {
        const key = toCycleStartKey(cycleStart)
        if (key !== null) acc[key] = backersCount

        return acc
      }, {}),
    [data],
  )

  return { data: byCycleStart, isLoading, error }
}
