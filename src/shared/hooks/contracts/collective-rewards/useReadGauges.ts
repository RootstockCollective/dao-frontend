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

export const useReadGauges = <TFunctionName extends GaugeFunctionName>(
  { addresses, ...config }: ReadGaugesConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<GaugeAbi, TFunctionName>['query'], 'select'>,
) => {
  const { data: results, ...queryData } = useReadContracts({
    contracts: addresses.map(address => ({
      abi: getAbi('GaugeAbi'),
      address,
      ...(config as any),
    })),
    query: {
      retry: true,
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })

  type ReturnType = ReadGaugesReturnType<GaugeAbi, TFunctionName>

  const data = useMemo(
    () =>
      results?.reduce<ReturnType[]>((acc, result) => {
        return [...acc, result.result as ReturnType]
      }, []) ?? [],
    [results],
  )

  return {
    data,
    ...queryData,
  }
}
