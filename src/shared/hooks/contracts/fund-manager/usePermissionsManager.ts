import { useMemo } from 'react'
import { useAccount, useReadContracts } from 'wagmi'

import { ADMIN_ROLE, FUND_MANAGER_ROLE } from '@/lib/constants'
import { permissionsManager } from '@/lib/contracts'

export function usePermissionsManager() {
  const { address: connectedAddress } = useAccount()

  const contracts = useMemo(() => {
    if (!connectedAddress || !permissionsManager.address) return []

    return [
      {
        address: permissionsManager.address,
        abi: permissionsManager.abi,
        functionName: 'hasRole',
        args: [ADMIN_ROLE, connectedAddress],
      } as const,
      {
        address: permissionsManager.address,
        abi: permissionsManager.abi,
        functionName: 'hasRole',
        args: [FUND_MANAGER_ROLE, connectedAddress],
      } as const,
    ]
  }, [connectedAddress])

  const {
    data,
    isLoading: isContractsLoading,
    error: contractsError,
  } = useReadContracts({
    contracts,
    query: {
      enabled: !!connectedAddress && !!permissionsManager.address,
    },
  })

  return useMemo(() => {
    if (isContractsLoading || contractsError || !connectedAddress) {
      return {
        isAdmin: false,
        isFundManager: false,
        isLoading: isContractsLoading,
        error: contractsError,
      }
    }

    const isAdmin = (data?.[0]?.result as boolean | undefined) ?? false
    const isFundManager = (data?.[1]?.result as boolean | undefined) ?? false

    return {
      isAdmin,
      isFundManager,
      isLoading: isContractsLoading,
      error: contractsError,
    }
  }, [data, connectedAddress, isContractsLoading, contractsError])
}
