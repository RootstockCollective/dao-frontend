import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMockBtcVaultAdapter } from '../../providers/MockBtcVaultProvider'

/**
 * Mutation hook for finalizing (claiming) a withdrawal after batch redeem settlement.
 * Invalidates all btc-vault queries on success.
 * @returns React Query mutation that takes a batchRedeemId string
 */
export function useFinalizeWithdrawalMock() {
  const adapter = useMockBtcVaultAdapter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (batchRedeemId: string) => adapter.finalizeWithdrawal(batchRedeemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['btc-vault'] })
    },
  })
}
