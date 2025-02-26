import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BuilderRegistryAddress } from '@/lib/contracts'
import { UseReadContractParameters } from 'wagmi'
import {
  CurriedContractConfig,
  useReadContractGeneric,
  ViewPureFunctionNames,
} from '../../../../lib/useReadContractGeneric'

type BuilderRegistryFunctionName = ViewPureFunctionNames<typeof BuilderRegistryAbi>

type BuilderRegistryConfig<TFunctionName extends BuilderRegistryFunctionName> = CurriedContractConfig<
  typeof BuilderRegistryAbi,
  TFunctionName
>

export const useReadBuilderRegistry = <TFunctionName extends BuilderRegistryFunctionName>(
  config: BuilderRegistryConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<typeof BuilderRegistryAbi, TFunctionName>['query'], 'select'>,
) => {
  return useReadContractGeneric(
    {
      ...(config as any),
      abi: BuilderRegistryAbi,
      address: BuilderRegistryAddress,
    },
    query,
  )
}
