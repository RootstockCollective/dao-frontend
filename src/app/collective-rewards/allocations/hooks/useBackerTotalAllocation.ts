import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'

export const useBackerTotalAllocation = (backer: Address) => {
  const { data, isLoading, error } = useReadContract({
    abi: BackersManagerAbi,
    address: BackersManagerAddress,
    functionName: 'backerTotalAllocation',
    args: [backer],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      initialData: 0n,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}

export const useGetAllAllocationOf = (backer: Address, gaugeAddresses: Address[]) => {
  const {
    data: gauges,
    isLoading,
    error,
  } = useReadContracts({
    contracts: gaugeAddresses.map(gaugeAddress => ({
      abi: GaugeAbi,
      address: gaugeAddress,
      functionName: 'allocationOf',
      args: [backer],
    })),
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const data = useMemo(() => gauges?.map(({ result }) => result as bigint), [gauges])

  return {
    data,
    isLoading,
    error,
  }
}