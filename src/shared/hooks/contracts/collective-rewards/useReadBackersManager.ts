import { type BackersManagerAbi, getAbi } from '@/lib/abis/tok'
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(config as any),
    query: {
      retry: true,
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })
}
