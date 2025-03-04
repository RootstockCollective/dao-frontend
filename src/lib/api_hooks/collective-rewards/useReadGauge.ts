import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { Abi, Address } from 'viem'
import { UseReadContractParameters, useReadContracts } from 'wagmi'
import { CurriedContractConfig, ViewPureFunctionNames } from '../contract_hooks'

type GaugeFunctionName = ViewPureFunctionNames<typeof GaugeAbi>

export type ReadGaugesConfig<TAbi extends Abi, TFunctionName extends ViewPureFunctionNames<TAbi>> = {
  gauges: Address[]
} & CurriedContractConfig<TAbi, TFunctionName>

export const useReadGauges = <TFunctionName extends GaugeFunctionName>(
  config: ReadGaugesConfig<typeof GaugeAbi, TFunctionName>,
  query?: Omit<UseReadContractParameters<typeof GaugeAbi, TFunctionName>['query'], 'select'>,
) => {
  return useReadContracts({
    abi: GaugeAbi,
    ...(config as any),
    query,
  })
}
