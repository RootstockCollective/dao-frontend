import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { UseReadContractReturnType } from 'wagmi'
import { useGetRewardsCoinbase } from './useGetRewardsCoinbase'
import { useGetRewardsERC20 } from './useGetRewardsERC20'

export const useGetPerTokenRewards = (): Record<
  'rif' | 'rbtc',
  UseReadContractReturnType<typeof BackersManagerAbi, 'rewardsERC20' | 'rewardsCoinbase'>
> => ({
  rif: useGetRewardsERC20(),
  rbtc: useGetRewardsCoinbase(),
})
