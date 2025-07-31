import { RewardAmount } from '../types'
import Big from '@/lib/big'
import { getFiatAmount } from './formatter'

export const getCombinedFiatAmount = (values: Array<RewardAmount>): Big => {
  return values.reduce((acc, rewardAmount) => {
    return Big(acc).add(getFiatAmount(rewardAmount.value, rewardAmount.price))
  }, Big(0))
}
