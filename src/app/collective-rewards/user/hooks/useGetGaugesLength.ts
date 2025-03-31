import { GaugeType } from '@/app/collective-rewards/user'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BuilderRegistryAddress } from '@/lib/contracts'
import { AbiFunction } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

type FunctionEntry = Extract<(typeof BuilderRegistryAbi)[number], AbiFunction>
type FunctionName = Extract<FunctionEntry['name'], 'getGaugesLength' | 'getHaltedGaugesLength'>

const gaugeType: Record<GaugeType, FunctionName> = {
  active: 'getGaugesLength',
  halted: 'getHaltedGaugesLength',
}

export const useGetGaugesLength = (type: GaugeType) => {
  const { address } = useAccount()
  const { data, isLoading, error } = useReadContract({
    address: BuilderRegistryAddress,
    abi: BuilderRegistryAbi,
    functionName: gaugeType[type],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      enabled: !!address,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}
