import { useGetGaugesLength } from '@/app/collective-rewards/user'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BuilderRegistryAddress } from '@/lib/contracts'
import { useMemo } from 'react'
import { AbiFunction, Address } from 'viem'
import { useAccount, useReadContracts } from 'wagmi'

const gaugeTypeOptions = ['active', 'halted'] as const
export type GaugeType = (typeof gaugeTypeOptions)[number]

type FunctionEntry = Extract<(typeof BuilderRegistryAbi)[number], AbiFunction>
type FunctionName = Extract<FunctionEntry['name'], 'getGaugeAt' | 'getHaltedGaugeAt'>

const gaugeType: Record<GaugeType, FunctionName> = {
  active: 'getGaugeAt',
  halted: 'getHaltedGaugeAt',
}

export const useGetGaugesArray = () => {
  const { address } = useAccount()
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
      enabled: !!address && !!contractCalls.length,
    },
  })

  const gauges = useMemo(() => gaugesAddress?.map(gauge => gauge.result as Address), [gaugesAddress])
  const isLoading = isLoadingActive || isLoadingHalted || gaugesAddressLoading
  const error = errorActive ?? errorHalted ?? gaugesAddressError

  return {
    data: gauges,
    isLoading,
    error,
  }
}

export const useGetGaugesArrayByType = (type: GaugeType) => {
  const { address } = useAccount()
  const {
    data: calls,
    isLoading: contractCallsLoading,
    error: contractCallsError,
  } = useGetContractCalls(type)

  const {
    data: gaugesAddress,
    isLoading: gaugesAddressLoading,
    error: gaugesAddressError,
  } = useReadContracts<Address[]>({
    contracts: calls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      enabled: !!address && !!calls.length,
    },
  })

  const gauges = useMemo(() => gaugesAddress?.map(gauge => gauge.result as Address), [gaugesAddress])
  const isLoading = contractCallsLoading || gaugesAddressLoading
  const error = contractCallsError ?? gaugesAddressError

  return {
    data: gauges,
    isLoading: isLoading || gaugesAddressLoading,
    error: error ?? gaugesAddressError,
  }
}

const useGetContractCalls = (type: GaugeType) => {
  const { data: gaugesLength, isLoading, error } = useGetGaugesLength(type)

  const length = Number(gaugesLength) ?? 0

  const data = Array.from({ length }, (_, index) => {
    return {
      address: BuilderRegistryAddress,
      abi: BuilderRegistryAbi,
      functionName: gaugeType[type],
      args: [index],
    } as const
  })

  return { data, isLoading, error }
}
