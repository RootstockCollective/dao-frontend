import { BuilderData, useGetABI } from './useGetABI'
import { useMemo } from 'react'
import { useGetCycleRewards } from './useGetCycleRewards'
import { useReadGauges } from '@/shared/hooks/contracts'
import { useReadBuilderRegistryForMultipleArgs } from '@/shared/hooks/contracts/collective-rewards/useReadBuilderRegistryForMultipleArgs'
import { RequiredBuilder } from '../../types'
import { useGetBuildersByState } from '../../user'

export const useGetABIFromChain = () => {
  const {
    data: builders,
    isLoading: buildersLoading,
    error: buildersError,
  } = useGetBuildersByState<RequiredBuilder>({
    activated: true,
    communityApproved: true,
    kycApproved: true,
    revoked: false,
  })

  const gauges = builders.map(({ gauge }) => gauge)
  const {
    data: totalAllocation,
    isLoading: totalAllocationLoading,
    error: totalAllocationError,
  } = useReadGauges({ addresses: gauges, functionName: 'totalAllocation' })

  const buildersAddress = builders.map(({ address }) => [address] as const)
  const {
    data: backerRewardsPercPerBuilder,
    isLoading: backerRewardsLoading,
    error: backerRewardError,
  } = useReadBuilderRegistryForMultipleArgs({
    functionName: 'backerRewardPercentage',
    args: buildersAddress,
  })
  const {
    data: cycleRewards,
    isLoading: cycleRewardsLoading,
    error: cycleRewardsError,
  } = useGetCycleRewards()

  const buildersData = useMemo(() => {
    return builders
      .reduce<Array<BuilderData>>((acc, { address }, i) => {
        const allocation = totalAllocation[i] ?? 0n
        const rewardPct = backerRewardsPercPerBuilder[i]
        const [previous, next, cooldownEndTime] = rewardPct ?? [0n, 0n, 0n]

        if (!allocation || !rewardPct) {
          return acc
        }

        acc.push({
          id: address,
          totalAllocation: allocation.toString(),
          rewardShares: '0',
          backerRewardPercentage: {
            id: address,
            next: next.toString(),
            previous: previous.toString(),
            cooldownEndTime: cooldownEndTime.toString(),
          },
        })

        return acc
      }, [])
      .sort((a, b) => (BigInt(b.totalAllocation) > BigInt(a.totalAllocation) ? 1 : -1))
  }, [backerRewardsPercPerBuilder, builders, totalAllocation])

  const isLoading = buildersLoading || cycleRewardsLoading || totalAllocationLoading || backerRewardsLoading

  const error = buildersError ?? cycleRewardsError ?? totalAllocationError ?? backerRewardError

  const abi = useGetABI({
    builders: buildersData,
    cycles: [
      {
        id: '0',
        rewardsERC20: cycleRewards.rifRewards.toString(),
        rewardsRBTC: cycleRewards.rbtcRewards.toString(),
      },
    ],
  })

  return {
    data: abi,
    isLoading,
    error,
  }
}
