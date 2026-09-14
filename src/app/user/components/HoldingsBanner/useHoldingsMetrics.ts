'use client'

import { useMemo } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

import { useGetVotingPower } from '@/app/collective-rewards/allocations/hooks'
import { useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { getFiatAmount } from '@/app/shared/formatter'
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import Big from '@/lib/big'
import { RBTC, RIF, STRIF, USDRIF } from '@/lib/constants'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadBackersManager } from '@/shared/hooks/contracts'

const PORTFOLIO_TOKENS = [RIF, STRIF, USDRIF, RBTC] as const

/**
 * The three headline numbers shown in the Holdings banner: what the backer can still
 * claim, how much of their voting power is not backing anyone yet, and what everything
 * in their wallet is worth.
 *
 * Must be rendered inside a BackerRewardsContextProvider.
 */
export const useHoldingsMetrics = () => {
  const { address } = useAccount()
  const { prices } = usePricesContext()
  const { balances, isBalancesLoading } = useGetAddressBalances()
  const { data: rewardsPerToken } = useBackerRewardsContext()

  const { data: votingPower, isLoading: isVotingPowerLoading } = useGetVotingPower()
  const { data: totalAllocation, isLoading: isAllocationLoading } = useReadBackersManager(
    {
      functionName: 'backerTotalAllocation',
      args: [address ?? zeroAddress],
    },
    { placeholderData: 0n, enabled: !!address },
  )

  const unclaimedRewards = useMemo(
    () =>
      REWARD_TOKEN_KEYS.reduce((total, tokenKey) => {
        const { symbol, address: tokenAddress } = TOKENS[tokenKey]
        const earned = Object.values((rewardsPerToken?.[tokenAddress] ?? { earned: 0n }).earned).reduce(
          (acc, value) => acc + value,
          0n,
        )
        return total.add(getFiatAmount(earned, prices[symbol]?.price ?? 0))
      }, Big(0)),
    [rewardsPerToken, prices],
  )

  const portfolioValue = useMemo(
    () =>
      PORTFOLIO_TOKENS.reduce((total, symbol) => {
        const price = prices[symbol]?.price ?? 0
        return total.add(Big(balances[symbol]?.balance ?? 0).mul(price))
      }, Big(0)),
    [balances, prices],
  )

  // Voting power that is not allocated to any builder yet, as a share of the total
  const availableBackingPercentage = useMemo(() => {
    if (!votingPower || votingPower === 0n) {
      return 0
    }
    const available = votingPower - (totalAllocation ?? 0n)
    return Number((available * 10000n) / votingPower) / 100
  }, [votingPower, totalAllocation])

  return {
    unclaimedRewards,
    portfolioValue,
    availableBackingPercentage,
    isLoading: isBalancesLoading || isVotingPowerLoading || isAllocationLoading,
  }
}
