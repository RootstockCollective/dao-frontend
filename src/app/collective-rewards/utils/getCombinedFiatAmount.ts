import { formatEther } from 'viem'
import { RewardAmount } from '../rewards'
import Big from '@/lib/big'

export const getFiatAmount = (rewardAmount: RewardAmount): Big => {
  const amountInEther = formatEther(rewardAmount.value)
  return Big(amountInEther).mul(rewardAmount.price)
}

export const getCombinedFiatAmount = (values: Array<RewardAmount>): Big => {
  return values.reduce((acc, rewardAmount) => {
    return Big(acc).add(getFiatAmount(rewardAmount))
  }, Big(0))
}
