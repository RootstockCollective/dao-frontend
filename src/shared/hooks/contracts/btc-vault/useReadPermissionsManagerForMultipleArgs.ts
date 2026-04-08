import { useMemo } from 'react'
import { UseReadContractReturnType, useReadContracts } from 'wagmi'

import { getAbi, type PermissionsManagerAbi } from '@/lib/abis/btc-vault'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { permissionsManager } from '@/lib/contracts'

import { UseReadContractForMultipleArgsConfig, ViewPureFunctionName } from '../types'
import { QueryOverrides } from './types'

type PermissionsManagerFunctionName = ViewPureFunctionName<PermissionsManagerAbi>

type ReadPermissionsManagerForMultipleArgsConfig<TFunctionName extends PermissionsManagerFunctionName> =
  UseReadContractForMultipleArgsConfig<PermissionsManagerAbi, TFunctionName>

type ReadPermissionsManagerReturnType<
  TAbi extends PermissionsManagerAbi,
  TFunctionName extends ViewPureFunctionName<TAbi>,
> = UseReadContractReturnType<TAbi, TFunctionName>['data']

export const useReadPermissionsManagerForMultipleArgs = <
  TFunctionName extends PermissionsManagerFunctionName,
>(
  { args, ...config }: ReadPermissionsManagerForMultipleArgsConfig<TFunctionName>,
  query?: QueryOverrides,
) => {
  const { data: results, ...queryData } = useReadContracts({
    contracts: args.map(argsPerCall => ({
      abi: getAbi('PermissionsManagerAbi'),
      address: permissionsManager.address,
      args: argsPerCall,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(config as any),
    })),
    query: {
      retry: true,
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })

  type ReturnType = ReadPermissionsManagerReturnType<PermissionsManagerAbi, TFunctionName>

  const data = useMemo(
    () =>
      results?.reduce<ReturnType[]>((acc, { result, error, status }, i) => {
        if (status !== 'success' || error) {
          console.error(
            `Call index: ${i}: data fetch not successful for PermissionsManager.${config.functionName}.`,
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
