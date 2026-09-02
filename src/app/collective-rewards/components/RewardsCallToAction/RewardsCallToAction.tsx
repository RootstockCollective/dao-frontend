'use client'

import { useMemo } from 'react'

import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import Big from '@/lib/big'
import { WeiPerEther } from '@/lib/constants'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'

import { useCycleDashboard } from '../../context/CycleDashboardContext'
import { useHandleErrors } from '../../utils'
import { RewardsCallToActionContent } from './RewardsCallToActionContent'

export const RewardsCallToAction = ({ className }: { className?: string }) => {
  const { data: estimatedRewards, error } = useGetBuilderEstimatedRewards()
  const { runningCycle, buildersCount } = useCycleDashboard()
  const { prices } = usePricesContext()

  useHandleErrors({ error, title: 'Error loading upcoming rewards' })

  /**
   * Upcoming rewards are per-Builder and per-token; the cards want one fiat figure per role,
   * so every Builder's share is converted at its token's price and summed.
   */
  const { backersUpcoming, buildersUpcoming } = useMemo(
    () =>
      estimatedRewards.reduce(
        (acc, { backerEstimatedRewards, builderEstimatedRewards }) => {
          for (const tokenKey of REWARD_TOKEN_KEYS) {
            const price = prices[TOKENS[tokenKey].symbol]?.price ?? 0
            const toFiat = (value: bigint) => Big(value.toString()).div(WeiPerEther.toString()).mul(price)

            acc.backersUpcoming = acc.backersUpcoming.add(
              toFiat(backerEstimatedRewards[tokenKey]?.amount?.value ?? 0n),
            )
            acc.buildersUpcoming = acc.buildersUpcoming.add(
              toFiat(builderEstimatedRewards[tokenKey]?.amount?.value ?? 0n),
            )
          }

          return acc
        },
        { backersUpcoming: Big(0), buildersUpcoming: Big(0) },
      ),
    [estimatedRewards, prices],
  )

  return (
    <RewardsCallToActionContent
      backersUpcoming={backersUpcoming}
      buildersUpcoming={buildersUpcoming}
      // These describe what is heading out in the open cycle, so they ignore the page selection.
      backersCount={runningCycle?.backersCount ?? null}
      buildersCount={buildersCount}
      className={className}
    />
  )
}
