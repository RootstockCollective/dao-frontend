import { useQuery } from '@tanstack/react-query'

/**
 * Placeholder for contract-based user position.
 * Will be implemented when on-chain contracts are deployed.
 */
export function useUserPositionContract(address: string | undefined) {
  return useQuery({
    queryKey: ['btc-vault', 'user-position', address],
    queryFn: () => {
      throw new Error('Contract not implemented')
    },
    enabled: !!address,
  })
}
