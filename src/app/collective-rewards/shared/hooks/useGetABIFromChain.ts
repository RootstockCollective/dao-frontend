import { filterBuildersByState, useBuilderContext } from '@/app/collective-rewards/user'
import { useReadGauges } from '@/shared/hooks/contracts'
import { useMemo } from 'react'
import { CompleteBuilder } from '../../types'
import { BuilderData, useGetABI } from './useGetABI'
import { TOKENS } from '@/lib/tokens'
import { useGetRewardDistributionRewardsLogs } from './useGetRewardsDistributionRewards'

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
    data: rewardDistributionRewardsLogs,
    isLoading: rewardDistributionRewardsLogsLoading,
    error: rewardDistributionRewardsLogsError,
  } = useGetRewardDistributionRewardsLogs()

  const cycles = rewardDistributionRewardsLogs
    .sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))
    .map(log => ({
      id: log.blockNumber.toString(),
      currentCycleStart: Number(log.timeStamp),
      rewardPerToken: {
        [TOKENS.rif.address.toLowerCase()]: log.args.rifAmount_.toString(),
        [TOKENS.rbtc.address.toLowerCase()]: log.args.nativeAmount_.toString(),
        [TOKENS.usdrif.address.toLowerCase()]: log.args.usdrifAmount_.toString(),
      },
    }))

  const buildersData = useMemo(() => {
    return activeBuilders
      .reduce<Array<BuilderData>>((acc, { address, backerRewardPct, stateFlags }, i) => {
        const allocation = totalAllocation[i] ?? 0n

        if (!allocation || !backerRewardPct) {
          return acc
        }

        acc.push({
          address,
          totalAllocation: allocation.toString(),
          backerRewardPct: {
            next: backerRewardPct.next.toString(),
            previous: backerRewardPct.previous.toString(),
            cooldownEndTime: backerRewardPct.cooldownEndTime.toString(),
          },
          stateFlags,
        })

        return acc
      }, [])
      .sort((a, b) => (BigInt(b.totalAllocation) > BigInt(a.totalAllocation) ? 1 : -1))
  }, [activeBuilders, totalAllocation])

  const isLoading = buildersLoading || rewardDistributionRewardsLogsLoading || totalAllocationLoading

  const error = buildersError ?? rewardDistributionRewardsLogsError ?? totalAllocationError

  const abi = useGetABI({
    builders: buildersData,
    cycles,
  })

  return {
    data: abi,
    isLoading,
    error,
  }
}
