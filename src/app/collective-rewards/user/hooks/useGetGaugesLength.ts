import { useReadContract } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { AbiFunction } from 'viem'
import { GaugeType } from '@/app/collective-rewards/user'
import { useEnvironmentsContext } from '@/shared/context/EnvironmentsContext'

type FunctionEntry = Extract<(typeof BuilderRegistryAbi)[number], AbiFunction>
type FunctionName = Extract<FunctionEntry['name'], 'getGaugesLength' | 'getHaltedGaugesLength'>

const gaugeType: Record<GaugeType, FunctionName> = {
  active: 'getGaugesLength',
  halted: 'getHaltedGaugesLength',
}

export const useGetGaugesLength = (type: GaugeType) => {
  const { builderRegistryAddress } = useEnvironmentsContext()

  const { data, isLoading, error } = useReadContract({
    address: builderRegistryAddress,
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
