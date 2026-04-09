import { useMemo } from 'react'
import { UseReadContractReturnType, useReadContracts } from 'wagmi'

import { getAbi, type RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'

import { UseReadContractForMultipleArgsConfig, ViewPureFunctionName } from '../types'
import { QueryOverrides } from './types'

type RbtcAsyncVaultFunctionName = ViewPureFunctionName<RBTCAsyncVaultAbi>

type ReadRbtcVaultForMultipleArgsConfig<TFunctionName extends RbtcAsyncVaultFunctionName> =
  UseReadContractForMultipleArgsConfig<RBTCAsyncVaultAbi, TFunctionName>

type ReadRbtcVaultReturnType<
  TAbi extends RBTCAsyncVaultAbi,
  TFunctionName extends ViewPureFunctionName<TAbi>,
> = UseReadContractReturnType<TAbi, TFunctionName>['data']

export const useReadRbtcVaultForMultipleArgs = <TFunctionName extends RbtcAsyncVaultFunctionName>(
  { args, ...config }: ReadRbtcVaultForMultipleArgsConfig<TFunctionName>,
  query?: QueryOverrides,
) => {
  const { data: results, ...queryData } = useReadContracts({
    contracts: args.map(argsPerCall => ({
      abi: getAbi('RBTCAsyncVaultAbi'),
      address: rbtcVault.address,
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

  type ReturnType = ReadRbtcVaultReturnType<RBTCAsyncVaultAbi, TFunctionName>

  const data = useMemo(
    () =>
      results?.reduce<ReturnType[]>((acc, { result, error, status }, i) => {
        if (status !== 'success' || error) {
          console.error(
            `Call index: ${i}: data fetch not successful for RbtcAsyncVault.${config.functionName}.`,
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
