import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, isAddressEqual } from 'viem'

import { useGetBuilderRewardsClaimedLogs, useGetGaugesNotifyReward } from '@/app/collective-rewards/rewards'
import { fetchAllCycles } from '@/app/collective-rewards/rewards/hooks/useGetTotalRewardsFromCycles'
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
  const { data: isStateSyncHealthy, isLoading: healthCheckIsLoading } = useStateSyncHealthCheck({
    initialData: true,
  })

  // Source 1: Cycles API (StateSync healthy)
  const {
    data: cycles,
    isLoading: cyclesLoading,
    error: cyclesError,
  } = useQuery<CycleRewardsItem[], Error>({
    queryFn: fetchAllCycles,
    queryKey: ['totalRewardsDistributedCycles'],
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: !healthCheckIsLoading && !!isStateSyncHealthy,
  })

  // Source 2: Events fallback (StateSync unhealthy)
  const {
    data: notifyReward,
    isLoading: notifyRewardLoading,
    error: notifyRewardError,
  } = useGetGaugesNotifyReward({
    gauges,
    rewardTokens: [rifAddress],
    enabled: !healthCheckIsLoading && !isStateSyncHealthy,
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

    if (isStateSyncHealthy) {
      const lowerAddr = rifAddress.toLowerCase()
      notifyRewards = (cycles ?? []).reduce((total, cycle) => {
        const direct = cycle.rewardPerToken[lowerAddr] ?? cycle.rewardPerToken[rifAddress]
        if (direct !== undefined) return total + BigInt(direct)
        const entry = Object.entries(cycle.rewardPerToken).find(([addr]) =>
          isAddressEqual(addr as `0x${string}`, rifAddress),
        )
        return entry ? total + BigInt(entry[1]) : total
      }, 0n)
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
  }, [builderRewardsPerToken, claimableRewards, cycles, isStateSyncHealthy, notifyReward, rifAddress])

  return {
    amount,
    isLoading:
      healthCheckIsLoading ||
      (isStateSyncHealthy ? cyclesLoading : notifyRewardLoading) ||
      builderRewardsPerTokenLoading ||
      claimableRewardsLoading,
    error: cyclesError ?? notifyRewardError ?? builderRewardsPerTokenError ?? claimableRewardsError,
  }
}
