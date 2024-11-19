import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useMemo } from 'react'
import { AbiFunction } from 'viem'

type FunctionEntry = Extract<(typeof GaugeAbi)[number], AbiFunction>
type FunctionName = Extract<
  FunctionEntry['name'],
  'earned' | 'claimedBackerRewards' | 'estimatedBackerRewards' | 'totalAllocation'
>
type FunctionParams = FunctionEntry['inputs']

//TODO: Add the correct return type
export const useGaugesGetFunction = <FunctionResult>(
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
  } = useReadContracts<bigint[]>({
    contracts: contractCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const gaugesMap = useMemo(
    () =>
      gauges.reduce<Record<Address, FunctionResult>>((acc, gauge, index) => {
        if (!contractResults) {
          return {} as Record<Address, FunctionResult>
        }

        if (contractResults[index].error) {
          throw contractResults[index].error
        }

        const result = contractResults[index].result as FunctionResult
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
