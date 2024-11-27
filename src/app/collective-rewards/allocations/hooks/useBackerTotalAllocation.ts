import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useMemo } from 'react'
import { Address, zeroAddress } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'
import { Builder } from '../../types'

export const useBackerTotalAllocation = (backer?: Address) => {
  const { data, isLoading, error } = useReadContract({
    abi: BackersManagerAbi,
    address: BackersManagerAddress,
    functionName: 'backerTotalAllocation',
    args: [backer ?? zeroAddress],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      initialData: 0n,
      enabled: !!backer,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}

export const useGetAllAllocationOf = (builder: Builder[], backer?: Address) => {
  const {
    data: gauges,
    isLoading,
    error,
  } = useReadContracts({
    contracts: builder.map(({ gauge }) => ({
      abi: GaugeAbi,
      address: gauge,
      functionName: 'allocationOf',
      args: [backer],
    })),
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      enabled: !!backer,
    },
  })

  const data = useMemo(() => gauges?.map(({ result }) => result as bigint), [gauges])

  return {
    data,
    isLoading,
    error,
  }
}
