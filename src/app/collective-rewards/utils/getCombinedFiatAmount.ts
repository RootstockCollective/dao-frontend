import { formatEther } from 'viem'
import { RewardAmount } from '../rewards'

export const getCombinedFiatAmount = (values: Array<RewardAmount>): number => {
  return values.reduce((acc, { value, price }) => {
    const amountInEther = Number(formatEther(value))
    return acc + amountInEther * price
  }, 0)
}
