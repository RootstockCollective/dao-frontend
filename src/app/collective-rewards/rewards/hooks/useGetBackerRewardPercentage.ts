import { BuilderRewardPercentage, getPercentageData } from '@/app/collective-rewards/rewards/utils'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetBackerRewardPercentage = (builder: Address, timestampInSeconds?: number) => {
  const [rewardPercentageData, setRewardPercentageData] = useState<BuilderRewardPercentage>()
  const { data, isLoading, error } = useReadContract({
    address: BackersManagerAddress,
    abi: BackersManagerAbi,
    functionName: 'backerRewardPercentage',
    args: [builder],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  useEffect(() => {
    if (!data) return

    const [previous, next, cooldownEndTime] = data

    const percentageData = getPercentageData(previous, next, cooldownEndTime, timestampInSeconds)

    setRewardPercentageData(percentageData)
  }, [data, timestampInSeconds])

  return {
    data: rewardPercentageData,
    isLoading,
    error,
  }
}
