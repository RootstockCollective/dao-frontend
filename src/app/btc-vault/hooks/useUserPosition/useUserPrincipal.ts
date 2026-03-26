import { useQuery } from '@tanstack/react-query'

const PRINCIPAL_API_PATH = '/api/btc-vault/v1/principal'

/**
 * Fetches the user's net deposited principal (deposits minus withdrawals) from the API.
 * Returns the value as a bigint in wei.
 *
 * Stale time and refetch interval are 5 minutes since principal only changes
 * on deposit/withdrawal finalization.
 */
export function useUserPrincipal(address: string | undefined) {
  return useQuery({
    queryKey: ['btc-vault', 'principal', address],
    queryFn: async () => {
      const res = await fetch(`${PRINCIPAL_API_PATH}?address=${address}`)
      if (!res.ok) throw new Error(`Principal API error: ${res.status}`)
      const json = await res.json()
      return BigInt(json.principal) as bigint
    },
    enabled: !!address,
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  })
}
