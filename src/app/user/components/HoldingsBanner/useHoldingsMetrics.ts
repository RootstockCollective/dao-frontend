'use client'

import type Big from 'big.js'
import { useMemo } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

import { useGetVotingPower } from '@/app/collective-rewards/allocations/hooks'
import { getUnclaimedRewards, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { useFetchPrices } from '@/app/user/Balances/hooks/useFetchPrices'
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import BigNumber from '@/lib/big'
import { RBTC, RIF, STRIF, USDRIF } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadBackersManager } from '@/shared/hooks/contracts'

const PORTFOLIO_TOKENS = [RIF, STRIF, USDRIF, RBTC] as const

export type HoldingsMetricStatus = 'loading' | 'error' | 'ready'

export interface HoldingsMetric<T> {
  value: T
  status: HoldingsMetricStatus
}

const toStatus = (isLoading: boolean, error: unknown): HoldingsMetricStatus => {
  if (error) return 'error'
  if (isLoading) return 'loading'
  return 'ready'
}

/**
 * The three headline numbers shown in the Holdings banner: what the backer can still
 * claim, how much of their stRIF is not backing anyone yet, and what the wallet's
 * RIF, stRIF, USDRIF and rBTC are worth.
 *
 * Each number carries its own status, so a slow or failing source only affects its own
 * metric and the banner never shows a zero that is really "not loaded yet".
 *
 * Must be rendered inside a BackerRewardsContextProvider.
 */
export const useHoldingsMetrics = () => {
  const { address } = useAccount()
  const { prices } = usePricesContext()
  // Same query the prices context reads from, used here only for its loading and error state
  const { isLoading: isPricesLoading, error: pricesError } = useFetchPrices()
  const { balances, isBalancesLoading } = useGetAddressBalances()
  const {
    data: rewardsPerToken,
    isLoading: isRewardsLoading,
    error: rewardsError,
  } = useBackerRewardsContext()

  const { data: votingPower, isLoading: isVotingPowerLoading, error: votingPowerError } = useGetVotingPower()
  // No placeholder on purpose: a placeholder of 0 would read as "nothing allocated" and flash
  // 100% available backing until the real allocation arrives
  const {
    data: totalAllocation,
    isLoading: isAllocationLoading,
    error: allocationError,
  } = useReadBackersManager(
    {
      functionName: 'backerTotalAllocation',
      args: [address ?? zeroAddress],
    },
    { enabled: !!address },
  )

  const unclaimedRewards = useMemo<HoldingsMetric<Big>>(
    () => ({
      value: getUnclaimedRewards(rewardsPerToken, prices).total,
      status: toStatus(isRewardsLoading || isPricesLoading, rewardsError ?? pricesError),
    }),
    [rewardsPerToken, prices, isRewardsLoading, isPricesLoading, rewardsError, pricesError],
  )

  const portfolioValue = useMemo<HoldingsMetric<Big>>(
    () => ({
      value: PORTFOLIO_TOKENS.reduce((total, symbol) => {
        const price = prices[symbol]?.price ?? 0
        return total.add(BigNumber(balances[symbol]?.balance ?? 0).mul(price))
      }, BigNumber(0)),
      status: toStatus(isBalancesLoading || isPricesLoading, pricesError),
    }),
    [balances, prices, isBalancesLoading, isPricesLoading, pricesError],
  )

  // stRIF that is not allocated to any builder yet, as a share of the backer's stRIF
  const availableBackingPercentage = useMemo<HoldingsMetric<number>>(() => {
    const status = toStatus(isVotingPowerLoading || isAllocationLoading, votingPowerError ?? allocationError)

    if (status !== 'ready' || !votingPower || votingPower === 0n) {
      return { value: 0, status }
    }

    const available = votingPower - (totalAllocation ?? 0n)
    const percentage = Number((available * 10000n) / votingPower) / 100

    // The contracts keep the allocation within the balance, but the two reads can land a
    // block apart, so keep the figure inside 0-100 rather than show a negative share
    return { value: Math.min(Math.max(percentage, 0), 100), status }
  }, [
    votingPower,
    totalAllocation,
    isVotingPowerLoading,
    isAllocationLoading,
    votingPowerError,
    allocationError,
  ])

  const error = rewardsError ?? pricesError ?? votingPowerError ?? allocationError ?? null

  return { unclaimedRewards, portfolioValue, availableBackingPercentage, error }
}
