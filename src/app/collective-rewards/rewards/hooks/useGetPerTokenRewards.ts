import { type BackersManagerAbi } from '@/lib/abis/v2'
import { useReadRewardDistributor } from '@/shared/hooks/contracts'
import { UseReadContractReturnType } from 'wagmi'

export const useGetPerTokenRewards = (): Record<
  'rif' | 'rbtc',
  UseReadContractReturnType<BackersManagerAbi, 'rewardsERC20' | 'rewardsCoinbase'>
> => ({
  rif: useReadRewardDistributor({ functionName: 'defaultRewardTokenAmount' }),
  rbtc: useReadRewardDistributor({ functionName: 'defaultRewardCoinbaseAmount' }),
})
