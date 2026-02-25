import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMockBtcVaultAdapter } from '../../providers/MockBtcVaultProvider'
import type { WithdrawalRequestParams } from '../../services/types'

/**
 * Mutation hook for submitting a withdrawal request to the vault.
 * Invalidates all btc-vault queries on success.
 * @returns React Query mutation with {@link WithdrawalRequestParams} as input
 */
export function useSubmitWithdrawalMock() {
  const adapter = useMockBtcVaultAdapter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: WithdrawalRequestParams) => adapter.submitWithdrawalRequest(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['btc-vault'] })
    },
  })
}
