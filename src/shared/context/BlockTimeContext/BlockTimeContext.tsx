'use client'

import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { computeAverageBlockTime } from './computeAverageBlockTime'

const FALLBACK_BLOCK_TIME_MS = 25_000
const ONE_HOUR_MS = 3_600_000

interface BlockTimeContextType {
  averageBlockTimeMs: number
  secondsPerBlock: number
}

const BlockTimeContext = createContext<BlockTimeContextType | null>(null)

interface Props {
  children: ReactNode
}

/**
 * Fetches the average Rootstock block time from Blockscout (server action, cached 1h)
 * and provides it to the component tree via context. Also sets the fetched value
 * as the default `refetchInterval` on the QueryClient, so all queries poll at
 * block time by default — individual hooks only need to override when they want
 * a different interval or opt out with `refetchInterval: false`.
 */
export const BlockTimeProvider = ({ children }: Props) => {
  const queryClient = useQueryClient()
  const { data: averageBlockTimeMs = FALLBACK_BLOCK_TIME_MS } = useQuery({
    queryKey: ['averageBlockTime'],
    queryFn: computeAverageBlockTime,
    staleTime: ONE_HOUR_MS,
    refetchInterval: ONE_HOUR_MS,
  })

  // Propagate fetched block time as the default refetchInterval for all queries
  useEffect(() => {
    queryClient.setDefaultOptions({
      queries: {
        ...queryClient.getDefaultOptions().queries,
        refetchInterval: averageBlockTimeMs,
      },
    })
  }, [averageBlockTimeMs, queryClient])

  const value = useMemo<BlockTimeContextType>(
    () => ({
      averageBlockTimeMs,
      secondsPerBlock: averageBlockTimeMs / 1000,
    }),
    [averageBlockTimeMs],
  )

  return <BlockTimeContext.Provider value={value}>{children}</BlockTimeContext.Provider>
}

/**
 * Returns the current average Rootstock block time, fetched from Blockscout and
 * cached for 1 hour. Falls back to 25s if the fetch fails.
 *
 * Most hooks don't need this — `refetchInterval` is set as a QueryClient default.
 * Use this hook only when you need the block time value directly (e.g. for
 * `setInterval`, `staleTime`, or block-to-time conversions).
 *
 * @returns averageBlockTimeMs — block time in milliseconds
 * @returns secondsPerBlock — block time in seconds (for time calculations)
 *
 * @example
 * ```ts
 * const { secondsPerBlock } = useBlockTime()
 * const seconds = remainingBlocks * secondsPerBlock
 * ```
 */
export const useBlockTime = (): BlockTimeContextType => {
  const context = useContext(BlockTimeContext)
  if (context === null) {
    throw new Error('useBlockTime must be used within a BlockTimeProvider')
  }
  return context
}
