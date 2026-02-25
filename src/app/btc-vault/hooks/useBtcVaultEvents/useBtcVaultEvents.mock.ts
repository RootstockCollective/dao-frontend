import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMockBtcVaultAdapter } from '../../providers/MockBtcVaultProvider'

/**
 * Subscribes to adapter events and selectively invalidates React Query caches.
 * Handles epoch transitions, pause changes, request lifecycle events, and tx confirmations.
 * Should be called once at the vault page level.
 */
export function useBtcVaultEventsMock() {
  const adapter = useMockBtcVaultAdapter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsub = adapter.subscribe(event => {
      switch (event.type) {
        case 'epoch:transition':
          queryClient.invalidateQueries({ queryKey: ['btc-vault', 'metrics'] })
          queryClient.invalidateQueries({ queryKey: ['btc-vault', 'epoch'] })
          queryClient.invalidateQueries({ queryKey: ['btc-vault', 'action-eligibility'] })
          break
        case 'pause:change':
          queryClient.invalidateQueries({ queryKey: ['btc-vault', 'action-eligibility'] })
          break
        case 'request:submitted':
        case 'request:claimable':
        case 'request:finalized':
        case 'request:failed':
          queryClient.invalidateQueries({ queryKey: ['btc-vault', 'active-requests'] })
          queryClient.invalidateQueries({ queryKey: ['btc-vault', 'history'] })
          queryClient.invalidateQueries({ queryKey: ['btc-vault', 'action-eligibility'] })
          break
        case 'tx:confirmed':
          queryClient.invalidateQueries({ queryKey: ['btc-vault'] })
          break
      }
    })
    return unsub
  }, [adapter, queryClient])
}
