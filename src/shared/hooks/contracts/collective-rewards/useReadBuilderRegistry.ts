import { type BuilderRegistryAbi, getAbi } from '@/lib/abis/v2'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BuilderRegistryAddress } from '@/lib/contracts'
import { useReadContract, UseReadContractParameters, UseReadContractReturnType } from 'wagmi'
import { UseReadContractConfig, ViewPureFunctionName } from '../types'

type BuilderRegistryFunctionName = ViewPureFunctionName<BuilderRegistryAbi>

type BuilderRegistryConfig<TFunctionName extends BuilderRegistryFunctionName> = UseReadContractConfig<
  BuilderRegistryAbi,
  TFunctionName
>

export const useReadBuilderRegistry = <TFunctionName extends BuilderRegistryFunctionName>(
  config: BuilderRegistryConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<BuilderRegistryAbi, TFunctionName>['query'], 'select'>,
): UseReadContractReturnType<BuilderRegistryAbi, TFunctionName> => {
  return useReadContract({
    abi: getAbi('BuilderRegistryAbi'),
    address: BuilderRegistryAddress,
    ...(config as any),
    query: {
      retry: true,
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })
}
