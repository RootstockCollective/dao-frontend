import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BuilderRegistryAddress } from '@/lib/contracts'
import { useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { useMemo } from 'react'
import { AbiFunction, Address } from 'viem'
import { useReadContracts } from 'wagmi'

const gaugeTypeOptions = ['active', 'halted'] as const
export type GaugeType = (typeof gaugeTypeOptions)[number]

type FunctionEntry = Extract<(typeof BuilderRegistryAbi)[number], AbiFunction>
type GetAtFunctionName = Extract<FunctionEntry['name'], 'getGaugeAt' | 'getHaltedGaugeAt'>

const getAtFunction: Record<GaugeType, GetAtFunctionName> = {
  active: 'getGaugeAt',
  halted: 'getHaltedGaugeAt',
}
type GetLengthFunctionName = Extract<FunctionEntry['name'], 'getGaugesLength' | 'getHaltedGaugesLength'>

const getLengthFunction: Record<GaugeType, GetLengthFunctionName> = {
  active: 'getGaugesLength',
  halted: 'getHaltedGaugesLength',
}

export const useGetGaugesArray = () => {
  const { data: activeCalls, isLoading: isLoadingActive, error: errorActive } = useGetContractCalls('active')
  const { data: haltedCalls, isLoading: isLoadingHalted, error: errorHalted } = useGetContractCalls('halted')

  const contractCalls = [...activeCalls, ...haltedCalls]

  const {
    data: gaugesAddress,
    isLoading: gaugesAddressLoading,
    error: gaugesAddressError,
  } = useReadContracts<Address[]>({
    contracts: contractCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const gauges = useMemo(() => gaugesAddress?.map(gauge => gauge.result as Address) ?? [], [gaugesAddress])
  const isLoading = isLoadingActive || isLoadingHalted || gaugesAddressLoading
  const error = errorActive ?? errorHalted ?? gaugesAddressError

  return {
    data: gauges,
    isLoading,
    error,
  }
}

const useGetContractCalls = (type: GaugeType) => {
  const {
    data: gaugesLength,
    isLoading,
    error,
  } = useReadBuilderRegistry({
    functionName: getLengthFunction[type],
  })

  const length = Number(gaugesLength) ?? 0

  const data = Array.from({ length }, (_, index) => {
    return {
      address: BuilderRegistryAddress,
      abi: BuilderRegistryAbi,
      functionName: getAtFunction[type],
      args: [index],
    } as const
  })

  return { data, isLoading, error }
}
