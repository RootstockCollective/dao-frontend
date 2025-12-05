import { useReadContracts, useAccount } from 'wagmi'
import { vaultDepositLimiter } from '@/lib/contracts'
import { useMemo } from 'react'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

/**
 * Hook for reading vault deposit limiter contract data
 * Fetches isWhitelisted, userDeposits, maxDefaultDepositLimit, and maxWhitelistedDepositLimit
 */
export function useVaultDepositLimiter() {
  const { address: connectedAddress } = useAccount()

  const contracts = useMemo(() => {
    const baseContracts = [
      {
        address: vaultDepositLimiter.address,
        abi: vaultDepositLimiter.abi,
        functionName: 'maxDefaultDepositLimit',
      } as const,
      {
        address: vaultDepositLimiter.address,
        abi: vaultDepositLimiter.abi,
        functionName: 'maxWhitelistedDepositLimit',
      } as const,
    ]

    if (connectedAddress) {
      return [
        ...baseContracts,
        {
          address: vaultDepositLimiter.address,
          abi: vaultDepositLimiter.abi,
          functionName: 'isWhitelisted',
          args: [connectedAddress],
        } as const,
        {
          address: vaultDepositLimiter.address,
          abi: vaultDepositLimiter.abi,
          functionName: 'userDeposits',
          args: [connectedAddress],
        } as const,
      ]
    }

    return baseContracts
  }, [connectedAddress])

  const { data, isLoading, error } = useReadContracts({
    contracts,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME, // Refetch every minute
    },
  })

  return useMemo(() => {
    const maxDefaultDepositLimit = (data?.[0]?.result as bigint | undefined) ?? 0n
    const maxWhitelistedDepositLimit = (data?.[1]?.result as bigint | undefined) ?? 0n
    const isWhitelisted = connectedAddress && data?.[2]?.result ? (data[2].result as boolean) : false
    const userDeposits = connectedAddress && data?.[3]?.result ? (data[3].result as bigint) : 0n

    return {
      maxDefaultDepositLimit,
      maxWhitelistedDepositLimit,
      isWhitelisted,
      userDeposits,
      isLoading,
      error,
    }
  }, [data, connectedAddress, isLoading, error])
}
