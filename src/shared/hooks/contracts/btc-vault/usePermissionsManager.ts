import { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { ADMIN_ROLE, FUND_MANAGER_ROLE } from '@/lib/constants'
import { permissionsManager } from '@/lib/contracts'

import { useReadPermissionsManager } from './useReadPermissionsManager'

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

  const isLoading = isAdminLoading || isFundManagerLoading
  const error = adminError || fundManagerError

  return useMemo(
    () => ({
      isAdmin: isAdmin ?? false,
      isFundManager: isFundManager ?? false,
      isLoading,
      error,
    }),
    [isAdmin, isFundManager, isLoading, error],
  )
}
