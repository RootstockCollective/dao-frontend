'use client'

import { useMemo } from 'react'

import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { getFiatAmount } from '@/app/shared/formatter'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import Big from '@/lib/big'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'

import { useCycleDashboard } from '../../context/CycleDashboardContext'
import { useHandleErrors } from '../../utils'
import { RewardsCallToActionContent } from './RewardsCallToActionContent'

export const RewardsCallToAction = ({ className }: { className?: string }) => {
  const { data: estimatedRewards, isLoading, error } = useGetBuilderEstimatedRewards()
  const { isLoading: isLoadingBuilders, error: buildersError } = useBuilderContext()
  const { runningCycle, buildersCount } = useCycleDashboard()
  const { prices } = usePricesContext()

  useHandleErrors({ error, title: 'Error loading upcoming rewards' })

  const { backersUpcoming, buildersUpcoming } = useMemo(
    () =>
      estimatedRewards.reduce(
        (acc, { backerEstimatedRewards, builderEstimatedRewards }) => {
          for (const tokenKey of REWARD_TOKEN_KEYS) {
            const price = prices[TOKENS[tokenKey].symbol]?.price ?? 0

            acc.backersUpcoming = acc.backersUpcoming.add(
              getFiatAmount(backerEstimatedRewards[tokenKey]?.amount?.value ?? 0n, price),
            )
            acc.buildersUpcoming = acc.buildersUpcoming.add(
              getFiatAmount(builderEstimatedRewards[tokenKey]?.amount?.value ?? 0n, price),
            )
          }

          return acc
        },
        { backersUpcoming: Big(0), buildersUpcoming: Big(0) },
      ),
    [estimatedRewards, prices],
  )

  // An empty roster or estimate list would sum to a confident $0.
  const isUnknown = isLoading || isLoadingBuilders || Boolean(error ?? buildersError)

  return (
    <RewardsCallToActionContent
      backersUpcoming={isUnknown ? null : backersUpcoming}
      buildersUpcoming={isUnknown ? null : buildersUpcoming}
      backersCount={runningCycle?.backersCount ?? null}
      buildersCount={buildersCount}
      className={className}
    />
  )
}
