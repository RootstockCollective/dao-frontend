import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { CYCLE_HISTORY_LIMIT } from '@/lib/constants'

import { toCycleStartKey } from '../../utils/buildCycleHistory'

interface BackersPerCycleItem {
  cycleStart: string
  backersCount: number
}

const REFETCH_INTERVAL_MS = 5 * 60 * 1000

/**
 * Backers holding a positive allocation at each cycle's close, keyed by cycle start in seconds
 * so callers can look a cycle up directly.
 */
export const useGetBackersPerCycle = () => {
  const { data, isLoading, error } = useQuery<BackersPerCycleItem[], Error>({
    queryFn: async () => {
      const response = await fetch(`/api/cycles/backers?limit=${CYCLE_HISTORY_LIMIT}`)
      if (!response.ok) {
        throw new Error('Failed to fetch backers per cycle')
      }
      const result = await response.json()
      return result.data as BackersPerCycleItem[]
    },
    queryKey: ['backersPerCycle', CYCLE_HISTORY_LIMIT],
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
