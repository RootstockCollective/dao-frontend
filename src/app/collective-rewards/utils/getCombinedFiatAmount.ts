import { formatEther } from 'viem'
import { RewardAmount } from '../rewards'
import Big from 'big.js'

export const getCombinedFiatAmount = (values: Array<RewardAmount>): Big => {
  return values.reduce((acc, { value, price }) => {
    const amountInEther = formatEther(value)
    return Big(acc).add(Big(amountInEther).mul(price))
  }, Big(0))
}
