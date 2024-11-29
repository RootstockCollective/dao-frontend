import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { UseReadContractReturnType } from 'wagmi'
import { useGetRewardsCoinbase, useGetRewardsERC20 } from '@/app/collective-rewards/rewards'

export const useGetPerTokenRewards = (): Record<
  'rif' | 'rbtc',
  UseReadContractReturnType<typeof BackersManagerAbi, 'rewardsERC20' | 'rewardsCoinbase'>
> => ({
  rif: useGetRewardsERC20(),
  rbtc: useGetRewardsCoinbase(),
})
