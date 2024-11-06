import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useMemo } from 'react'
import { AbiFunction } from 'viem'

type FunctionEntry = Extract<(typeof GaugeAbi)[number], AbiFunction>
type FunctionName = Extract<
  FunctionEntry['name'],
  'earned' | 'claimedBackerRewards' | 'estimatedBackerRewards'
>

export const useGetBackerRewards = (
  backer: Address,
  rewardToken: Address,
  gauges: Address[],
  functionName: FunctionName,
) => {
  const contractCalls = gauges.map(gauge => {
    return {
      address: gauge,
      abi: GaugeAbi,
      functionName,
      args: [rewardToken, backer],
    } as const
  })

  const {
    data: contractResults,
    isLoading,
    error,
  } = useReadContracts<bigint[]>({
    contracts: contractCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const gaugesMap = useMemo(
    () =>
      gauges.reduce<Record<Address, bigint>>((acc, gauge, index) => {
        if (!contractResults) {
          return {} as Record<Address, bigint>
        }

        const earned = (contractResults[index].result as bigint) || BigInt(0)
        acc[gauge] = earned

        return acc
      }, {}),
    [gauges, contractResults],
  )

  return {
    data: gaugesMap,
    isLoading,
    error,
  }
}
