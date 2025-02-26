import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { Abi, ContractFunctionArgs, ContractFunctionName } from 'viem'
import { useReadContract, UseReadContractParameters, UseReadContractReturnType } from 'wagmi'

export type ViewPureFunctionNames<TAbi extends Abi> = {
  [K in keyof TAbi]: TAbi[K] extends {
    type: 'function'
    stateMutability: 'view' | 'pure'
  }
    ? TAbi[K]['name']
    : never
}[keyof TAbi] &
  ContractFunctionName<TAbi, 'view' | 'pure'>

export type FunctionParams<
  TAbi extends Abi,
  TFunctionName extends ViewPureFunctionNames<TAbi>,
> = ContractFunctionArgs<TAbi, 'view' | 'pure', TFunctionName>

export type ContractConfig<TAbi extends Abi, TFunctionName extends ViewPureFunctionNames<TAbi>> =
  FunctionParams<TAbi, TFunctionName> extends never
    ? {
        abi: TAbi
        address: `0x${string}`
        functionName: TFunctionName
      }
    : {
        abi: TAbi
        address: `0x${string}`
        functionName: TFunctionName
        args: FunctionParams<TAbi, TFunctionName>
      }

export type CurriedContractConfig<TAbi extends Abi, TFunctionName extends ViewPureFunctionNames<TAbi>> =
  FunctionParams<TAbi, TFunctionName> extends never
    ? {
        functionName: TFunctionName
      }
    : {
        functionName: TFunctionName
        args: FunctionParams<TAbi, TFunctionName>
      }

export const useReadContractGeneric = <TAbi extends Abi, TFunctionName extends ViewPureFunctionNames<TAbi>>(
  { functionName, abi, address, ...config }: ContractConfig<TAbi, TFunctionName>,
  query?: Omit<UseReadContractParameters<TAbi, TFunctionName>['query'], 'select'>,
): UseReadContractReturnType<TAbi, TFunctionName> => {
  const params = {
    abi,
    address,
    functionName,
    args: 'args' in config ? config.args : undefined,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  }

  return useReadContract(params as UseReadContractParameters<TAbi, TFunctionName>)
}
