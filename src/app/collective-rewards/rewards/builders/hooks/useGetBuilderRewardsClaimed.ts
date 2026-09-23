import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'

/** Claimed-to-date per reward token, keyed by lowercase token address. */
export type BuilderRewardsClaimed = Record<string, bigint>

/** Returned while the query has no data; stable for the same reason as `NO_TOTALS`. */
const NO_CLAIMS: BuilderRewardsClaimed = {}

/**
 * What this gauge's builder has claimed, per token, read from state-sync.
 *
 * `BuilderRewardsClaimed` is accumulated by the subgraph on every claim, so this is a value per
 * token rather than a list of logs to reduce. Replaces the `fetchBuilderRewardsClaimed` server
 * action, which pulled the gauge's whole claim history from Blockscout every 60 seconds outside
 * the shared cache.
 */
export const useGetBuilderRewardsClaimed = (gauge: Address) => {
  const { data, isLoading, error } = useQuery({
    queryFn: async (): Promise<BuilderRewardsClaimed> => {
      const res = await fetch(`/api/gauges/${gauge}/builder-rewards-claimed`)
      if (!res.ok) {
        throw new Error(`Failed to fetch builder reward claims: ${res.status} ${res.statusText}`)
      }

      const dto = (await res.json()) as Record<string, string>

      return Object.entries(dto).reduce<BuilderRewardsClaimed>((acc, [token, amount]) => {
        acc[token.toLowerCase()] = BigInt(amount)
        return acc
      }, {})
    },
    queryKey: ['useGetBuilderRewardsClaimed', gauge],
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  return {
    data: data ?? NO_CLAIMS,
    isLoading,
    error,
  }
}

/** Reads one token's claimed total, tolerating the checksummed addresses the token config carries. */
export const getClaimedForToken = (claimed: BuilderRewardsClaimed, token: Address): bigint =>
  claimed[token.toLowerCase()] ?? 0n
