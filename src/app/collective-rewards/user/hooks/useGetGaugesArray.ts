import { useReadContracts } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { AbiFunction, Address } from 'viem'
import { useGetGaugesLength } from '@/app/collective-rewards/user'

const gaugeTypeOptions = ['active', 'halted'] as const
export type GaugeType = (typeof gaugeTypeOptions)[number]

type FunctionEntry = Extract<(typeof BuilderRegistryAbi)[number], AbiFunction>
type FunctionName = Extract<FunctionEntry['name'], 'getGaugeAt' | 'getHaltedGaugeAt'>

const gaugeType: Record<GaugeType, FunctionName> = {
  active: 'getGaugeAt',
  halted: 'getHaltedGaugeAt',
}

export const useGetGaugesArray = (type: GaugeType) => {
  const {
    data: gaugesLength,
    isLoading: gaugesLengthLoading,
    error: gaugesLengthError,
  } = useGetGaugesLength(type)

  const length = Number(gaugesLength) ?? 0

  const contractCalls = Array.from({ length }, (_, index) => {
    return {
      address: BackersManagerAddress,
      abi: BuilderRegistryAbi,
      functionName: gaugeType[type],
      args: [index],
    } as const
  })

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

  const gauges = gaugesAddress?.map(gauge => gauge.result as Address)
  const isLoading = gaugesLengthLoading || gaugesAddressLoading
  const error = gaugesLengthError ?? gaugesAddressError

  return {
    data: gauges,
    isLoading,
    error,
  }
}
