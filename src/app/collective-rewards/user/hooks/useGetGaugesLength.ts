import { useReadContract } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { AbiFunction } from 'viem'
import { GaugeType } from '@/app/collective-rewards/user'

type FunctionEntry = Extract<(typeof BuilderRegistryAbi)[number], AbiFunction>
type FunctionName = Extract<FunctionEntry['name'], 'getGaugesLength' | 'getHaltedGaugesLength'>

const gaugeType: Record<GaugeType, FunctionName> = {
  active: 'getGaugesLength',
  halted: 'getHaltedGaugesLength',
}

export const useGetGaugesLength = (type: GaugeType) => {
  const { data, isLoading, error } = useReadContract({
    address: BackersManagerAddress,
    abi: BuilderRegistryAbi,
    functionName: gaugeType[type],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}