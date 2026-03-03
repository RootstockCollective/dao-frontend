import { useReadContract } from 'wagmi'
import { vault } from '@/lib/contracts'
import { Address } from 'viem'

/**
 * Hook to read the deposit limiter address from the vault contract
 * This is a one-time read as the deposit limiter address doesn't change
 */
export function useVaultDepositLimiterAddress() {
  const {
    data: depositLimiterAddress,
    isLoading,
    error,
  } = useReadContract({
    address: vault.address,
    abi: vault.abi,
    functionName: 'depositLimiter',
    query: {
      refetchInterval: false,
      staleTime: Infinity,
      gcTime: Infinity,
    },
  })

  return {
    depositLimiterAddress: depositLimiterAddress as Address | undefined,
    isLoading,
    error,
  }
}
