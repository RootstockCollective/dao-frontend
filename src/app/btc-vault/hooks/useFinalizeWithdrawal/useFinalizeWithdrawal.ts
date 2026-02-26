import { useMutation } from '@tanstack/react-query'
import type { TxResult } from '../../services/types'

export function useFinalizeWithdrawal() {
  return useMutation({
    mutationFn: async (_batchRedeemId: string): Promise<TxResult> => {
      await new Promise(resolve => setTimeout(resolve, 1500))
      return {
        hash: `0x${'mock-finalize-withdrawal-tx'.padStart(64, '0')}`,
        status: 'confirmed',
      }
    },
  })
}
