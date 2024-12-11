import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { getBackerRewardPercentage } from '../utils'

export const useGetBackerRewardPercentage = (builder: Address, timestampInSeconds?: number) => {
  const { data, isLoading, error } = useReadContract({
    address: BackersManagerAddress,
    abi: BackersManagerAbi,
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
