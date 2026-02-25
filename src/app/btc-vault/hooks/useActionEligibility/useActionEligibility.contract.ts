import { useQuery } from '@tanstack/react-query'

/**
 * Placeholder for contract-based action eligibility.
 * Will be implemented when on-chain contracts are deployed.
 */
export function useActionEligibilityContract(address: string | undefined) {
  return useQuery({
    queryKey: ['btc-vault', 'action-eligibility', address],
    queryFn: () => {
      throw new Error('Contract not implemented')
    },
    enabled: false,
  })
}
