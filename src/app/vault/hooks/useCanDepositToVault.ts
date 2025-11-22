import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { useVaultDepositLimiter } from './useVaultDepositLimiter'
import { useMemo } from 'react'
import { formatEther } from 'viem'
import Big from '@/lib/big'
import { USDRIF } from '@/lib/constants'

/**
 * Hook for validating if a user can deposit to the vault
 * Combines balance check, whitelist status, and deposit limit from contract
 */
export function useCanDepositToVault() {
  const { balances, isBalancesLoading } = useGetAddressBalances()
  const {
    isWhitelisted,
    maxDefaultDepositLimit,
    isLoading: isLimiterLoading,
    error: limiterError,
  } = useVaultDepositLimiter()

  const usdrifBalance = balances[USDRIF]

  return useMemo(() => {
    const isLoading = isBalancesLoading || isLimiterLoading
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

    const balanceInUsdrif = Big(usdrifBalance.balance)

    // If balance <= limit, user can always deposit
    if (balanceInUsdrif.lte(limitInUsdrif)) {
      return {
        canDeposit: true,
        isLoading: false,
        error: undefined,
        reason: undefined,
        maxDefaultDepositLimit: formattedLimit,
      }
    }

    // If balance > limit, check whitelist status
    if (isWhitelisted) {
      return {
        canDeposit: true,
        isLoading: false,
        error: undefined,
        reason: undefined,
        maxDefaultDepositLimit: formattedLimit,
      }
    }

    // Balance > limit AND not whitelisted -> cannot deposit, needs KYC
    return {
      canDeposit: false,
      isLoading: false,
      error: undefined,
      reason: 'KYC required for deposits above the limit',
      maxDefaultDepositLimit: formattedLimit,
    }
  }, [
    isBalancesLoading,
    isLimiterLoading,
    limiterError,
    isWhitelisted,
    maxDefaultDepositLimit,
    usdrifBalance.balance,
  ])
}
