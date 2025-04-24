import { type CycleTimeKeeperAbi, getAbi } from '@/lib/abis/v2'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useReadContract, UseReadContractParameters, UseReadContractReturnType } from 'wagmi'
import { UseReadContractConfig, ViewPureFunctionName } from '../types'

type CycleTimeKeeperFunctionName = ViewPureFunctionName<CycleTimeKeeperAbi>

type CycleTimeKeeperConfig<TFunctionName extends CycleTimeKeeperFunctionName> = UseReadContractConfig<
  CycleTimeKeeperAbi,
  TFunctionName
>

export const useReadCycleTimeKeeper = <TFunctionName extends CycleTimeKeeperFunctionName>(
  config: CycleTimeKeeperConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<CycleTimeKeeperAbi, TFunctionName>['query'], 'select'>,
): UseReadContractReturnType<CycleTimeKeeperAbi, TFunctionName> => {
  return useReadContract({
    abi: getAbi('CycleTimeKeeperAbi'),
    address: BackersManagerAddress,
    ...(config as any),
    query: {
      retry: true,
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })
}
