import { useQuery } from '@tanstack/react-query'

/**
 * Placeholder for contract-based active requests.
 * Will be implemented when on-chain contracts are deployed.
 */
export function useActiveRequestsContract(address: string | undefined) {
  return useQuery({
    queryKey: ['btc-vault', 'active-requests', address],
    queryFn: () => {
      throw new Error('Contract not implemented')
    },
    enabled: !!address,
  })
}
