import { GaugeAbi, getAbi } from '@/lib/abis/v2'
import { UseReadContractParameters, UseReadContractReturnType, useReadContract } from 'wagmi'
import { UseReadContractWithAddressConfig, ViewPureFunctionName } from '../types'

type GaugeFunctionName = ViewPureFunctionName<GaugeAbi>

type GaugeConfig<TFunctionName extends GaugeFunctionName> = UseReadContractWithAddressConfig<
  GaugeAbi,
  TFunctionName
>

export const useReadGauge = <TFunctionName extends GaugeFunctionName>(
  { address, ...config }: GaugeConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<GaugeAbi, TFunctionName>['query'], 'select'>,
): UseReadContractReturnType<GaugeAbi, TFunctionName> => {
  return useReadContract({
    abi: getAbi('GaugeAbi'),
    address,
    ...(config as any),
    query: {
      retry: true,
      refetchInterval: false,
      ...query,
    },
  })
}
