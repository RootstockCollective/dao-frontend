import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'

const ROUTE = '/api/cycles/rewards-distributed'

/** All-time distributed per reward token, keyed by lowercase token address. */
export type TotalRewardsDistributed = Record<string, bigint>

/**
 * All-time rewards distributed per token, read from state-sync.
 *
 * Replaces adding up `builderAmount_ + backersAmount_` across every gauge's NotifyReward history,
 * which cost one paginated Blockscout call per gauge on every refresh.
 */
export const useGetTotalRewardsDistributed = () => {
  const { data, isLoading, error } = useQuery({
    queryFn: async (): Promise<TotalRewardsDistributed> => {
      const res = await fetch(ROUTE)
      if (!res.ok) {
        throw new Error(`Failed to fetch distributed rewards: ${res.status} ${res.statusText}`)
      }

      const dto = (await res.json()) as Record<string, string>

      return Object.entries(dto).reduce<TotalRewardsDistributed>((acc, [token, total]) => {
        acc[token.toLowerCase()] = BigInt(total)
        return acc
      }, {})
    },
    queryKey: ['useGetTotalRewardsDistributed'],
    refetchInterval: AVERAGE_BLOCKTIME,
    // A stable empty record, rather than `data ?? {}` at the return. That fallback minted a new
    // identity on every render while the query was in flight, and it reaches the dependency array
    // of `useGetBuilderAllTimeShare`, re-running that memo each time. Matches the sibling hook.
    initialData: {},
  })

  return {
    data,
    isLoading,
    error,
  }
}

/** Reads one token's total, tolerating the checksummed addresses the token config carries. */
export const getTokenTotal = (totals: TotalRewardsDistributed, token: Address): bigint =>
  totals[token.toLowerCase()] ?? 0n
