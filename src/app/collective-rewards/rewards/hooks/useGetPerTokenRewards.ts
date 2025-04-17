import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { useReadRewardDistributor } from '@/shared/hooks/contracts'
import { UseReadContractReturnType } from 'wagmi'

export const useGetPerTokenRewards = (): Record<
  'rif' | 'rbtc',
  UseReadContractReturnType<typeof BackersManagerAbi, 'rewardsERC20' | 'rewardsCoinbase'>
> => ({
  rif: useReadRewardDistributor({ functionName: 'defaultRewardTokenAmount' }),
  rbtc: useReadRewardDistributor({ functionName: 'defaultRewardCoinbaseAmount' }),
})
