import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useAccount } from 'wagmi'

/**
 * Shared cache invalidation for BTC Vault mutations.
 *
 * - `invalidateAfterSubmit` — deposit/withdraw: invalidates active-requests + action-eligibility
 * - `invalidateAfterAction` — cancel/claim: invalidates the above plus request detail and history list
 */
export function useBtcVaultInvalidation() {
  const queryClient = useQueryClient()
  const { address } = useAccount()

  const invalidateAfterSubmit = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['btc-vault', 'active-requests', address] })
    queryClient.invalidateQueries({ queryKey: ['btc-vault', 'action-eligibility', address] })
  }, [queryClient, address])

  const invalidateAfterAction = useCallback(
    (requestId?: string) => {
      invalidateAfterSubmit()
      // Invalidate history list — partial key matches all pagination/filter/price combos
      queryClient.invalidateQueries({ queryKey: ['btc-vault', 'history', address] })
      // Invalidate principal — recalculate after deposit/withdrawal finalization
      queryClient.invalidateQueries({ queryKey: ['btc-vault', 'principal', address] })
      // Invalidate individual request detail
      if (requestId) {
        queryClient.invalidateQueries({ queryKey: ['btc-vault', 'request', requestId, address] })
      }
    },
    [queryClient, address, invalidateAfterSubmit],
  )

  return { invalidateAfterSubmit, invalidateAfterAction }
}
