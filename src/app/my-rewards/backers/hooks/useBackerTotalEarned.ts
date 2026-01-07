import { Token, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { TOKENS } from '@/lib/tokens'

const useBackerRewardsPerToken = ({ address }: Token) => {
  const { data: backerRewards, isLoading, error } = useBackerRewardsContext()

  const { earned, claimed } = backerRewards[address]
  const totalEarned = Object.values(earned).reduce((acc, earned) => acc + earned, 0n)
  const totalClaimed = Object.values(claimed).reduce(
    (acc, value) => acc + value.reduce((acc, value) => acc + value.args.amount_, 0n),
    0n,
  )

  const total = totalEarned + totalClaimed

  return {
    amount: total,
    isLoading,
    error,
  }
}

export const useBackerTotalEarned = () => {
  const { rif, rbtc, usdrif } = TOKENS

  const rifData = useBackerRewardsPerToken(rif)
  const rbtcData = useBackerRewardsPerToken(rbtc)
  const usdrifData = useBackerRewardsPerToken(usdrif)

  return {
    rif: rifData,
    rbtc: rbtcData,
    usdrif: usdrifData,
  }
}
