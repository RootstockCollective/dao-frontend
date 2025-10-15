import { type BackersManagerAbi } from '@/lib/abis/v2'
import { RBTC, RIF, TokenSymbol } from '@/lib/tokens'
import { useReadRewardDistributor } from '@/shared/hooks/contracts'
import { UseReadContractReturnType } from 'wagmi'

export const useGetPerTokenRewards = (): Partial<Record<
  TokenSymbol,
  UseReadContractReturnType<BackersManagerAbi, 'rewardsERC20' | 'rewardsCoinbase'>
>> => ({
  [RIF]: useReadRewardDistributor({ functionName: 'defaultRewardTokenAmount' }),
  [RBTC]: useReadRewardDistributor({ functionName: 'defaultRewardCoinbaseAmount' }),
})
