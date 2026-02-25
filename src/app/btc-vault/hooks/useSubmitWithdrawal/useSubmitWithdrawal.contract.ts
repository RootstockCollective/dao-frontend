import { useMutation } from '@tanstack/react-query'
import type { WithdrawalRequestParams } from '../../services/types'

/**
 * Placeholder for contract-based withdrawal submission.
 * Will be implemented when on-chain contracts are deployed.
 */
export function useSubmitWithdrawalContract() {
  return useMutation({
    mutationFn: (_params: WithdrawalRequestParams) => {
      throw new Error('Contract not implemented')
    },
  })
}
