import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { Abi } from 'viem'
import { UseReadContractParameters } from 'wagmi'
import {
  FunctionParams,
  useReadContractGeneric,
  ViewPureFunctionNames,
} from '../../../../lib/useReadContractGeneric'

type GaugeFunctionName = ViewPureFunctionNames<typeof GaugeAbi>

export type ContractConfig<TAbi extends Abi, TFunctionName extends ViewPureFunctionNames<TAbi>> =
  FunctionParams<TAbi, TFunctionName> extends never
    ? {
        address: `0x${string}`
        functionName: TFunctionName
      }
    : {
        address: `0x${string}`
        functionName: TFunctionName
        args: FunctionParams<TAbi, TFunctionName>
      }
type GaugeConfig<TFunctionName extends GaugeFunctionName> = ContractConfig<typeof GaugeAbi, TFunctionName>

export const useReadGauge = <TFunctionName extends GaugeFunctionName>(
  config: GaugeConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<typeof GaugeAbi, TFunctionName>['query'], 'select'>,
) => {
  return useReadContractGeneric(
    {
      ...(config as any),
      abi: GaugeAbi,
    },
    query,
  )
}
