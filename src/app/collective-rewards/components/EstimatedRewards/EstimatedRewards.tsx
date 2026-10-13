import Big from 'big.js'

import { useHandleErrors } from '@/app/collective-rewards/utils'
import { FiatTooltipLabel } from '@/app/components'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { MetricToken } from '@/app/components/Metric/types'
import { createMetricToken } from '@/app/components/Metric/utils'
import { withDataFallback } from '@/app/shared/components/Fallback'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { Header } from '@/components/Typography'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'

import { isDistributionPending, useCycleContext, useCycleDistributionStatus } from '../../metrics'
import { useGetLastCycleRewardsFromChain, useGetLastCycleRewardsWithStateSync } from '../../shared/hooks'
import { CycleData } from '../../shared/hooks/useGetABI'
import { DistributionPending } from '../DistributionPending'

const usePrimaryNormalized = () => {
  const { data, isLoading, error } = useGetLastCycleRewardsWithStateSync()
  return { data: data ?? [], isLoading, error }
}

const useFallbackWithErrors = () => {
  const { data, isLoading, error } = useGetLastCycleRewardsFromChain()
  useHandleErrors({ error, title: 'Error loading last cycle rewards' })
  return { data: data ?? [], isLoading, error }
}

const EstimatedRewardsContent = ({
  lastCycleRewards,
  isLoading,
}: {
  lastCycleRewards: CycleData[]
  isLoading: boolean
}) => {
  const { prices } = usePricesContext()
  const { data: cycle } = useCycleContext()
  const { data: distributionStatus, isLoading: isDistributionStatusLoading } = useCycleDistributionStatus()
  const cycleStart = cycle?.cycleStart?.toSeconds()

  // Until the cycle is read its start is epoch 0, and every past distribution would count as this cycle's
  if (isLoading || isDistributionStatusLoading || !cycleStart) {
    return <LoadingSpinner />
  }

  // The on-chain fallback has one entry per distribution, and a cycle can be distributed more than once
  const currentCycleRewards = lastCycleRewards.filter(entry => cycleStart <= Number(entry.currentCycleStart))

  // Always show all REWARD_TOKEN_KEYS, set token value to 0 if not eligible to show rewards.
  const { rewardPerToken, combinedRewardsFiat } = REWARD_TOKEN_KEYS.reduce(
    (acc, tokenKey) => {
      const { symbol, address } = TOKENS[tokenKey]
      const amount = currentCycleRewards.reduce(
        (sum, entry) => sum + BigInt(entry.rewardPerToken?.[address.toLowerCase()] ?? 0),
        0n,
      )
      const price = prices[symbol]?.price || 0

      const metricToken = createMetricToken({
        symbol,
        value: amount,
        price,
      })

      acc.combinedRewardsFiat = acc.combinedRewardsFiat.add(metricToken.fiatValue)
      acc.rewardPerToken.push(metricToken)

      return acc
    },
    {
      rewardPerToken: [] as MetricToken[],
      combinedRewardsFiat: Big(0),
    },
  )

  return (
    <Metric
      title="Estimated Rewards"
      className="w-full md:w-auto"
      containerClassName="gap-1 md:gap-4"
      contentClassName="flex flex-col gap-2"
    >
      <Header
        variant="h2"
        className="text-v3-text-100 overflow-hidden text-ellipsis leading-[125%] tracking-[0.03rem] text-xl"
      >
        {isDistributionPending(distributionStatus) ? (
          <DistributionPending status={distributionStatus} />
        ) : (
          <>
            {formatCurrency(combinedRewardsFiat, { showCurrencySymbol: false })}{' '}
            <FiatTooltipLabel
              tooltip={{ side: 'top', text: <MetricTooltipContent tokens={rewardPerToken} /> }}
            />
          </>
        )}
      </Header>
      {!isDistributionPending(distributionStatus) && <MetricBar segments={rewardPerToken} />}
    </Metric>
  )
}

const Loader = withDataFallback<CycleData[]>(usePrimaryNormalized, useFallbackWithErrors)
export const EstimatedRewards = () => {
  return (
    <Loader
      render={({ data, isLoading }) => (
        <EstimatedRewardsContent lastCycleRewards={data} isLoading={isLoading} />
      )}
    />
  )
}
