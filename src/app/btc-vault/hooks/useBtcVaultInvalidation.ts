import { useQueryClient } from '@tanstack/react-query'
import { readContractsQueryKey } from '@wagmi/core/query'
import { useCallback } from 'react'
import type { Address } from 'viem'
import { useAccount, useChainId } from 'wagmi'

import { getBtcVaultActionEligibilityContracts } from './get-btc-vault-action-eligibility-contracts'

/**
 * Shared cache invalidation for BTC Vault mutations.
 *
 * - `invalidateAfterSubmit` — deposit/withdraw: invalidates active-requests history and wagmi
 *   `readContracts` for the eligibility multicall (same contract list as `useActionEligibility`)
 * - `invalidateAfterAction` — cancel/claim: invalidates the above plus request detail and history list
 */
export function useBtcVaultInvalidation() {
  const queryClient = useQueryClient()
  const { address } = useAccount()
  const chainId = useChainId()

  const invalidateAfterSubmit = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['btc-vault', 'active-requests-history', address] })
    if (address) {
      queryClient.invalidateQueries({
        queryKey: readContractsQueryKey({
          contracts: [...getBtcVaultActionEligibilityContracts(address as Address)],
          chainId,
        }),
      })
    }
  }, [queryClient, address, chainId])

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
