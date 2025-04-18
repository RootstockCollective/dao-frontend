import { type BackersManagerAbi, getAbi } from '@/lib/abis/v2'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useReadContract, UseReadContractParameters, UseReadContractReturnType } from 'wagmi'
import { UseReadContractConfig, ViewPureFunctionName } from '../types'

type BackersManagerFunctionName = ViewPureFunctionName<BackersManagerAbi>

type BackersManagerConfig<TFunctionName extends BackersManagerFunctionName> = UseReadContractConfig<
  BackersManagerAbi,
  TFunctionName
>

export const useReadBackersManager = <TFunctionName extends BackersManagerFunctionName>(
  config: BackersManagerConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<BackersManagerAbi, TFunctionName>['query'], 'select'>,
): UseReadContractReturnType<BackersManagerAbi, TFunctionName> => {
  return useReadContract({
    abi: getAbi('BackersManagerAbi'),
    address: BackersManagerAddress,
    ...(config as any),
    query: {
      retry: true,
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })
}
