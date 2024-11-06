import { useReadContract, useReadContracts } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { Address } from 'viem'

export const useGetHaltedGaugesArray = () => {
  const {
    data: gaugesLength,
    isLoading: gaugesLengthLoading,
    error: gaugesLengthError,
  } = useReadContract({
    address: BackersManagerAddress,
    abi: BuilderRegistryAbi,
    functionName: 'getHaltedGaugesLength',
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const length = gaugesLength ? Number(gaugesLength) : 0

  const contractCalls = Array.from({ length }, (_, index) => {
    return {
      address: BackersManagerAddress,
      abi: BuilderRegistryAbi,
      functionName: 'getHaltedGaugeAt',
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
