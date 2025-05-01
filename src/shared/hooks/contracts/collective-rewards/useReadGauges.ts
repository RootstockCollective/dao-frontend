import { getAbi, type GaugeAbi } from '@/lib/abis/v2'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { UseReadContractParameters, UseReadContractReturnType, useReadContracts } from 'wagmi'
import { UseReadContractsConfig, ViewPureFunctionName } from '../types'

type GaugeFunctionName = ViewPureFunctionName<GaugeAbi>

export type ReadGaugesConfig<TFunctionName extends GaugeFunctionName> = UseReadContractsConfig<
  GaugeAbi,
  TFunctionName
>

type ReadGaugesReturnType<
  TAbi extends Abi,
  TFunctionName extends ViewPureFunctionName<TAbi>,
> = UseReadContractReturnType<TAbi, TFunctionName>['data']

const abi = getAbi('GaugeAbi')

export const useReadGauges = <TFunctionName extends GaugeFunctionName>(
  { addresses, ...config }: ReadGaugesConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<GaugeAbi, TFunctionName>['query'], 'select'>,
) => {
  const { data: results, ...queryData } = useReadContracts({
    contracts: addresses.map(address => ({
      abi,
      address,
      ...(config as any),
    })),
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })

  type ReturnType = ReadGaugesReturnType<GaugeAbi, TFunctionName> | Error

  const data: ReturnType[] = useMemo(
    () =>
      results?.map(({ result, error }) => {
        return error ?? (result as ReturnType)
      }) ?? [],
    [results],
  )

  return {
    data,
    ...queryData,
  }
}
