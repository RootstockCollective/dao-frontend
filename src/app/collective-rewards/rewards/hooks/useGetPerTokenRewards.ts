import { UseReadContractReturnType } from 'wagmi'

import { type RewardDistributorAbi } from '@/lib/abis/tok'
import { useReadRewardDistributor } from '@/shared/hooks/contracts'

export const useGetPerTokenRewards = (): Record<
  'rif' | 'rbtc' | 'usdrif',
  UseReadContractReturnType<
    RewardDistributorAbi,
    'defaultRifAmount' | 'defaultNativeAmount' | 'defaultUsdrifAmount'
  >
> => ({
  rif: useReadRewardDistributor({ functionName: 'defaultRifAmount' }),
  rbtc: useReadRewardDistributor({ functionName: 'defaultNativeAmount' }),
  usdrif: useReadRewardDistributor({ functionName: 'defaultUsdrifAmount' }),
})
