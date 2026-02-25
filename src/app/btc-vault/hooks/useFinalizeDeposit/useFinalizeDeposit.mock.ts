import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMockBtcVaultAdapter } from '../../providers/MockBtcVaultProvider'

/**
 * Mutation hook for finalizing (claiming) a deposit after epoch settlement.
 * Invalidates all btc-vault queries on success.
 * @returns React Query mutation that takes an epochId string
 */
export function useFinalizeDepositMock() {
  const adapter = useMockBtcVaultAdapter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (epochId: string) => adapter.finalizeDeposit(epochId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['btc-vault'] })
    },
  })
}
