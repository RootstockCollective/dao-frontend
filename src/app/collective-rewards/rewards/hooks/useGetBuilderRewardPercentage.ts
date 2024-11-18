import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useEffect, useState } from 'react'
import { Address, parseEther } from 'viem'
import { useReadContract } from 'wagmi'

interface BuilderRewardPercentage {
  current: number
  next: number
  cooldownEndTime: bigint
}

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

    const currentTimestamp = Math.floor(Date.now() / 1000)
    const previousPercentage = Number((previous * 100n) / parseEther('1'))
    const nextPercentage = Number((next * 100n) / parseEther('1'))
    let currentPercentage = currentTimestamp < cooldownEndTime ? previousPercentage : nextPercentage
    currentPercentage = Math.round(currentPercentage * 100) / 100

    const percentageData: BuilderRewardPercentage = {
      current: currentPercentage,
      next: nextPercentage,
      cooldownEndTime,
    }

    setRewardPercentageData(percentageData)
  }, [data])

  return {
    rewardPercentageData,
    isLoading,
    error,
  }
}
