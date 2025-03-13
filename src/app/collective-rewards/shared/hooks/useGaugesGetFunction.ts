import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { AbiStateMutability, Address, ContractFunctionArgs, ContractFunctionReturnType } from 'viem'
import { useReadContracts } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useMemo } from 'react'
import { AbiFunction } from 'viem'

//TODO: check the best approach to get the return type
type FunctionEntry = Extract<(typeof GaugeAbi)[number], AbiFunction>
type FunctionName = Extract<
  FunctionEntry['name'],
  | 'earned'
  | 'claimedBackerRewards'
  | 'estimatedBackerRewards'
  | 'totalAllocation'
  | 'rewardShares'
  | 'allocationOf'
  | 'rewardPerToken'
>
type FunctionParams = ContractFunctionArgs<typeof GaugeAbi, AbiStateMutability, FunctionName>
type FunctionResultType = ContractFunctionReturnType<typeof GaugeAbi, AbiStateMutability, FunctionName>
type FunctionReturnType<T extends FunctionName> = T extends
  | 'earned'
  | 'claimedBackerRewards'
  | 'estimatedBackerRewards'
  | 'totalAllocation'
  | 'rewardShares'
  | 'allocationOf'
  | 'rewardPerToken'
  ? bigint
  : never
type InferFunctionReturnType<T extends FunctionName> = FunctionReturnType<T>

export const useGaugesGetFunction = (
  gauges: Address[],
  functionName: FunctionName,
  functionParams?: FunctionParams,
) => {
  const contractCalls = gauges.map(gauge => {
    return {
      address: gauge,
      abi: GaugeAbi,
      functionName,
      args: functionParams,
    } as const
  })

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

  type ReturnType = InferFunctionReturnType<typeof functionName>
  const gaugesMap = useMemo(
    () =>
      gauges.reduce<Record<Address, ReturnType>>((acc, gauge, index) => {
        if (!contractResults) {
          return {} as Record<Address, ReturnType>
        }

        const result = contractResults[index].result as ReturnType
        acc[gauge] = result

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
