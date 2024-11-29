import { BuilderRewardPercentage, getPercentageData } from '@/app/collective-rewards/rewards/utils'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export const useGetBackersRewardPercentage = (builders: Address[], timestampInSeconds?: number) => {
  const contractCalls = builders?.map(
    builder =>
      ({
        address: BackersManagerAddress,
        abi: BuilderRegistryAbi,
        functionName: 'backerRewardPercentage',
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

        const [current, next, cooldownEndTime] = (contractResults[index].result || [0n, 0n, 0n]) as [
          bigint,
          bigint,
          bigint,
        ]
        const result = getPercentageData(current, next, cooldownEndTime, timestampInSeconds)
        acc[gauge] = result

        return acc
      }, {}),
    [builders, contractResults, timestampInSeconds],
  )

  return {
    data: buildersMap,
    isLoading,
    error,
  }
}
