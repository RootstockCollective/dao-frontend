import { useHandleErrors } from '@/app/collective-rewards/utils'
import { FiatTooltipLabel } from '@/app/components'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { MetricToken } from '@/app/components/Metric/types'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { Header } from '@/components/Typography'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'
import Big from 'big.js'
import { createMetricToken } from '@/app/components/Metric/utils'
import { useGetLastCycleRewardsFromChain, useGetLastCycleRewardsWithStateSync } from '../../shared/hooks'
import { withDataFallback } from '@/app/shared/components/Fallback'
import { CycleData } from '../../shared/hooks/useGetABI'
import { useCycleContext } from '../../metrics/context'

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

  if (isLoading) {
    return <LoadingSpinner />
  }

  // Always show all REWARD_TOKEN_KEYS, set token value to 0 if not eligible to show rewards.
  const lastCycle = lastCycleRewards[0]
  const shouldDisplayRewards =
    lastCycle && cycle?.cycleStart.toSeconds() <= Number(lastCycle.currentCycleStart)

  const { rewardPerToken, combinedRewardsFiat } = REWARD_TOKEN_KEYS.reduce(
    (acc, tokenKey) => {
      const { symbol, address } = TOKENS[tokenKey]
      let amount = '0'
      if (shouldDisplayRewards && lastCycle?.rewardPerToken?.[address.toLowerCase()]) {
        amount = lastCycle.rewardPerToken[address.toLowerCase()]
      }
      const price = prices[symbol]?.price || 0

      const metricToken = createMetricToken({
        symbol,
        value: BigInt(amount),
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
        {formatCurrency(combinedRewardsFiat, { showCurrencySymbol: false })}{' '}
        <FiatTooltipLabel tooltip={{ side: 'top', text: <MetricTooltipContent tokens={rewardPerToken} /> }} />
      </Header>
      <MetricBar segments={rewardPerToken} />
    </Metric>
  )
}

export const EstimatedRewards = () => {
  const Loader = withDataFallback<CycleData[]>(usePrimaryNormalized, useFallbackWithErrors)

  return (
    <Loader
      render={({ data, isLoading }) => (
        <EstimatedRewardsContent lastCycleRewards={data} isLoading={isLoading} />
      )}
    />
  )
}
