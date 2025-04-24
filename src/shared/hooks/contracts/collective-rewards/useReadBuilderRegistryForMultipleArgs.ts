import { getAbi, type BuilderRegistryAbi } from '@/lib/abis/v2'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BuilderRegistryAddress } from '@/lib/contracts'
import { useMemo } from 'react'
import { UseReadContractParameters, UseReadContractReturnType, useReadContracts } from 'wagmi'
import { UseReadContractForMultipleArgsConfig, ViewPureFunctionName } from '../types'

type BuilderRegistryFunctionName = ViewPureFunctionName<BuilderRegistryAbi>

export type ReadBuilderRegistriesConfig<TFunctionName extends BuilderRegistryFunctionName> =
  UseReadContractForMultipleArgsConfig<BuilderRegistryAbi, TFunctionName>

export type ReadBuilderRegistriesReturnType<
  TAbi extends BuilderRegistryAbi,
  TFunctionName extends ViewPureFunctionName<TAbi>,
> = UseReadContractReturnType<TAbi, TFunctionName>['data']

const abi = getAbi('BuilderRegistryAbi')

export const useReadBuilderRegistryForMultipleArgs = <TFunctionName extends BuilderRegistryFunctionName>(
  { args, ...config }: ReadBuilderRegistriesConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<BuilderRegistryAbi, TFunctionName>['query'], 'select'>,
) => {
  const { data: results, ...queryData } = useReadContracts({
    contracts: args.map(argsPerCall => ({
      abi,
      address: BuilderRegistryAddress,
      args: argsPerCall,
      ...(config as any),
    })),
    query: {
      retry: true,
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })

  type ReturnType = ReadBuilderRegistriesReturnType<BuilderRegistryAbi, TFunctionName>

  const data = useMemo(
    () =>
      results?.reduce<ReturnType[]>((acc, { result, error, status }, i) => {
        if (status !== 'success' || error) {
          console.error(
            `Call index: ${i}: data fetch not successful for BuilderRegistry.${config.functionName}.`,
            error ? error : 'Unknown error',
          )
        }

        return [...acc, result as ReturnType]
      }, []) ?? [],
    [results, config.functionName],
  )
  return {
    data,
    ...queryData,
  }
}
