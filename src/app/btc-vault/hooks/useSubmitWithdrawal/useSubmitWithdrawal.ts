import { useMutation } from '@tanstack/react-query'
import type { WithdrawalRequestParams, TxResult } from '../../services/types'

export function useSubmitWithdrawal() {
  return useMutation({
    mutationFn: async (_params: WithdrawalRequestParams): Promise<TxResult> => {
      await new Promise(resolve => setTimeout(resolve, 1500))
      return {
        hash: `0x${'mock-withdrawal-tx'.padStart(64, '0')}`,
        status: 'confirmed',
      }
    },
  })
}
