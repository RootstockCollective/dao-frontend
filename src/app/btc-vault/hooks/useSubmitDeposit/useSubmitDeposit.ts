import { useMutation } from '@tanstack/react-query'
import type { DepositRequestParams, TxResult } from '../../services/types'

export function useSubmitDeposit() {
  return useMutation({
    mutationFn: async (_params: DepositRequestParams): Promise<TxResult> => {
      await new Promise(resolve => setTimeout(resolve, 1500))
      return {
        hash: `0x${'mock-deposit-tx'.padStart(64, '0')}`,
        status: 'confirmed',
      }
    },
  })
}
