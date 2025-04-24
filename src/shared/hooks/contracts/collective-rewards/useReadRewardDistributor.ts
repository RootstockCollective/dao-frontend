import { getAbi, type RewardDistributorAbi } from '@/lib/abis/v2'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { RewardDistributorAddress } from '@/lib/contracts'
import { useReadContract, UseReadContractParameters, UseReadContractReturnType } from 'wagmi'
import { UseReadContractConfig, ViewPureFunctionName } from '../types'

type RewardDistributorFunctionName = ViewPureFunctionName<RewardDistributorAbi>

type RewardDistributorConfig<TFunctionName extends RewardDistributorFunctionName> = UseReadContractConfig<
  RewardDistributorAbi,
  TFunctionName
>

export const useReadRewardDistributor = <TFunctionName extends RewardDistributorFunctionName>(
  config: RewardDistributorConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<RewardDistributorAbi, TFunctionName>['query'], 'select'>,
): UseReadContractReturnType<RewardDistributorAbi, TFunctionName> => {
  return useReadContract({
    abi: getAbi('RewardDistributorAbi'),
    address: RewardDistributorAddress,
    ...(config as any),
    query: {
      retry: true,
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })
}
