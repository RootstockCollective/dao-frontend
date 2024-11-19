import { getPercentageData } from '@/app/collective-rewards/rewards/utils'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export const useGetBuildersRewardPercentage = (builders: Address[]) => {
  const rewardPercentageCalls = useMemo(
    () =>
      builders?.map(
        builder =>
          ({
            address: BackersManagerAddress,
            abi: BackersManagerAbi,
            functionName: 'builderRewardPercentage',
            args: [builder],
          }) as const,
      ),
    [builders],
  )
  const {
    data: rewardSharesResult,
    isLoading,
    error,
  } = useReadContracts<[bigint, bigint, bigint][]>({
    contracts: rewardPercentageCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })
  const rewardPercentage = useMemo(
    () =>
      rewardSharesResult
        ?.map(share => share.result as [bigint, bigint, bigint])
        .map(([previous, next, cooldownEndTime]) => getPercentageData(previous, next, cooldownEndTime)),
    [rewardSharesResult],
  )

  return {
    data: rewardPercentage,
    isLoading,
    error,
  }
}
