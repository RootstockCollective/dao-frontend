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
  const contracts = useMemo(
    () =>
      addresses.map(address => ({
        abi,
        address,
        ...(config as any),
      })),
    [addresses, config],
  )
  const { data: results, ...queryData } = useReadContracts({
    contracts,
    query: {
      retry: true,
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
      enabled: !!contracts.length,
    },
  })

  type ReturnType = ReadGaugesReturnType<GaugeAbi, TFunctionName>

  const data = useMemo(
    () =>
      results?.reduce<ReturnType[]>((acc, { result, error, status }, i) => {
        if (status !== 'success' || error) {
          console.error(
            `Call index: ${i}: data fetch not successful for Gauge(${addresses[i]}).${config.functionName}.`,
            error ? error : 'Unknown error',
          )
        }

        return [...acc, result as ReturnType]
      }, []) ?? [],
    [addresses, results, config.functionName],
  )

  return {
    data,
    ...queryData,
  }
}
