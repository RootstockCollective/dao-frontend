import { useReadContracts, useAccount } from 'wagmi'
import { VaultDepositLimiterAbi } from '@/lib/abis/VaultDepositLimiterAbi'
import { useMemo } from 'react'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useVaultDepositLimiterAddress } from './useVaultDepositLimiterAddress'

/**
 * Hook for reading vault deposit limiter contract data
 * Fetches isWhitelisted, userDeposits, maxDefaultDepositLimit, and maxWhitelistedDepositLimit
 */
export function useVaultDepositLimiter() {
  const { address: connectedAddress } = useAccount()
  const {
    depositLimiterAddress,
    isLoading: isAddressLoading,
    error: addressError,
  } = useVaultDepositLimiterAddress()

  const contracts = useMemo(() => {
    if (!depositLimiterAddress) return []

    const baseContracts = [
      {
        address: depositLimiterAddress,
        abi: VaultDepositLimiterAbi,
        functionName: 'maxDefaultDepositLimit',
      } as const,
      {
        address: depositLimiterAddress,
        abi: VaultDepositLimiterAbi,
        functionName: 'maxWhitelistedDepositLimit',
      } as const,
    ]

    if (connectedAddress) {
      return [
        ...baseContracts,
        {
          address: depositLimiterAddress,
          abi: VaultDepositLimiterAbi,
          functionName: 'isWhitelisted',
          args: [connectedAddress],
        } as const,
        {
          address: depositLimiterAddress,
          abi: VaultDepositLimiterAbi,
          functionName: 'userDeposits',
          args: [connectedAddress],
        } as const,
      ]
    }

    return baseContracts
  }, [connectedAddress, depositLimiterAddress])

  const {
    data,
    isLoading: isContractsLoading,
    error: contractsError,
  } = useReadContracts({
    contracts,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME, // Refetch every minute
      enabled: !!depositLimiterAddress, // Only run when we have the address
    },
  })

  return useMemo(() => {
    const isLoading = isAddressLoading || isContractsLoading
    const error = addressError || contractsError

    // Return early if still loading or error
    if (isLoading || error || !depositLimiterAddress) {
      return {
        maxDefaultDepositLimit: 0n,
        maxWhitelistedDepositLimit: 0n,
        isWhitelisted: false,
        userDeposits: 0n,
        isLoading,
        error,
      }
    }

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
  }, [
    data,
    connectedAddress,
    depositLimiterAddress,
    isAddressLoading,
    isContractsLoading,
    addressError,
    contractsError,
  ])
}
