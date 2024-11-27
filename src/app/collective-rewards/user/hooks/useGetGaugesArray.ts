import { useReadContracts } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { AbiFunction, Address } from 'viem'
import { useGetGaugesLength } from '@/app/collective-rewards/user'
import { useMemo } from 'react'

const gaugeTypeOptions = ['active', 'halted'] as const
export type GaugeType = (typeof gaugeTypeOptions)[number]

type FunctionEntry = Extract<(typeof BuilderRegistryAbi)[number], AbiFunction>
type FunctionName = Extract<FunctionEntry['name'], 'getGaugeAt' | 'getHaltedGaugeAt'>

const gaugeType: Record<GaugeType, FunctionName> = {
  active: 'getGaugeAt',
  halted: 'getHaltedGaugeAt',
}

export const useGetGaugesArray = (type?: GaugeType) => {
  const { data: activeCalls, isLoading: isLoadingActive, error: errorActive } = useGetContractCalls('active')
  const { data: haltedCalls, isLoading: isLoadingHalted, error: errorHalted } = useGetContractCalls('halted')

  const contractCalls = useMemo(() => {
    if (!type) {
      return [...(activeCalls || []), ...(haltedCalls || [])]
    } else if (type === 'active') {
      return activeCalls || []
    } else {
      return haltedCalls || []
    }
  }, [type, activeCalls, haltedCalls])

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

  const gauges = useMemo(() => gaugesAddress?.map(gauge => gauge.result as Address), [gaugesAddress])
  const isLoading = isLoadingActive || isLoadingHalted || gaugesAddressLoading
  const error = errorActive ?? errorHalted ?? gaugesAddressError

  return {
    data: gauges,
    isLoading,
    error,
  }
}

const useGetContractCalls = (type: GaugeType) => {
  const { data: gaugesLength, isLoading, error } = useGetGaugesLength(type)

  const length = Number(gaugesLength) ?? 0

  const data = Array.from({ length }, (_, index) => {
    return {
      address: BackersManagerAddress,
      abi: BuilderRegistryAbi,
      functionName: gaugeType[type],
      args: [index],
    } as const
  })

  return { data, isLoading, error }
}
