'use client'

import { useMemo } from 'react'

import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import Big from '@/lib/big'
import { WeiPerEther } from '@/lib/constants'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'

import { useGetCycleHistory } from '../../rewards/hooks/useGetCycleHistory'
import { useGetActiveBuildersCount } from '../../shared/hooks/useGetActiveBuildersCount'
import { useHandleErrors } from '../../utils'
import { RewardsCallToActionContent } from './RewardsCallToActionContent'

export const RewardsCallToAction = ({ className }: { className?: string }) => {
  const { data: estimatedRewards, error } = useGetBuilderEstimatedRewards()
  const { data: cycles } = useGetCycleHistory()
  const { data: buildersData } = useGetActiveBuildersCount()
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
      backersCount={cycles[0]?.backersCount ?? null}
      buildersCount={buildersData?.count ?? null}
      className={className}
    />
  )
}
