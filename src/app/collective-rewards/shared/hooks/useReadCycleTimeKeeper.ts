import { CycleTimeKeeperAbi } from '@/lib/abis/v2/CycleTimeKeeperAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { UseReadContractParameters } from 'wagmi'
import {
  CurriedContractConfig,
  useReadContractGeneric,
  ViewPureFunctionNames,
} from '../../../../lib/useReadContractGeneric'

type CycleTimeKeeperFunctionName = ViewPureFunctionNames<typeof CycleTimeKeeperAbi>

type CycleTimeKeeperConfig<TFunctionName extends CycleTimeKeeperFunctionName> = CurriedContractConfig<
  typeof CycleTimeKeeperAbi,
  TFunctionName
>

export const useReadCycleTimeKeeper = <TFunctionName extends CycleTimeKeeperFunctionName>(
  config: CycleTimeKeeperConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<typeof CycleTimeKeeperAbi, TFunctionName>['query'], 'select'>,
) => {
  return useReadContractGeneric(
    {
      ...(config as any),
      abi: CycleTimeKeeperAbi,
      address: BackersManagerAddress,
    },
    query,
  )
}
