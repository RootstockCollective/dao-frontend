import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BuilderRegistryAddress } from '@/lib/contracts'
import { useReadContract, UseReadContractParameters } from 'wagmi'
import { CurriedContractConfig, ViewPureFunctionNames } from '../contract_hooks'

type BuilderRegistryFunctionName = ViewPureFunctionNames<typeof BuilderRegistryAbi>

type BuilderRegistryConfig<TFunctionName extends BuilderRegistryFunctionName> = CurriedContractConfig<
  typeof BuilderRegistryAbi,
  TFunctionName
>

export const useReadBuilderRegistry = <TFunctionName extends BuilderRegistryFunctionName>(
  config: BuilderRegistryConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<typeof BuilderRegistryAbi, TFunctionName>['query'], 'select'>,
) => {
  return useReadContract({
    abi: BuilderRegistryAbi,
    address: BuilderRegistryAddress,
    ...(config as any),
    query,
  })
}
