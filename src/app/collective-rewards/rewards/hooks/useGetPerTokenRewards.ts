import { type RewardDistributorAbi } from '@/lib/abis/tok'
import { useReadRewardDistributor } from '@/shared/hooks/contracts'
import { UseReadContractReturnType } from 'wagmi'

export const useGetPerTokenRewards = (): Record<
  'rif' | 'rbtc',
  UseReadContractReturnType<RewardDistributorAbi, 'defaultRifAmount' | 'defaultNativeAmount'>
> => ({
  rif: useReadRewardDistributor({ functionName: 'defaultRifAmount' }),
  rbtc: useReadRewardDistributor({ functionName: 'defaultNativeAmount' }),
})
