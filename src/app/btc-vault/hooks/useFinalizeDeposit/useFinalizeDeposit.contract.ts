import { useMutation } from '@tanstack/react-query'

/**
 * Placeholder for contract-based deposit finalization.
 * Will be implemented when on-chain contracts are deployed.
 */
export function useFinalizeDepositContract() {
  return useMutation({
    mutationFn: (_epochId: string) => {
      throw new Error('Contract not implemented')
    },
  })
}
