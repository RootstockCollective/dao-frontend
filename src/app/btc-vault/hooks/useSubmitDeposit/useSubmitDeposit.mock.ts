import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMockBtcVaultAdapter } from '../../providers/MockBtcVaultProvider'
import type { DepositRequestParams } from '../../services/types'

/**
 * Mutation hook for submitting a deposit request to the vault.
 * Invalidates all btc-vault queries on success.
 * @returns React Query mutation with {@link DepositRequestParams} as input
 */
export function useSubmitDepositMock() {
  const adapter = useMockBtcVaultAdapter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: DepositRequestParams) => adapter.submitDepositRequest(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['btc-vault'] })
    },
  })
}
