import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useMemo } from 'react'
import { Address, parseEther } from 'viem'
import { useReadContracts } from 'wagmi'

export interface BuilderRewardPercentage {
  current: number
  next: number
  cooldownEndTime: bigint
}

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
        .map(([previous, next, cooldownEndTime]) => {
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
          return percentageData
        }),
    [rewardSharesResult],
  )

  return {
    data: rewardPercentage,
    isLoading,
    error,
  }
}
