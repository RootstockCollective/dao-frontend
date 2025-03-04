import { CycleTimeKeeperAbi } from '@/lib/abis/v2/CycleTimeKeeperAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { useReadContract, UseReadContractParameters } from 'wagmi'
import { CurriedContractConfig, ViewPureFunctionNames } from '../contract_hooks'

type CycleTimeKeeperFunctionName = ViewPureFunctionNames<typeof CycleTimeKeeperAbi>

type CycleTimeKeeperConfig<TFunctionName extends CycleTimeKeeperFunctionName> = CurriedContractConfig<
  typeof CycleTimeKeeperAbi,
  TFunctionName
>

export const useReadCycleTimeKeeper = <TFunctionName extends CycleTimeKeeperFunctionName>(
  config: CycleTimeKeeperConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<typeof CycleTimeKeeperAbi, TFunctionName>['query'], 'select'>,
) => {
  return useReadContract({
    abi: CycleTimeKeeperAbi,
    address: BackersManagerAddress,
    ...(config as any),
    query,
  })
}
