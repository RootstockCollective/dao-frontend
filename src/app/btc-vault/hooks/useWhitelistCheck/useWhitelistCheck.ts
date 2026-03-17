import { useMemo } from 'react'
import { useAccount, useReadContract } from 'wagmi'

import { DEPOSITOR_ROLE } from '@/lib/constants'
import { permissionsManager } from '@/lib/contracts'

/**
 * Checks whether the connected wallet has the whitelisted-user role on the PermissionsManager,
 * i.e. is allowed to deposit into the BTC vault.
 *
 * Enabled only when a wallet is connected; returns `{ isWhitelisted: false, isLoading: false }`
 * when disconnected.
 *
 * @returns `{ isWhitelisted: boolean, isLoading: boolean }`
 */
export function useWhitelistCheck(): { isWhitelisted: boolean; isLoading: boolean } {
  const { address } = useAccount()
  const enabled = !!address && !!permissionsManager.address

  const { data, isLoading } = useReadContract({
    address: permissionsManager.address,
    abi: permissionsManager.abi,
    functionName: 'hasRole',
    args: [DEPOSITOR_ROLE, address!],
    query: {
      enabled,
    },
  })

  return useMemo(
    () => ({
      isWhitelisted: data ?? false,
      isLoading: enabled ? isLoading : false,
    }),
    [data, enabled, isLoading],
  )
}
