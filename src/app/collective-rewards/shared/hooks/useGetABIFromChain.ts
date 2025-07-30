import { BuilderData, useGetABI } from './useGetABI'
import { useMemo } from 'react'
import { useGetCycleRewards } from './useGetCycleRewards'
import { useReadGauges } from '@/shared/hooks/contracts'
import { CompleteBuilder } from '../../types'
import { filterBuildersByState, useBuilderContext } from '@/app/collective-rewards/user'

export const useGetABIFromChain = () => {
  const { builders, isLoading: buildersLoading, error: buildersError } = useBuilderContext()

  const activeBuilders = filterBuildersByState<CompleteBuilder>(builders)

  const gauges = activeBuilders.map(({ gauge }) => gauge)
  const {
    data: totalAllocation,
    isLoading: totalAllocationLoading,
    error: totalAllocationError,
  } = useReadGauges({ addresses: gauges, functionName: 'totalAllocation' })

  const {
    data: cycleRewards,
    isLoading: cycleRewardsLoading,
    error: cycleRewardsError,
  } = useGetCycleRewards()

  const buildersData = useMemo(() => {
    return activeBuilders
      .reduce<Array<BuilderData>>((acc, { address, backerRewardPct, stateFlags }, i) => {
        const allocation = totalAllocation[i] ?? 0n

        if (!allocation || !backerRewardPct) {
          return acc
        }

        acc.push({
          id: address,
          totalAllocation: allocation.toString(),
          rewardShares: '0',
          backerRewardPercentage: {
            id: address,
            next: backerRewardPct.next.toString(),
            previous: backerRewardPct.previous.toString(),
            cooldownEndTime: backerRewardPct.cooldownEndTime.toString(),
          },
          state: {
            activated: stateFlags?.activated ?? false,
            kycApproved: stateFlags?.kycApproved ?? false,
            communityApproved: stateFlags?.communityApproved ?? false,
            paused: stateFlags?.paused ?? false,
            revoked: stateFlags?.revoked ?? false,
          },
        })

        return acc
      }, [])
      .sort((a, b) => (BigInt(b.totalAllocation) > BigInt(a.totalAllocation) ? 1 : -1))
  }, [activeBuilders, totalAllocation])

  const isLoading = buildersLoading || cycleRewardsLoading || totalAllocationLoading

  const error = buildersError ?? cycleRewardsError ?? totalAllocationError

  const abi = useGetABI({
    builders: buildersData,
    cycles: [
      {
        id: '0',
        rewardsERC20: cycleRewards.rif.toString(),
        rewardsRBTC: cycleRewards.rbtc.toString(),
      },
    ],
  })

  return {
    data: abi,
    isLoading,
    error,
  }
}
