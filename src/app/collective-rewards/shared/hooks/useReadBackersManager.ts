import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { UseReadContractParameters } from 'wagmi'
import {
  CurriedContractConfig,
  useReadContractGeneric,
  ViewPureFunctionNames,
} from '../../../../lib/useReadContractGeneric'

type BackersManagerFunctionName = ViewPureFunctionNames<typeof BackersManagerAbi>

type BackersManagerConfig<TFunctionName extends BackersManagerFunctionName> = CurriedContractConfig<
  typeof BackersManagerAbi,
  TFunctionName
>

export const useReadBackersManager = <TFunctionName extends BackersManagerFunctionName>(
  config: BackersManagerConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<typeof BackersManagerAbi, TFunctionName>['query'], 'select'>,
) => {
  return useReadContractGeneric(
    {
      ...(config as any),
      abi: BackersManagerAbi,
      address: BackersManagerAddress,
    },
    query,
  )
}
