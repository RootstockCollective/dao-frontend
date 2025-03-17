import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'
import { BackerRewardPercentage } from '../types'
import { getBackerRewardPercentage } from '../utils'
import { BuilderRegistryAddress } from '@/lib/contracts'

export const useGetBackersRewardPercentage = (builders: Address[], timestampInSeconds?: number) => {
  const contractCalls = builders?.map(
    builder =>
      ({
        address: BuilderRegistryAddress,
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

  type ReturnType = BackerRewardPercentage
  const buildersMap = useMemo(
    () =>
      builders.reduce<Record<Address, ReturnType>>((acc, gauge, index) => {
        if (!contractResults) {
          return {} as Record<Address, ReturnType>
        }

        const [previous, next, cooldownEndTime] = (contractResults[index].result || [0n, 0n, 0n]) as [
          bigint,
          bigint,
          bigint,
        ]
        const backerRewardPercentage = getBackerRewardPercentage(
          previous,
          next,
          cooldownEndTime,
          timestampInSeconds,
        )

        acc[gauge] = backerRewardPercentage

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
