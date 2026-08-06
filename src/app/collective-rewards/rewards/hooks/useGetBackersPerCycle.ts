import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'

interface BackersPerCycleItem {
  cycleStart: string
  backersCount: number
}

/**
 * Backers holding a positive allocation at each cycle's close, keyed by cycle start in seconds
 * so callers can look a cycle up directly.
 */
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
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  const byCycleStart = useMemo(
    () =>
      (data ?? []).reduce<Record<string, number>>((acc, { cycleStart, backersCount }) => {
        acc[cycleStart] = backersCount
        return acc
      }, {}),
    [data],
  )

  return { data: byCycleStart, isLoading, error }
}
