import { Abi, Address, ContractFunctionArgs, ContractFunctionName } from 'viem'

export type ViewPureFunctionName<TAbi extends Abi> = ContractFunctionName<TAbi, 'view' | 'pure'>

export type FunctionParams<
  TAbi extends Abi,
  TFunctionName extends ViewPureFunctionName<TAbi>,
> = ContractFunctionArgs<TAbi, 'view' | 'pure', TFunctionName>

export type UseReadContractConfig<TAbi extends Abi, TFunctionName extends ViewPureFunctionName<TAbi>> =
  FunctionParams<TAbi, TFunctionName> extends never | readonly []
    ? {
        functionName: TFunctionName
      }
    : {
        functionName: TFunctionName
        args: FunctionParams<TAbi, TFunctionName>
      }

export type UseReadContractsConfig<TAbi extends Abi, TFunctionName extends ViewPureFunctionName<TAbi>> =
  FunctionParams<TAbi, TFunctionName> extends never | readonly []
    ? {
        functionName: TFunctionName
        addresses: Address[]
      }
    :
        | {
            functionName: TFunctionName
            args: FunctionParams<TAbi, TFunctionName>
            addresses: Address[]
          }
        | {
            functionName: TFunctionName
            argsPerCall: Array<FunctionParams<TAbi, TFunctionName>>
            addresses: Address[]
          }

export type UseReadContractForMultipleArgsConfig<
  TAbi extends Abi,
  TFunctionName extends ViewPureFunctionName<TAbi>,
> = {
  functionName: TFunctionName
  args: Array<FunctionParams<TAbi, TFunctionName>>
}
