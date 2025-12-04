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
    maxWhitelistedDepositLimit,
    userDeposits,
    isLoading: isLimiterLoading,
    error: limiterError,
  } = useVaultDepositLimiter()

  return useMemo(() => {
    const isLoading = isLimiterLoading
    const error = limiterError

    // Use appropriate limit based on whitelist status
    const applicableLimit = isWhitelisted ? maxWhitelistedDepositLimit : maxDefaultDepositLimit
    const limitInUsdrif = Big(formatEther(applicableLimit))
    const formattedLimit = limitInUsdrif.toFixedNoTrailing(2)

    // If still loading or error, return early
    if (isLoading || error) {
      return {
        canDeposit: false,
        isLoading,
        error,
        reason: error ? 'Failed to check deposit eligibility' : undefined,
        maxDepositLimit: formattedLimit,
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
        maxDepositLimit: formattedLimit,
      }
    }

    // If userDeposits > limit, check whitelist status
    if (isWhitelisted) {
      return {
        canDeposit: true,
        isLoading: false,
        error: undefined,
        reason: undefined,
        maxDepositLimit: formattedLimit,
      }
    }

    // UserDeposits > limit AND not whitelisted -> cannot deposit, needs KYC
    return {
      canDeposit: false,
      isLoading: false,
      error: undefined,
      reason: 'KYC required for deposits above the limit',
      maxDepositLimit: formattedLimit,
    }
  }, [
    isLimiterLoading,
    limiterError,
    isWhitelisted,
    maxDefaultDepositLimit,
    maxWhitelistedDepositLimit,
    userDeposits,
  ])
}
