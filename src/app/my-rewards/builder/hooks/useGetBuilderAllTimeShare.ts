import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address } from 'viem'

import { useGetBuilderRewardsClaimedLogs, useGetGaugesNotifyReward } from '@/app/collective-rewards/rewards'
import {
  fetchAllCycles,
  sumCycleRewardForToken,
} from '@/app/collective-rewards/rewards/hooks/useGetTotalRewardsFromCycles'
import { useStateSyncHealthCheck } from '@/app/collective-rewards/shared/hooks/useStateSyncHealthCheck'
import { CycleRewardsItem } from '@/app/collective-rewards/types'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'

interface UseBuilderAllTimeShareProps {
  gauge: Address
  gauges: Address[]
  rifAddress: Address
}

interface AllTimeShareData {
  amount: string
  isLoading: boolean
  error: Error | null
}

export const useGetBuilderAllTimeShare = ({
  gauge,
  gauges,
  rifAddress,
}: UseBuilderAllTimeShareProps): AllTimeShareData => {
  const {
    data: isStateSyncHealthy,
    isLoading: healthCheckIsLoading,
    error: healthCheckError,
  } = useStateSyncHealthCheck({
    initialData: true,
  })

  const useCycles = !healthCheckIsLoading && !healthCheckError && !!isStateSyncHealthy

  // Source 1: Cycles API (StateSync healthy)
  const {
    data: cycles,
    isLoading: cyclesLoading,
    error: cyclesError,
  } = useQuery<CycleRewardsItem[], Error>({
    queryFn: fetchAllCycles,
    queryKey: ['totalRewardsDistributedCycles'],
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: useCycles,
  })

  // Source 2: Events fallback (StateSync unhealthy or health check error)
  const {
    data: notifyReward,
    isLoading: notifyRewardLoading,
    error: notifyRewardError,
  } = useGetGaugesNotifyReward({
    gauges,
    rewardTokens: [rifAddress],
    enabled: !healthCheckIsLoading && !useCycles,
  })

  const {
    data: builderRewardsPerToken,
    isLoading: builderRewardsPerTokenLoading,
    error: builderRewardsPerTokenError,
  } = useGetBuilderRewardsClaimedLogs(gauge)

  const {
    data: claimableRewards,
    isLoading: claimableRewardsLoading,
    error: claimableRewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [rifAddress] })

  const amount = useMemo(() => {
    const builderClaimedRewards =
      builderRewardsPerToken[rifAddress]?.reduce((acc, event) => acc + event.args.amount_, 0n) ?? 0n

    const totalBuilderRewards = builderClaimedRewards + (claimableRewards ?? 0n)

    let notifyRewards: bigint

    if (useCycles) {
      notifyRewards = sumCycleRewardForToken(cycles ?? [], rifAddress)
    } else {
      notifyRewards = Object.values(notifyReward).reduce(
        (acc, events) =>
          acc +
          events.reduce(
            (sum, { args: { backersAmount_, builderAmount_ } }) => sum + backersAmount_ + builderAmount_,
            0n,
          ),
        0n,
      )
    }

    return !notifyRewards ? '0%' : `${(totalBuilderRewards * 100n) / notifyRewards}%`
  }, [builderRewardsPerToken, claimableRewards, cycles, useCycles, notifyReward, rifAddress])

  return {
    amount,
    isLoading:
      healthCheckIsLoading ||
      (useCycles ? cyclesLoading : notifyRewardLoading) ||
      builderRewardsPerTokenLoading ||
      claimableRewardsLoading,
    // When the health check errors, useCycles is false and the events fallback is the
    // active source, so healthCheckError must not be surfaced — otherwise the metric
    // shows an error despite having valid fallback data.
    error:
      (useCycles ? cyclesError : notifyRewardError) ?? builderRewardsPerTokenError ?? claimableRewardsError,
  }
}
