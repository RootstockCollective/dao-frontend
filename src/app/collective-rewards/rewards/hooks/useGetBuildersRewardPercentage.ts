import { BuilderRewardPercentage, getPercentageData } from '@/app/collective-rewards/rewards/utils'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export const useGetBuildersRewardPercentage = (builders: Address[]) => {
  const contractCalls = builders?.map(
    builder =>
      ({
        address: BackersManagerAddress,
        abi: BackersManagerAbi,
        functionName: 'builderRewardPercentage',
        args: [builder],
      }) as const,
  )

  const {
    data: contractResults,
    isLoading,
    error,
  } = useReadContracts({
    contracts: contractCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  type ReturnType = BuilderRewardPercentage
  const buildersMap = useMemo(
    () =>
      builders.reduce<Record<Address, ReturnType>>((acc, gauge, index) => {
        if (!contractResults) {
          return {} as Record<Address, ReturnType>
        }

        const [current, next, cooldownEndTime] = contractResults[index].result as [bigint, bigint, bigint]
        const result = getPercentageData(current, next, cooldownEndTime)
        acc[gauge] = result

        return acc
      }, {}),
    [builders, contractResults],
  )

  return {
    data: buildersMap,
    isLoading,
    error,
  }
}
