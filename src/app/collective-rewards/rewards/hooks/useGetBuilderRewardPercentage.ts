import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { BuilderRewardPercentage, getPercentageData } from '../utils/getPercentageData'

export const useGetBuilderRewardPercentage = (builder: Address) => {
  const [rewardPercentageData, setRewardPercentageData] = useState<BuilderRewardPercentage>()
  const { data, isLoading, error } = useReadContract({
    address: BackersManagerAddress,
    abi: BackersManagerAbi,
    functionName: 'builderRewardPercentage',
    args: [builder],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  useEffect(() => {
    if (!data) return

    const [previous, next, cooldownEndTime] = data

    const percentageData = getPercentageData(previous, next, cooldownEndTime)

    setRewardPercentageData(percentageData)
  }, [data])

  return {
    rewardPercentageData,
    isLoading,
    error,
  }
}
