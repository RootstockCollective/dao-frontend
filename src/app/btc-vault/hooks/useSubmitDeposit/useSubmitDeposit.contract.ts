import { useMutation } from '@tanstack/react-query'
import type { DepositRequestParams } from '../../services/types'

/**
 * Placeholder for contract-based deposit submission.
 * Will be implemented when on-chain contracts are deployed.
 */
export function useSubmitDepositContract() {
  return useMutation({
    mutationFn: (_params: DepositRequestParams) => {
      throw new Error('Contract not implemented')
    },
  })
}
