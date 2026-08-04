import { RewardDistributorAbi } from '@/lib/abis/tok/RewardDistributorAbi'
import { RewardDistributorAddress } from '@/lib/contracts'

import { createContractReadHook } from '../createReadHooks'

export const useReadRewardDistributor = createContractReadHook(RewardDistributorAbi, RewardDistributorAddress)
