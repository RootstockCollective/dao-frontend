import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { useReadContract, UseReadContractParameters } from 'wagmi'
import { CurriedContractConfig, ViewPureFunctionNames } from '../contract_hooks'

type BackersManagerFunctionName = ViewPureFunctionNames<typeof BackersManagerAbi>

type BackersManagerConfig<TFunctionName extends BackersManagerFunctionName> = CurriedContractConfig<
  typeof BackersManagerAbi,
  TFunctionName
>

export const useReadBackersManager = <TFunctionName extends BackersManagerFunctionName>(
  config: BackersManagerConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<typeof BackersManagerAbi, TFunctionName>['query'], 'select'>,
) => {
  return useReadContract({
    abi: BackersManagerAbi,
    address: BackersManagerAddress,
    ...(config as any),
    query,
  })
}

useReadBackersManager({ functionName: 'cycleStart', args: [0n] })
