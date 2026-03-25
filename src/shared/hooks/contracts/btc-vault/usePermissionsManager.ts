import { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { ADMIN_ROLE, FUND_MANAGER_ROLE, PAUSER_ROLE } from '@/lib/constants'
import { permissionsManager } from '@/lib/contracts'

import { useReadPermissionsManager } from './useReadPermissionsManager'

// TODO: multicall query
export function usePermissionsManager() {
  const { address: connectedAddress } = useAccount()

  const queryEnabled = !!connectedAddress && !!permissionsManager.address

  const {
    data: isAdmin,
    isLoading: isAdminLoading,
    error: adminError,
  } = useReadPermissionsManager(
    {
      functionName: 'hasRole',
      args: [ADMIN_ROLE, connectedAddress!],
    },
    { enabled: queryEnabled },
  )

  const {
    data: isFundManager,
    isLoading: isFundManagerLoading,
    error: fundManagerError,
  } = useReadPermissionsManager(
    {
      functionName: 'hasRole',
      args: [FUND_MANAGER_ROLE, connectedAddress!],
    },
    { enabled: queryEnabled },
  )

  const {
    data: isPauser,
    isLoading: isPauserLoading,
    error: pauserError,
  } = useReadPermissionsManager(
    {
      functionName: 'hasRole',
      args: [PAUSER_ROLE, connectedAddress!],
    },
    { enabled: queryEnabled },
  )

  const isLoading = isAdminLoading || isFundManagerLoading || isPauserLoading
  const error = adminError || fundManagerError || pauserError

  return useMemo(
    () => ({
      isAdmin: isAdmin ?? false,
      isFundManager: isFundManager ?? false,
      isPauser: isPauser ?? false,
      isLoading,
      error,
    }),
    [isAdmin, isFundManager, isPauser, isLoading, error],
  )
}
