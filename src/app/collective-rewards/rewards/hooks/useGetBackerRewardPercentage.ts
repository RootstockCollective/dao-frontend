import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { getBackerRewardPercentage } from '../utils'
import { useMigrationContext } from '@/shared/context/MigrationContext'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'

export const useGetBackerRewardPercentage = (builder: Address, timestampInSeconds?: number) => {
  const { builderRegistryAddress } = useMigrationContext()

  const { data, isLoading, error } = useReadContract({
    address: builderRegistryAddress,
    abi: BuilderRegistryAbi,
    functionName: 'backerRewardPercentage',
    args: [builder],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const backerRewardPercentage = useMemo(() => {
    const [previous, next, cooldownEndTime] = data || [0n, 0n, 0n]

    return getBackerRewardPercentage(previous, next, cooldownEndTime, timestampInSeconds)
  }, [data, timestampInSeconds])

  return {
    data: backerRewardPercentage,
    isLoading,
    error,
  }
}
