import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withDataFallback } from '@/app/shared/components/Fallback'
import { getMetricTokens } from '@/app/shared/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { REWARD_TOKEN_KEYS, RewardTokenKey, TOKENS } from '@/lib/tokens'
import { parseBigInt } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'

import { useCycleContext, useCycleDistributionStatus } from '../../metrics'
import { useGetLastCycleRewardsFromChain, useGetLastCycleRewardsWithStateSync } from '../../shared/hooks'
import { CycleData } from '../../shared/hooks/useGetABI'
import { EstimatedRewardsAmount } from '../EstimatedRewardsAmount'

const usePrimaryNormalized = () => {
  const { data, isLoading, error } = useGetLastCycleRewardsWithStateSync()
  return { data: data ?? [], isLoading, error }
}

const useFallbackWithErrors = () => {
  const { data, isLoading, error } = useGetLastCycleRewardsFromChain()
  useHandleErrors({ error, title: 'Error loading last cycle rewards' })
  return { data: data ?? [], isLoading, error }
}

const sumCycleRewards = (lastCycleRewards: CycleData[], cycleStart: number) => {
  const currentCycleRewards = cycleStart
    ? lastCycleRewards.filter(entry => cycleStart <= Number(entry.currentCycleStart))
    : []

  return REWARD_TOKEN_KEYS.reduce(
    (acc, tokenKey) => {
      const address = TOKENS[tokenKey].address.toLowerCase()
      acc[tokenKey] = currentCycleRewards.reduce(
        (sum, entry) => sum + parseBigInt(entry.rewardPerToken?.[address]),
        0n,
      )
      return acc
    },
    {} as Record<RewardTokenKey, bigint>,
  )
}

const EstimatedRewardsContent = ({
  lastCycleRewards,
  isLoading,
}: {
  lastCycleRewards: CycleData[]
  isLoading: boolean
}) => {
  const { prices } = usePricesContext()
  const { data: cycle, isLoading: isCycleLoading } = useCycleContext()
  const { data: distributionStatus, isLoading: isDistributionStatusLoading } = useCycleDistributionStatus()
  const cycleStart = cycle?.cycleStart?.toSeconds() ?? 0

  // Wait for the cycle while it loads; if its read failed the metric shows 0.00 instead of spinning forever
  if (isLoading || isDistributionStatusLoading || (isCycleLoading && !cycleStart)) {
    return <LoadingSpinner />
  }

  // Always show all REWARD_TOKEN_KEYS, set token value to 0 if not eligible to show rewards.
  const { metricTokens, total } = getMetricTokens(sumCycleRewards(lastCycleRewards, cycleStart), prices)

  return (
    <Metric
      title="Estimated Rewards"
      className="w-full md:w-auto"
      containerClassName="gap-1 md:gap-4"
      contentClassName="flex flex-col gap-2"
    >
      <EstimatedRewardsAmount
        status={distributionStatus}
        fiat={total}
        tokens={metricTokens}
        headerVariant="h2"
        headerClassName="text-v3-text-100 overflow-hidden text-ellipsis leading-[125%] tracking-[0.03rem] text-xl"
      />
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
