import { useQuery } from '@tanstack/react-query'

/**
 * Placeholder for contract-based epoch state.
 * Will be implemented when on-chain contracts are deployed.
 */
export function useEpochStateContract() {
  return useQuery({
    queryKey: ['btc-vault', 'epoch'],
    queryFn: () => {
      throw new Error('Contract not implemented')
    },
    enabled: false,
  })
}
