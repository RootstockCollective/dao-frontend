import { Abi, Address, ContractFunctionArgs, ContractFunctionName } from 'viem'

export type ViewPureFunctionName<TAbi extends Abi> = ContractFunctionName<TAbi, 'view' | 'pure'>

type FunctionParams<
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

/**
 * Config for calling one function across many addresses. The same `args` are used for every
 * address; use `UseReadContractForMultipleArgsConfig` when the args vary per call.
 */
export type UseReadContractsConfig<TAbi extends Abi, TFunctionName extends ViewPureFunctionName<TAbi>> =
  FunctionParams<TAbi, TFunctionName> extends never | readonly []
    ? {
        functionName: TFunctionName
        addresses: Address[]
      }
    : {
        functionName: TFunctionName
        args: FunctionParams<TAbi, TFunctionName>
        addresses: Address[]
      }

export interface UseReadContractForMultipleArgsConfig<
  TAbi extends Abi,
  TFunctionName extends ViewPureFunctionName<TAbi>,
> {
  functionName: TFunctionName
  args: Array<FunctionParams<TAbi, TFunctionName>>
}

export type UseReadContractWithAddressConfig<
  TAbi extends Abi,
  TFunctionName extends ViewPureFunctionName<TAbi>,
> =
  FunctionParams<TAbi, TFunctionName> extends never | readonly []
    ? {
        address: Address
        functionName: TFunctionName
      }
    : {
        address: Address
        functionName: TFunctionName
        args: FunctionParams<TAbi, TFunctionName>
      }
