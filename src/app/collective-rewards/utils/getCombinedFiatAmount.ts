import { formatEther } from 'viem'

import Big from '@/lib/big'

import { RewardAmount } from '../rewards'

export const getFiatAmount = (rewardAmount: RewardAmount): Big => {
  const amountInEther = formatEther(rewardAmount.value)
  return Big(amountInEther).mul(rewardAmount.price)
}

export const getCombinedFiatAmount = (values: Array<RewardAmount>): Big => {
  return values.reduce((acc, rewardAmount) => {
    return Big(acc).add(getFiatAmount(rewardAmount))
  }, Big(0))
}
