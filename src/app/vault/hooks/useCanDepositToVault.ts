import { useVaultDepositLimiter } from './useVaultDepositLimiter'
import { useMemo } from 'react'
import { formatEther } from 'viem'
import Big from '@/lib/big'

/**
 * Hook for validating if a user can deposit to the vault
 * Combines user deposits check, whitelist status, and deposit limit from contract
 */
export function useCanDepositToVault() {
  const {
    isWhitelisted,
    maxDefaultDepositLimit,
    userDeposits,
    isLoading: isLimiterLoading,
    error: limiterError,
  } = useVaultDepositLimiter()

  return useMemo(() => {
    const isLoading = isLimiterLoading
    const error = limiterError

    // Convert maxDefaultDepositLimit from wei to USDRIF
    const limitInUsdrif = Big(formatEther(maxDefaultDepositLimit))
    const formattedLimit = limitInUsdrif.toFixedNoTrailing(2)

    // If still loading or error, return early
    if (isLoading || error) {
      return {
        canDeposit: false,
        isLoading,
        error,
        reason: error ? 'Failed to check deposit eligibility' : undefined,
        maxDefaultDepositLimit: formattedLimit,
      }
    }

    const userDepositsInUsdrif = Big(formatEther(userDeposits))

    // If userDeposits <= limit, user can always deposit
    if (userDepositsInUsdrif.lte(limitInUsdrif)) {
      return {
        canDeposit: true,
        isLoading: false,
        error: undefined,
        reason: undefined,
        maxDefaultDepositLimit: formattedLimit,
      }
    }

    // If userDeposits > limit, check whitelist status
    if (isWhitelisted) {
      return {
        canDeposit: true,
        isLoading: false,
        error: undefined,
        reason: undefined,
        maxDefaultDepositLimit: formattedLimit,
      }
    }

    // UserDeposits > limit AND not whitelisted -> cannot deposit, needs KYC
    return {
      canDeposit: false,
      isLoading: false,
      error: undefined,
      reason: 'KYC required for deposits above the limit',
      maxDefaultDepositLimit: formattedLimit,
    }
  }, [isLimiterLoading, limiterError, isWhitelisted, maxDefaultDepositLimit, userDeposits])
}
