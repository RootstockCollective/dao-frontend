import { useQuery } from '@tanstack/react-query'

/**
 * Placeholder for contract-based vault metrics.
 * Will be implemented when on-chain contracts are deployed.
 */
export function useVaultMetricsContract() {
  return useQuery({
    queryKey: ['btc-vault', 'metrics'],
    queryFn: () => {
      throw new Error('Contract not implemented')
    },
    enabled: false,
  })
}
