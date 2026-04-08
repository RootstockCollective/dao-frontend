import { useMemo } from 'react'
import { useAccount } from 'wagmi'

import type { PermissionsManagerAbi } from '@/lib/abis/btc-vault'
import { ADMIN_ROLE, FUND_MANAGER_ROLE, PAUSER_ROLE } from '@/lib/constants'
import { permissionsManager } from '@/lib/contracts'

import { UseReadContractForMultipleArgsConfig } from '../types'
import { useReadPermissionsManagerForMultipleArgs } from './useReadPermissionsManagerForMultipleArgs'

type HasRoleArgsList = UseReadContractForMultipleArgsConfig<PermissionsManagerAbi, 'hasRole'>['args']

export function usePermissionsManager() {
  const { address } = useAccount()

  const hasRoleArgs = useMemo((): HasRoleArgsList => {
    if (!address) return []
    return [
      [ADMIN_ROLE, address],
      [FUND_MANAGER_ROLE, address],
      [PAUSER_ROLE, address],
    ]
  }, [address])

  const enabled = hasRoleArgs.length > 0 && Boolean(permissionsManager.address)

  const { data, isLoading, error } = useReadPermissionsManagerForMultipleArgs(
    { functionName: 'hasRole', args: hasRoleArgs },
    { enabled },
  )

  const { isAdmin, isFundManager, isPauser } = useMemo(
    () => ({
      isAdmin: Boolean(data[0]),
      isFundManager: Boolean(data[1]),
      isPauser: Boolean(data[2]),
    }),
    [data],
  )

  return useMemo(
    () => ({
      isAdmin,
      isFundManager,
      isPauser,
      isLoading,
      error,
    }),
    [isAdmin, isFundManager, isPauser, isLoading, error],
  )
}
