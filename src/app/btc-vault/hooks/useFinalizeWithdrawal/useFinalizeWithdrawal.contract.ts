import { useMutation } from '@tanstack/react-query'

/**
 * Placeholder for contract-based withdrawal finalization.
 * Will be implemented when on-chain contracts are deployed.
 */
export function useFinalizeWithdrawalContract() {
  return useMutation({
    mutationFn: (_batchRedeemId: string) => {
      throw new Error('Contract not implemented')
    },
  })
}
