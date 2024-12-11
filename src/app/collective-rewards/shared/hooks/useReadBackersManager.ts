import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { AbiFunction, ContractFunctionArgs } from 'viem'
import { useReadContract, UseReadContractParameters, UseReadContractReturnType } from 'wagmi'

// TODO: add type narrowing to return only the type related to the functionName
type FunctionEntry = Extract<(typeof BackersManagerAbi)[number], AbiFunction>
type ViewFunctionEntry = Extract<
  FunctionEntry,
  {
    stateMutability: 'view'
  }
>
type BackersManagerViewFunction = Exclude<ViewFunctionEntry['name'], 'UPGRADE_INTERFACE_VERSION'>
type FunctionParams<Name extends ViewFunctionEntry['name'] = BackersManagerViewFunction> =
  ContractFunctionArgs<typeof BackersManagerAbi, 'view', Name>

type UseReadBackersManager<Name extends ViewFunctionEntry['name'] = BackersManagerViewFunction> =
  UseReadContractReturnType<typeof BackersManagerAbi, Name>

export const useReadBackersManager = (
  functionName: BackersManagerViewFunction,
  functionParams?: FunctionParams<BackersManagerViewFunction>,
  query?: UseReadContractParameters<typeof BackersManagerAbi, BackersManagerViewFunction>['query'],
): UseReadBackersManager<BackersManagerViewFunction> => {
  return useReadContract({
    functionName,
    abi: BackersManagerAbi,
    address: BackersManagerAddress,
    args: functionParams,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })
}
